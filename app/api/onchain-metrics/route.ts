import { type NextRequest, NextResponse } from "next/server"
import { 
  OnchainDataFetcher, 
  detectChain, 
  isValidEthereumAddress, 
  isValidSolanaAddress 
} from "@/lib/data/onchain"

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

    // Validate address
    if (chain === "ethereum" && !isValidEthereumAddress(contractAddress)) {
      return NextResponse.json({ success: false, error: "Invalid Ethereum contract address" }, { status: 400 })
    }

    if (chain === "solana" && !isValidSolanaAddress(contractAddress)) {
      return NextResponse.json({ success: false, error: "Invalid Solana address" }, { status: 400 })
    }

    // Initialize unified fetcher
    const onchainFetcher = new OnchainDataFetcher(
      process.env.ETHERSCAN_API_KEY!,
      process.env.HELIUS_API_KEY, // Optional
      process.env.ALCHEMY_RPC_URL,
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"
    )

    console.log(`Fetching metrics for ${chain} address: ${contractAddress}`)

    // Fetch all core data concurrently
    const [metrics, transactionHistory, dexMetrics, tokenInfo, topHolders] = await Promise.all([
      onchainFetcher.fetchTokenMetrics(contractAddress),
      onchainFetcher.fetchTransactionHistory(contractAddress, 30),
      onchainFetcher.fetchDEXMetrics(contractAddress),
      onchainFetcher.fetchTokenInfo(contractAddress),
      onchainFetcher.fetchTopHolders(contractAddress, 10)
    ])

    return NextResponse.json({
      success: true,
      chain,
      tokenInfo,
      metrics,
      transactionHistory,
      dexMetrics,
      topHolders
    })

  } catch (error) {
    console.error("Error fetching onchain metrics:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch onchain metrics"

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}