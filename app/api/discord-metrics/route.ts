import { type NextRequest, NextResponse } from "next/server"
import { DiscordDataFetcher } from "@/lib/data/discord"

export async function POST(request: NextRequest) {
  try {
    const { serverId, channelId } = await request.json()

    if (!serverId || !channelId) {
      return NextResponse.json({ success: false, error: "Server ID and Channel ID are required" }, { status: 400 })
    }

    // Initialize Discord data fetcher
    const discordFetcher = new DiscordDataFetcher()

    // Fetch Discord messages
    const result = await discordFetcher.fetchMessages(serverId, channelId, 100)

    // Mock server info (in production, you'd fetch this from Discord API)
    const serverInfo = {
      name: "Community Server",
      memberCount: 1500,
      channelName: "general",
    }

    return NextResponse.json({
      success: true,
      messages: result.messages,
      count: result.count,
      serverInfo,
    })
  } catch (error) {
    console.error("Error fetching Discord metrics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch Discord messages" }, { status: 500 })
  }
}
