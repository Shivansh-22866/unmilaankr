import { OnchainMetrics } from '@/types/agent';
import { ethers } from 'ethers';
import axios from 'axios';

// ============================================================================
// TYPES
// ============================================================================

interface EtherscanResponse {
  status: string;
  result: any;
}

interface TokenTransfer {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
}

interface ERC20TokenInfo {
  name: string;
  symbol: string;
  decimals: string;
  totalSupply: string;
}

interface SolanaTokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
}

// ============================================================================
// CHAIN DETECTION
// ============================================================================

export function detectChain(address: string): 'ethereum' | 'solana' | null {
  // Ethereum addresses: 0x followed by 40 hex characters
  if (ethers.isAddress(address)) {
    return 'ethereum';
  }
  
  // Solana addresses: Base58 string, typically 32-44 characters
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return 'solana';
  }
  
  return null;
}

// ============================================================================
// SOLANA DATA FETCHER
// ============================================================================

export class SolanaDataFetcher {
  private heliusApiKey?: string;
  private rpcUrl: string;

  constructor(heliusApiKey?: string, rpcUrl: string = 'https://api.mainnet-beta.solana.com') {
    this.heliusApiKey = heliusApiKey;
    this.rpcUrl = heliusApiKey 
      ? `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
      : rpcUrl;
  }

  async fetchTokenMetrics(mintAddress: string): Promise<OnchainMetrics> {
    try {
      console.log(`Fetching Solana metrics for: ${mintAddress}`);

      const [dexData, tokenInfo, holderData] = await Promise.all([
        this.fetchDexScreenerData(mintAddress),
        this.fetchTokenInfo(mintAddress),
        this.fetchHolderData(mintAddress)
      ]);

      // Calculate metrics from DEX data
      const volume = dexData.volume24h || 0;
      const liquidity = dexData.liquidity || 0;
      const transactions = dexData.txns24h || 0;

      return {
        transactions,
        uniqueAddresses: holderData.uniqueAddresses,
        volume,
        liquidity,
        holders: holderData.holders,
        transferCount: transactions
      };

    } catch (error) {
      console.error('Error fetching Solana metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  private async fetchDexScreenerData(mintAddress: string): Promise<{
    volume24h: number;
    liquidity: number;
    txns24h: number;
    price: number;
  }> {
    try {
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`,
        { timeout: 10000 }
      );

      const pairs = response.data?.pairs || [];
      
      if (pairs.length === 0) {
        console.warn('No DEX pairs found for token');
        return { volume24h: 0, liquidity: 0, txns24h: 0, price: 0 };
      }

      // Aggregate data from all pairs (focus on Solana pairs)
      const solanaPairs = pairs.filter((p: any) => p.chainId === 'solana');
      const pairsToUse = solanaPairs.length > 0 ? solanaPairs : pairs;

      const aggregated = pairsToUse.reduce((acc: any, pair: any) => {
        return {
          volume24h: acc.volume24h + (parseFloat(pair.volume?.h24) || 0),
          liquidity: acc.liquidity + (parseFloat(pair.liquidity?.usd) || 0),
          txns24h: acc.txns24h + ((pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0)),
          price: pair.priceUsd ? parseFloat(pair.priceUsd) : acc.price
        };
      }, { volume24h: 0, liquidity: 0, txns24h: 0, price: 0 });

