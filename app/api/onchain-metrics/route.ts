import { type NextRequest, NextResponse } from "next/server"
import { OnchainDataFetcher, isValidEthereumAddress } from "@/lib/data/onchain"

export async function POST(request: NextRequest) {
  try {
    const { contractAddress } = await request.json()

    if (!contractAddress) {
      return NextResponse.json({ success: false, error: "Contract address is required" }, { status: 400 })
    }

    // Validate Ethereum address
    if (!isValidEthereumAddress(contractAddress)) {
      return NextResponse.json({ success: false, error: "Invalid Ethereum contract address" }, { status: 400 })
    }

    // Initialize onchain data fetcher
    const onchainFetcher = new OnchainDataFetcher(process.env.ETHERSCAN_API_KEY!, process.env.ALCHEMY_RPC_URL!)

    // Fetch onchain metrics
    const [metrics, transactionHistory, dexMetrics, topHolders] = await Promise.all([
      onchainFetcher.fetchTokenMetrics(contractAddress),
      onchainFetcher.fetchTransactionHistory(contractAddress, 30),
      onchainFetcher.fetchDEXMetrics(contractAddress),
      onchainFetcher.fetchTopHolders(contractAddress, 10),
    ])

    // Try to fetch token info (might fail for non-ERC20 contracts)
    const tokenInfo = null
    try {
      // This would be implemented in your OnchainDataFetcher
      // tokenInfo = await onchainFetcher.fetchTokenInfo(contractAddress)
    } catch (error) {
      console.log("Could not fetch token info - might not be an ERC20 token")
    }

    return NextResponse.json({
      success: true,
      metrics,
      tokenInfo,
      transactionHistory,
      dexMetrics,
      topHolders,
    })
  } catch (error) {
    console.error("Error fetching onchain metrics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch onchain metrics" }, { status: 500 })
  }
}
