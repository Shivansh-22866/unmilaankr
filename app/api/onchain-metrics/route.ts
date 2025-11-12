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

    console.log(`Fetching comprehensive analysis for ${chain} address: ${contractAddress}`)

    // --- MODIFIED SECTION ---
    // Instead of 5 parallel calls, we make one call to the comprehensive method.
    // This method handles all the individual fetching and analysis internally.
    const analysis = await onchainFetcher.getComprehensiveAnalysis(contractAddress)

    return NextResponse.json({
      success: true,
      chain,
      ...analysis // Spread the entire analysis object into the response
    })
    // --- END MODIFIED SECTION ---

  } catch (error) {
    console.error("Error fetching onchain metrics:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch onchain metrics"

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}