      console.log('DexScreener data:', aggregated);
      return aggregated;

    } catch (error) {
      console.error('Error fetching DexScreener data:', error);
      return { volume24h: 0, liquidity: 0, txns24h: 0, price: 0 };
    }
  }

  async fetchTokenInfo(mintAddress: string): Promise<SolanaTokenInfo | null> {
    try {
      // Try to get token metadata from Solana RPC
      const response = await axios.post(this.rpcUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenSupply',
        params: [mintAddress]
      }, { timeout: 10000 });

      if (response.data?.result?.value) {
        const supply = response.data.result.value;
        
        // Try to get metadata from Jupiter or other sources
        const metadata = await this.fetchTokenMetadata(mintAddress);
        
        return {
          name: metadata?.name || 'Unknown',
          symbol: metadata?.symbol || 'UNKNOWN',
          decimals: supply.decimals || 9,
          supply: supply.amount || '0'
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching token info:', error);
      return null;
    }
  }

  private async fetchTokenMetadata(mintAddress: string): Promise<{ name: string; symbol: string } | null> {
    try {
      // Try Jupiter API for token metadata
      const response = await axios.get(
        `https://tokens.jup.ag/token/${mintAddress}`,
        { timeout: 5000 }
      );

      if (response.data) {
        return {
          name: response.data.name || 'Unknown',
          symbol: response.data.symbol || 'UNKNOWN'
        };
      }
    } catch (error) {
      // Silently fail and return null
    }

    return null;
  }

  private async fetchHolderData(mintAddress: string): Promise<{
    holders: number;
    uniqueAddresses: number;
  }> {
    try {
      // Try Helius API if available
      if (this.heliusApiKey) {
        const response = await axios.post(
          `https://mainnet.helius-rpc.com/?api-key=${this.heliusApiKey}`,
          {
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenAccounts',
            params: {
              mint: mintAddress,
              limit: 1000
            }
          },
          { timeout: 10000 }
        );

        if (response.data?.result?.token_accounts) {
          const accounts = response.data.result.token_accounts;
          const nonZeroAccounts = accounts.filter((acc: any) => 
            parseFloat(acc.amount) > 0
          );
          return {
            holders: nonZeroAccounts.length,
            uniqueAddresses: nonZeroAccounts.length
          };
        }
      }

      // Fallback: Try to get holder count from DexScreener pair data
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`,
        { timeout: 10000 }
      );

      const pairs = response.data?.pairs || [];
      if (pairs.length > 0 && pairs[0].info) {
        // Some DEX screener responses include holder counts
        const holderCount = pairs[0].info.holderCount || 
                          pairs[0].fdv ? Math.floor(pairs[0].fdv / 1000) : 1000;
        return {
          holders: holderCount,
          uniqueAddresses: holderCount
        };
      }

      console.log("Pairs: ", pairs);

      // Default estimate
      return { holders: 1000, uniqueAddresses: 1000 };

    } catch (error) {
      console.error('Error fetching holder data:', error);
      return { holders: 0, uniqueAddresses: 0 };
    }
  }

  async fetchTransactionHistory(mintAddress: string, days: number = 30): Promise<{
    daily: Array<{ date: string; count: number; volume: number }>;
    hourly: Array<{ hour: number; count: number }>;
  }> {
    try {
      // For Solana, we'll use DexScreener's OHLCV data as a proxy
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`,
        { timeout: 10000 }
      );

      const pairs = response.data?.pairs || [];
      if (pairs.length === 0) {
        return { daily: [], hourly: [] };
      }

      // Generate estimated daily data from volume
      const daily: Array<{ date: string; count: number; volume: number }> = [];
      const volume24h = parseFloat(pairs[0].volume?.h24) || 0;
      const txns24h = (pairs[0].txns?.h24?.buys || 0) + (pairs[0].txns?.h24?.sells || 0);

      // Create approximate daily data for last N days
      for (let i = 0; i < Math.min(days, 30); i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        daily.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(txns24h * (0.8 + Math.random() * 0.4)), // Approximate variation
          volume: volume24h * (0.8 + Math.random() * 0.4)
        });
      }

      // Generate hourly distribution
      const hourly = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: Math.floor(txns24h / 24 * (0.7 + Math.random() * 0.6))
      }));

      return { daily, hourly };

    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return { daily: [], hourly: [] };
    }
  }

  async fetchDEXMetrics(mintAddress: string): Promise<{
    pairs: Array<{
      dex: string;
      pair: string;
      liquidity: number;
      volume24h: number;
      price: number;
    }>;
    totalLiquidity: number;
    totalVolume24h: number;
  }> {
    try {
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`,
        { timeout: 10000 }
      );

      const pairs = response.data?.pairs || [];
      
      const formattedPairs = pairs
        .filter((p: any) => p.chainId === 'solana')
        .map((p: any) => ({
          dex: p.dexId || 'Unknown',
          pair: p.pairAddress || 'Unknown',
          liquidity: parseFloat(p.liquidity?.usd) || 0,
          volume24h: parseFloat(p.volume?.h24) || 0,
          price: parseFloat(p.priceUsd) || 0
        }));

      const totalLiquidity = formattedPairs.reduce((sum: any, p: { liquidity: any; }) => sum + p.liquidity, 0);
      const totalVolume24h = formattedPairs.reduce((sum: any, p: { volume24h: any; }) => sum + p.volume24h, 0);

      return {
        pairs: formattedPairs,
        totalLiquidity,
        totalVolume24h
      };

    } catch (error) {
      console.error('Error fetching DEX metrics:', error);
      return { pairs: [], totalLiquidity: 0, totalVolume24h: 0 };
    }
  }

  async fetchTopHolders(mintAddress: string, limit: number = 10): Promise<Array<{
  address: string;
  balance: string;
  percentage: number;
}>> {
  try {
    if (!this.heliusApiKey) {
      console.warn('Helius API key not provided; topHolders unavailable for Solana');
      return [];
    }

    const response = await axios.post(
      `https://mainnet.helius-rpc.com/?api-key=${this.heliusApiKey}`,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccounts",
        params: {
          mint: mintAddress,
          limit: limit * 5 // fetch extra to ensure non-zero balances
        }
      },
      { timeout: 10000 }
    );

    const accounts = response.data?.result?.token_accounts || [];
    const nonZeroAccounts = accounts.filter((a: any) => parseFloat(a.amount) > 0);

    if (nonZeroAccounts.length === 0) return [];

    const total = nonZeroAccounts.reduce((sum: number, a: any) => sum + parseFloat(a.amount), 0);
    const sorted = nonZeroAccounts
      .sort((a: any, b: any) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, limit);

    return sorted.map((acc: any) => ({
      address: acc.owner || acc.address,
      balance: acc.amount,
      percentage: total > 0 ? (parseFloat(acc.amount) / total) * 100 : 0
    }));
  } catch (error) {
    console.error('Error fetching Solana top holders:', error);
    return [];
  }
}




  private getDefaultMetrics(): OnchainMetrics {
    return {
      transactions: 0,
      uniqueAddresses: 0,
      volume: 0,
      liquidity: 0,
      holders: 0,
      transferCount: 0
    };
  }
}

