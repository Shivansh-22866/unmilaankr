import { OnchainMetrics } from '@/types/agent';
import { ethers } from 'ethers';
import axios from 'axios';

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

export class OnchainDataFetcher {
  private etherscanApiKey: string;
  private provider: ethers.JsonRpcProvider;
  private baseURL = 'https://api.etherscan.io/api';

  constructor(etherscanApiKey: string, rpcUrl: string = 'https://eth-mainnet.g.alchemy.com/v2/demo') {
    this.etherscanApiKey = etherscanApiKey;
    this.provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL!);
  }

  async fetchTokenMetrics(contractAddress: string): Promise<OnchainMetrics> {
    try {
      const [transfers, tokenInfo, holders, dexMetrics] = await Promise.all([
        this.fetchRecentTransfers(contractAddress),
        this.fetchTokenInfo(contractAddress),
        this.fetchHolderCount(contractAddress),
        this.fetchDEXMetrics(contractAddress)
      ]);

      // Calculate metrics from transfers
      const uniqueAddresses = new Set([
        ...transfers.map(t => t.from),
        ...transfers.map(t => t.to)
      ]).size;

      const volume = transfers.reduce((sum, transfer) => {
        const value = parseFloat(ethers.formatUnits(transfer.value, 18));
        return sum + value;
      }, 0);

      // Get liquidity data (simplified - in production, query DEX contracts)
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
      console.error('Error fetching onchain metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  private async fetchRecentTransfers(contractAddress: string, page: number = 1): Promise<TokenTransfer[]> {
    try {
      const response = await axios.get<EtherscanResponse>(
        `${this.baseURL}?module=account&action=tokentx&contractaddress=${contractAddress}&page=${page}&offset=10000&sort=desc&apikey=${this.etherscanApiKey}`
      );

      if (response.data.status === '1') {
        return response.data.result.slice(0, 1000); // Limit to recent 1000 transfers
      }
      return [];
    } catch (error) {
      console.error('Error fetching transfers:', error);
      return [];
    }
  }

  private async fetchTokenInfo(contractAddress: string): Promise<ERC20TokenInfo | null> {
    try {
      // Create contract instance
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
      // This would typically require a more sophisticated approach
      // For demo purposes, we'll estimate based on recent transfers
      const transfers = await this.fetchRecentTransfers(contractAddress);
      
      // Count unique holders from recent transfers
      const holders = new Set([
        ...transfers.map(t => t.to),
        ...transfers.filter(t => t.value !== '0').map(t => t.from)
      ]);
      
      // This is a rough estimate - in production, you'd query a service like Moralis
      return Math.max(holders.size, 100); // Minimum reasonable holder count
    } catch (error) {
      console.error('Error estimating holder count:', error);
      return 0;
    }
  }

private async estimateLiquidity(contractAddress: string): Promise<number> {
  try {
    const query = `
      {
        pools(where: { token0: "${contractAddress.toLowerCase()}" }) {
          totalValueLockedUSD
        }
      }
    `;
    const res = await axios.post('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', { query });

    const pools = res.data?.data?.pools || [];
    if (pools.length > 0) {
      return pools.reduce((sum: number, pool: any) => sum + parseFloat(pool.totalValueLockedUSD || '0'), 0);
    }

    console.warn('Uniswap returned 0 pools. Trying DeFiLlama...');

    const llamaRes = await axios.get(`https://coins.llama.fi/prices/current/ethereum:${contractAddress.toLowerCase()}`);
    const priceData = llamaRes.data?.coins?.[`ethereum:${contractAddress.toLowerCase()}`];
    if (priceData?.liquidity) return priceData.liquidity;

    console.warn('DeFiLlama had no data. Trying Dexscreener...');

    // Step 3: Dexscreener fallback
    const dexscreenRes = await axios.get(`https://api.dexscreener.com/latest/dex/search/?q=${contractAddress}`);
    // console.log(dexscreenRes.data)
    const pairs = dexscreenRes.data?.pairs || [];

    if (pairs.length > 0) {
      const liquiditySum = pairs.reduce((sum: number, p: any) => sum + (p.liquidity?.usd || 0), 0);
      return liquiditySum;
    }

    console.warn('Dexscreener returned 0 pairs. Returning fallback value.');

    return 0;
  } catch (error) {
    console.error('estimateLiquidity failed:', error);
    return 0;
  }
}


  async fetchTransactionHistory(contractAddress: string, days: number = 30): Promise<{
    daily: Array<{ date: string; count: number; volume: number }>;
    hourly: Array<{ hour: number; count: number }>;
  }> {
    try {
      const transfers = await this.fetchRecentTransfers(contractAddress);
      
      // Filter transfers from last N days
      const cutoffTime = Date.now() / 1000 - (days * 24 * 60 * 60);
      const recentTransfers = transfers.filter(t => parseInt(t.timeStamp) > cutoffTime);
      
      // Group by day
      const dailyData = new Map<string, { count: number; volume: number }>();
      const hourlyData = new Array(24).fill(0).map(() => ({ count: 0 }));
      
      recentTransfers.forEach(transfer => {
        const date = new Date(parseInt(transfer.timeStamp) * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const hour = date.getHours();
        
        // Daily aggregation
        if (!dailyData.has(dateStr)) {
          dailyData.set(dateStr, { count: 0, volume: 0 });
        }
        const dayData = dailyData.get(dateStr)!;
        dayData.count++;
        dayData.volume += parseFloat(ethers.formatUnits(transfer.value, 18));
        
        // Hourly aggregation
        hourlyData[hour].count++;
      });
      
      return {
        daily: Array.from(dailyData.entries()).map(([date, data]) => ({
          date,
          count: data.count,
          volume: data.volume
        })),
        hourly: hourlyData.map((data, hour) => ({ hour, count: data.count }))
      };
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return { daily: [], hourly: [] };
    }
  }

async fetchTopHolders(contractAddress: string, limit: number = 50): Promise<Array<{
  address: string;
  balance: string;
  percentage: number;
}>> {
  try {
    const response = await axios.get(`https://eth-mainnet.alchemyapi.io/v2/${this.etherscanApiKey}/getTokenBalances`, {
      params: {
        contractAddress: contractAddress,
        tokenBalances: true,
        limit: limit,
      }
    });

    if (response.data && response.data.tokenBalances) {
      const holders = response.data.tokenBalances.map((holder: any) => ({
        address: holder.address,
        balance: holder.balance,
        percentage: parseFloat(holder.balance) / parseFloat(holder.totalSupply) * 100 // Assuming we have total supply
      }));

      return holders.sort((a: any, b: any) => parseFloat(b.balance) - parseFloat(a.balance)); // Sort by balance
    } else {
      console.warn('Error fetching top holders:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching top holders:', error);
    return [];
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
    const url = `https://coins.llama.fi/prices/current/ethereum:${contractAddress.toLowerCase()}`;
    const res = await axios.get(url);

    console.log("DEXMetrics: ",res.data)
    const tokenData = res.data?.coins?.[`ethereum:${contractAddress.toLowerCase()}`];

    if (!tokenData) {
      console.warn('No data found for token on DeFiLlama');
      return { pairs: [], totalLiquidity: 0, totalVolume24h: 0 };
    }

    const pair = {
      dex: 'DeFiLlama (aggregated)',
      pair: 'Unknown',
      liquidity: tokenData.liquidity ?? 0,
      volume24h: tokenData.volume_24h ?? 0,
      price: tokenData.price ?? 0
    };

    return {
      pairs: [pair],
      totalLiquidity: pair.liquidity,
      totalVolume24h: pair.volume24h
    };
  } catch (error) {
    console.error('Error fetching DEX metrics from DeFiLlama:', error);
    return { pairs: [], totalLiquidity: 0, totalVolume24h: 0 };
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

export function isValidEthereumAddress(address: string): boolean {
  return ethers.isAddress(address);
}

export function formatTokenAmount(amount: string, decimals: number = 18): string {
  try {
    return ethers.formatUnits(amount, decimals);
  } catch {
    return '0';
  }
}