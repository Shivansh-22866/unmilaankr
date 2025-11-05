// pages/api/twitter/premium-analytics.ts
import { type NextRequest, NextResponse } from "next/server";
import { TwitterPremiumScraper, PremiumTwitterMetrics } from "@/lib/data/twitter-premium";

// import { X402PaymentHandler } from '@payai/x402-solana/server';

// const x402 = new X402PaymentHandler({
//   network: 'solana',
//   treasuryAddress: "fiJ4qU5eTgdaFZi62haep2u3qweqKarqsLRk4XEX1Vf",
//   facilitatorUrl: 'https://facilitator.payai.network',
// });

export async function POST(request: NextRequest) {
  try {
    const { handle, since, until, tweetLimit, mentionLimit } = await request.json();

    if (!handle) {
      return NextResponse.json(
        { success: false, error: "Twitter handle is required" },
        { status: 400 }
      );
    }

    // const paymentHeader = x402.extractPayment(request.headers);

    // const paymentRequirements = await x402.createPaymentRequirements({
    //   price: {
    //     amount: "1000000000",
    //     asset: {
    //       address: "K9uxt28GvfPsQuapLU1rYxY1REAcZ9NMQ3SYwWbcyai",
    //       decimals: 9,
    //     }
    //   },
    //   network: 'solana',
    //   config: {
    //     description: 'Momentum Agent Execution - Signiq',
    //     resource: `https://signiq.xyz/api/x-premium`,
    //   }
    // });

    // if (!paymentHeader) {
    //   // Return 402 with payment requirements
    //   const response = x402.create402Response(paymentRequirements);
    //   console.log("Returning 402 response", response);
    //   return NextResponse.json(response.body, { status: response.status });
    // }

    // // 3. Verify payment
    // const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
    // console.log("Payment verified", verified);
    // if (!verified) {
    //   return NextResponse.json({ error: 'Invalid payment' }, { status: 402 });
    // }

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