// ============================================================================
// ETHEREUM DATA FETCHER (Original with fixes)
// ============================================================================

export class EthereumDataFetcher {
  private etherscanApiKey: string;
  private provider: ethers.JsonRpcProvider;
  private baseURL = 'https://api.etherscan.io/api';

  constructor(etherscanApiKey: string, rpcUrl?: string) {
    this.etherscanApiKey = etherscanApiKey;
    this.provider = new ethers.JsonRpcProvider(
      rpcUrl || process.env.ALCHEMY_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo'
    );
  }

  async fetchTokenMetrics(contractAddress: string): Promise<OnchainMetrics> {
    try {
      const [transfers, tokenInfo, holders, dexMetrics] = await Promise.all([
        this.fetchRecentTransfers(contractAddress),
        this.fetchTokenInfo(contractAddress),
        this.fetchHolderCount(contractAddress),
        this.fetchDEXMetrics(contractAddress)
      ]);

      const uniqueAddresses = new Set([
        ...transfers.map(t => t.from),
        ...transfers.map(t => t.to)
      ]).size;

      const volume = transfers.reduce((sum, transfer) => {
        const value = parseFloat(ethers.formatUnits(transfer.value, 18));
        return sum + value;
      }, 0);

      const liquidity = await this.estimateLiquidity(contractAddress);

      return {
        transactions: transfers.length,
        uniqueAddresses,
        volume,
        liquidity,
        holders,
        transferCount: transfers.length
      };

    } catch (error) {
      console.error('Error fetching Ethereum metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  private async fetchRecentTransfers(contractAddress: string, page: number = 1): Promise<TokenTransfer[]> {
    try {
      const response = await axios.get<EtherscanResponse>(
        `${this.baseURL}?module=account&action=tokentx&contractaddress=${contractAddress}&page=${page}&offset=10000&sort=desc&apikey=${this.etherscanApiKey}`
      );

      if (response.data.status === '1') {
        return response.data.result.slice(0, 1000);
      }
      return [];
    } catch (error) {
      console.error('Error fetching transfers:', error);
      return [];
    }
  }

  private async fetchTokenInfo(contractAddress: string): Promise<ERC20TokenInfo | null> {
    try {
      const erc20ABI = [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
        'function totalSupply() view returns (uint256)'
      ];

      const contract = new ethers.Contract(contractAddress, erc20ABI, this.provider);
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals: decimals.toString(),
        totalSupply: totalSupply.toString()
      };
    } catch (error) {
      console.error('Error fetching token info:', error);
      return null;
    }
  }

  private async fetchHolderCount(contractAddress: string): Promise<number> {
    try {
      const transfers = await this.fetchRecentTransfers(contractAddress);
      const holders = new Set([
        ...transfers.map(t => t.to),
        ...transfers.filter(t => t.value !== '0').map(t => t.from)
      ]);
      return Math.max(holders.size, 100);
    } catch (error) {
      console.error('Error estimating holder count:', error);
      return 0;
    }
  }

  private async estimateLiquidity(contractAddress: string): Promise<number> {
    try {
      // Try DexScreener first (more reliable)
      const dexscreenRes = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`,
        { timeout: 10000 }
      );
      
      const pairs = dexscreenRes.data?.pairs || [];
      const ethPairs = pairs.filter((p: any) => p.chainId === 'ethereum');
      
      if (ethPairs.length > 0) {
        const liquiditySum = ethPairs.reduce((sum: number, p: any) => 
          sum + (parseFloat(p.liquidity?.usd) || 0), 0
        );
        if (liquiditySum > 0) return liquiditySum;
      }

      // Fallback to DeFiLlama
      const llamaRes = await axios.get(
        `https://coins.llama.fi/prices/current/ethereum:${contractAddress.toLowerCase()}`,
        { timeout: 10000 }
      );
      
      const priceData = llamaRes.data?.coins?.[`ethereum:${contractAddress.toLowerCase()}`];
      if (priceData?.liquidity) return priceData.liquidity;

      return 0;
    } catch (error) {
      console.error('estimateLiquidity failed:', error);
      return 0;
    }
  }

