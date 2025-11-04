// pages/api/twitter/premium-analytics.ts
import { type NextRequest, NextResponse } from "next/server";
import { TwitterPremiumScraper, PremiumTwitterMetrics } from "@/lib/data/twitter-premium";

export async function POST(request: NextRequest) {
  try {
    const { handle, since, until, tweetLimit, mentionLimit } = await request.json();

    if (!handle) {
      return NextResponse.json(
        { success: false, error: "Twitter handle is required" },
        { status: 400 }
      );
    }

    // Validate tweetLimit and mentionLimit (ensuring they are reasonable)
    const validatedTweetLimit = tweetLimit && tweetLimit > 0 && tweetLimit <= 100 ? tweetLimit : 40;
    const validatedMentionLimit = mentionLimit && mentionLimit > 0 && mentionLimit <= 100 ? mentionLimit : 40;

    const scraper = new TwitterPremiumScraper();

    // Fetch metrics
    const metrics: PremiumTwitterMetrics = await scraper.calculatePremiumMetrics(handle, {
      tweetLimit: validatedTweetLimit,
      since,
      until,
      includeFollowersGrowth: true,
      includeImpressions: true,
      mentionLimit: validatedMentionLimit,
    });

    return NextResponse.json({
      success: true,
      handle,
      metrics,
    });

  } catch (error: any) {
    console.error("Error fetching premium Twitter analytics:", error);

    // Handle specific error cases
    if (error.message.includes("Rate limit")) {
      return NextResponse.json(
        { success: false, error: "API rate limit reached. Please try again later." },
        { status: 429 }
      );
    }

    // Fallback for general errors
    return NextResponse.json(
      { success: false, error: "Failed to fetch premium Twitter analytics" },
      { status: 500 }
    );
  }
}
