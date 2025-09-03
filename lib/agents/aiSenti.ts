import { MomentumData, AnomalyAlert, TimeSeriesAllPoint } from "@/types/agent";
import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';

export async function analyzeWithGroq(insights: string) {
  const schema = z.object({
    summary: z.string(),
    outlook: z.enum(['bullish', 'bearish', 'neutral']),
    keySignals: z.array(z.string()),
    riskLevel: z.enum(['low', 'medium', 'high']),
    confidence: z.number().min(0).max(1),
    reason: z.string(),
    review: z.string(),
    narrative: z.string(),
    trendDelta: z.object({
      shortTerm: z.string(), // e.g., 'rising'
      longTerm: z.string(),  // e.g., 'stable'
      velocity: z.number()   // rate of change (arbitrary scale)
    }),
    signalAlignment: z.object({
      githubVsTwitter: z.enum(['aligned', 'diverging', 'inconclusive']),
      communityVsOnchain: z.enum(['aligned', 'diverging', 'inconclusive']),
    }),
    anomalyTrend: z.string(),
    relativePerformance: z.object({
      category: z.string(),
      rankPercentile: z.number().min(0).max(100),
      outperformingSignals: z.array(z.string())
    })
  });

  const result = await generateObject({
    model: groq('llama-3.3-70b-versatile'),
    schema,
    prompt: `
You are a Web3 intelligence analyst AI specialized in real-time signal processing. Given cross-domain input from GitHub, Twitter, Onchain data, community platforms, and anomalies, return the following structured fields:

- **summary**: Brief high-level snapshot of project momentum.
- **outlook**: One of 'bullish' | 'bearish' | 'neutral'.
- **keySignals**: Major signal shifts or events (e.g., surge in transactions or drop in contributors).
- **riskLevel**: Assess risk as 'low', 'medium', or 'high'.
- **confidence**: A number between 0 and 1 that reflects certainty in your prediction.
- **reason**: A clear explanation referencing relevant data streams. Highlight specific data points and changes (e.g., spike in commits, drop in sentiment).
- **review**: Which channel is underperforming or creating uncertainty.
- **narrative**: Describe the recent story arc of the project like a news brief, connecting data movements across time.
- **trendDelta**:
  - shortTerm: Describe short-term momentum direction (e.g., 'rising').
  - longTerm: Describe long-term trend behavior (e.g., 'stable').
  - velocity: Estimated speed of trend change.
- **signalAlignment**:
  - githubVsTwitter: Are social signals matching development signals?
  - communityVsOnchain: Are users active and are transactions moving?
- **anomalyTrend**: Summarize recent anomaly patterns across signals.
- **relativePerformance**:
  - category: Type of project (e.g., 'DeFi', 'NFT', 'L1').
  - rankPercentile: Rank relative to similar projects (0–100).
  - outperformingSignals: Signals where this project leads its peers.

Data:
${insights}
`
  });

  return result.object;
}

export function formatMomentumContext(data: MomentumData, alerts: AnomalyAlert[] = [], breakdown: TimeSeriesAllPoint[]): string {
  const alertText = alerts.length > 0
    ? alerts.map(alert => `- [${alert.metric}] ${alert.description} (Value: ${alert.value}, Expected: ${alert.expectedRange.join(" - ")})`).join("\n")
    : 'No recent anomaly alerts.';

  return `
# 🔍 Momentum Analysis Context

## 📦 GitHub Activity
- Stars: ${data.github.stars}
- Forks: ${data.github.forks}
- Commits: ${data.github.commits}
- Contributors: ${data.github.contributors}
- Issues: ${data.github.issues}
- Pull Requests: ${data.github.pullRequests}
- Releases: ${data.github.releases}
- Velocity: ${data.github.velocity.toFixed(2)} commits/day

## 🐦 Twitter Signals
- Mentions: ${data.twitter.mentions}
- Sentiment: ${data.twitter.sentiment.toFixed(2)}
- Engagement: ${data.twitter.engagement}
- Followers: ${data.twitter.followers}
- Likes: ${data.twitter.likes}
- Retweets: ${data.twitter.retweets}
- Impressions: ${data.twitter.impressions}

## 🧠 Community Interaction
- Discord Messages: ${data.interactionPatterns.discordMessages}
- Telegram Messages: ${data.interactionPatterns.telegramMessages}
- Reddit Posts: ${data.interactionPatterns.redditPosts}
- Medium Posts: ${data.interactionPatterns.mediumPosts}
- GitHub Discussions: ${data.interactionPatterns.githubDiscussions}
- Total Community Mentions: ${data.communityMentions}

## 🔗 Onchain Activity
- Transactions: ${data.onchain.transactions}
- Unique Addresses: ${data.onchain.uniqueAddresses}
- Volume: ${data.onchain.volume.toFixed(2)}
- Liquidity: $${data.onchain.liquidity.toFixed(2)}
- Holders: ${data.onchain.holders}
- Transfer Count: ${data.onchain.transferCount}

## 🧭 Federated Time-Series Breakdown
${breakdown.map(d => `- ${new Date(d.timestamp).toLocaleString()}: GitHub ${d.github.toFixed(2)}% • Social ${d.social.toFixed(2)}% • Onchain ${d.onchain.toFixed(2)}% • Community ${d.community.toFixed(2)}%`).join("\n")}

## ⚠️ Recent Anomaly Alerts
${alertText}

### Notes:
Use this context to understand trend direction, signal alignment, anomaly clusters, and cross-domain project health.
`;
}