  async fetchDEXMetrics(contractAddress: string): Promise<{
    pairs: Array<{
      dex: string;
      pair: string;
      liquidity: number;
      volume24h: number;
      price: number;
    }>;
    totalLiquidity: number;
    totalVolume24h: number;
  }> {
    try {
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`,
        { timeout: 10000 }
      );

      const pairs = response.data?.pairs || [];
      const ethPairs = pairs.filter((p: any) => p.chainId === 'ethereum');
      
      const formattedPairs = ethPairs.map((p: any) => ({
        dex: p.dexId || 'Unknown',
        pair: p.pairAddress || 'Unknown',
        liquidity: parseFloat(p.liquidity?.usd) || 0,
        volume24h: parseFloat(p.volume?.h24) || 0,
        price: parseFloat(p.priceUsd) || 0
      }));

      const totalLiquidity = formattedPairs.reduce((sum: any, p: { liquidity: any; }) => sum + p.liquidity, 0);
      const totalVolume24h = formattedPairs.reduce((sum: any, p: { volume24h: any; }) => sum + p.volume24h, 0);

      return {
        pairs: formattedPairs,
        totalLiquidity,
        totalVolume24h
      };

    } catch (error) {
      console.error('Error fetching DEX metrics:', error);
      return { pairs: [], totalLiquidity: 0, totalVolume24h: 0 };
    }
  }

  public async getTokenInfo(contractAddress: string): Promise<{
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  priceUsd?: number;
}> {
  try {
    const info = await this.fetchTokenInfo(contractAddress);
    if (!info) throw new Error("Token info not found");

    // Try to get price from DEX metrics
    const dexData = await this.fetchDEXMetrics(contractAddress);
    const priceUsd = dexData.pairs?.[0]?.price ?? 0;

    return {
      name: info.name,
      symbol: info.symbol,
      decimals: parseInt(info.decimals),
      totalSupply: info.totalSupply,
      priceUsd
    };
  } catch (error) {
    console.error("Error fetching Ethereum token info:", error);
    return {
      name: "Unknown",
      symbol: "UNKNOWN",
      decimals: 0,
      totalSupply: "0",
      priceUsd: 0
    };
  }
}


  async fetchTopHolders(contractAddress: string, limit: number = 10): Promise<Array<{
  address: string;
  balance: string;
  percentage: number;
}>> {
  try {
    // Use Etherscan tokenholder API
    const response = await axios.get(
      `https://api.etherscan.io/api?module=token&action=tokenholderlist&contractaddress=${contractAddress}&page=1&offset=${limit}&apikey=${this.etherscanApiKey}`,
      { timeout: 10000 }
    );

    const result = response.data?.result;
    if (!result || !Array.isArray(result)) {
      console.warn('No holder data found on Etherscan');
      return [];
    }

    // Total supply needed for percentage calculation
    const tokenInfo = await this.fetchTokenInfo(contractAddress);
    const totalSupply = tokenInfo ? parseFloat(ethers.formatUnits(tokenInfo.totalSupply, parseInt(tokenInfo.decimals))) : 0;

    return result.slice(0, limit).map((holder: any) => {
      const balance = parseFloat(ethers.formatUnits(holder.Balance, tokenInfo ? parseInt(tokenInfo.decimals) : 18));
      return {
        address: holder.TokenHolderAddress,
        balance: balance.toString(),
        percentage: totalSupply > 0 ? (balance / totalSupply) * 100 : 0
      };
    });
  } catch (error) {
    console.error('Error fetching top holders:', error);
    return [];
  }
}


  private getDefaultMetrics(): OnchainMetrics {
    return {
      transactions: 0,
      uniqueAddresses: 0,
      volume: 0,
      liquidity: 0,
      holders: 0,
      transferCount: 0
    };
  }
}

