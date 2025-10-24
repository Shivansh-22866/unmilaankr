import { type NextRequest, NextResponse } from "next/server"
import { OnchainDataFetcher, detectChain, isValidEthereumAddress, isValidSolanaAddress } from "@/lib/data/onchain"

export async function POST(request: NextRequest) {
  try {
    const { contractAddress } = await request.json()

    if (!contractAddress) {
      return NextResponse.json({ success: false, error: "Contract address is required" }, { status: 400 })
    }

    // Detect chain type
    const chain = detectChain(contractAddress)

    if (!chain) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid address format. Must be a valid Ethereum (0x...) or Solana address" 
        }, 
        { status: 400 }
      )
    }

    // Validate address format
    if (chain === 'ethereum' && !isValidEthereumAddress(contractAddress)) {
      return NextResponse.json({ success: false, error: "Invalid Ethereum contract address" }, { status: 400 })
    }

    if (chain === 'solana' && !isValidSolanaAddress(contractAddress)) {
      return NextResponse.json({ success: false, error: "Invalid Solana address" }, { status: 400 })
    }

    // Initialize multi-chain data fetcher
    const onchainFetcher = new OnchainDataFetcher(
      process.env.ETHERSCAN_API_KEY!,
      process.env.HELIUS_API_KEY, // Optional for Solana
      process.env.ALCHEMY_RPC_URL,
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    )

    console.log(`Fetching metrics for ${chain} address: ${contractAddress}`)

    // Fetch onchain metrics (automatically routes to correct chain)
    const [metrics, transactionHistory, dexMetrics] = await Promise.all([
      onchainFetcher.fetchTokenMetrics(contractAddress),
      onchainFetcher.fetchTransactionHistory(contractAddress, 30),
      onchainFetcher.fetchDEXMetrics(contractAddress),
    ])

    // Fetch top holders (Ethereum only for now)
    let topHolders: Array<{ address: string; balance: string; percentage: number }> = []
    
    if (chain === 'ethereum') {
      try {
        // Only available for Ethereum
        // topHolders = await onchainFetcher.fetchTopHolders(contractAddress, 10)
        console.log('Top holders feature not yet implemented for Ethereum')
      } catch (error) {
        console.log("Could not fetch top holders:", error)
      }
    }

    // Try to fetch token info
    let tokenInfo = null
    try {
      // Token info is fetched within fetchTokenMetrics
      // but we can expose it separately if needed
      if (chain === 'ethereum') {
        // For Ethereum, token info would come from ERC20 contract calls
        // This is already handled in the EthereumDataFetcher
      } else if (chain === 'solana') {
        // For Solana, token info comes from Solana RPC or Jupiter
        // This is already handled in the SolanaDataFetcher
      }
    } catch (error) {
      console.log("Could not fetch token info:", error)
    }

    return NextResponse.json({
      success: true,
      chain, // Include detected chain in response
      metrics,
      tokenInfo,
      transactionHistory,
      dexMetrics,
      topHolders,
    })
  } catch (error) {
    console.error("Error fetching onchain metrics:", error)
    
    // More detailed error messages
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch onchain metrics"
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      }, 
      { status: 500 }
    )
  }
}

// Optional: Add GET endpoint for quick health check
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({
      success: true,
      message: "Multi-chain onchain metrics API",
      supported_chains: ["ethereum", "solana"],
      usage: "POST with { contractAddress: '0x...' | 'base58...' }"
    })
  }

  const chain = detectChain(address)
  
  return NextResponse.json({
    success: true,
    address,
    detected_chain: chain,
    valid: chain !== null
  })
}