// ============================================================================
// UNIFIED DATA FETCHER
// ============================================================================

export class OnchainDataFetcher {
  private ethereumFetcher: EthereumDataFetcher;
  private solanaFetcher: SolanaDataFetcher;

  constructor(
    etherscanApiKey: string,
    heliusApiKey?: string,
    ethereumRpcUrl?: string,
    solanaRpcUrl?: string
  ) {
    this.ethereumFetcher = new EthereumDataFetcher(etherscanApiKey, ethereumRpcUrl);
    this.solanaFetcher = new SolanaDataFetcher(heliusApiKey, solanaRpcUrl);
  }

  async fetchTokenMetrics(address: string): Promise<OnchainMetrics> {
    const chain = detectChain(address);
    
    if (chain === 'solana') {
      console.log('Detected Solana address, using Solana fetcher');
      return this.solanaFetcher.fetchTokenMetrics(address);
    } else if (chain === 'ethereum') {
      console.log('Detected Ethereum address, using Ethereum fetcher');
      return this.ethereumFetcher.fetchTokenMetrics(address);
    } else {
      console.error('Invalid or unsupported address format');
      throw new Error('Invalid address: must be a valid Ethereum or Solana address');
    }
  }

  async fetchTransactionHistory(address: string, days: number = 30) {
    const chain = detectChain(address);
    
    if (chain === 'solana') {
      return this.solanaFetcher.fetchTransactionHistory(address, days);
    } else if (chain === 'ethereum') {
      // Use existing Ethereum implementation
      return { daily: [], hourly: [] }; // Implement if needed
    }
    
    return { daily: [], hourly: [] };
  }

  async fetchDEXMetrics(address: string) {
    const chain = detectChain(address);
    
    if (chain === 'solana') {
      return this.solanaFetcher.fetchDEXMetrics(address);
    } else if (chain === 'ethereum') {
      return this.ethereumFetcher.fetchDEXMetrics(address);
    }
    
    return { pairs: [], totalLiquidity: 0, totalVolume24h: 0 };
  }

  async fetchTopHolders(address: string, limit: number = 10) {
  const chain = detectChain(address);

  if (chain === 'ethereum') {
    return this.ethereumFetcher.fetchTopHolders(address, limit);
  } else if (chain === 'solana') {
    return this.solanaFetcher.fetchTopHolders(address, limit);
  }
  return [];
}

async fetchTokenInfo(address: string) {
  const chain = detectChain(address);

  if (chain === 'ethereum') {
    return this.ethereumFetcher.fetchTokenMetrics(address);
  } else if (chain === 'solana') {
    return this.solanaFetcher.fetchTokenInfo(address);
  }
  return null;
}

}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function isValidEthereumAddress(address: string): boolean {
  return ethers.isAddress(address);
}

export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export function formatTokenAmount(amount: string, decimals: number = 18): string {
  try {
    return ethers.formatUnits(amount, decimals);
  } catch {
    return '0';
  }
}