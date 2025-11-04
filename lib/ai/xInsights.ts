'use server'

import { generateObject } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'

interface Tweet {
  text: string
  likes: number
  retweets: number
  replies: number
  timestamp: string
  author: string
}

interface Mention {
  author: string
  text: string
  timestamp: string
}

interface TwitterMetrics {
  tweets: Tweet[]
  mentions?: Mention[]
}

const schema = z.object({
  summary: z.string(),
  engagementLevel: z.enum(['low', 'moderate', 'high']),
  suggestions: z.array(z.string().min(5))
})

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!
})

function batchArray<T>(arr: T[], batchSize: number): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < arr.length; i += batchSize) {
    batches.push(arr.slice(i, i + batchSize))
  }
  return batches
}

function aggregateTweetStats(tweets: Tweet[]) {
  const totalTweets = tweets.length
  const totalLikes = tweets.reduce((sum, t) => sum + t.likes, 0)
  const totalRetweets = tweets.reduce((sum, t) => sum + t.retweets, 0)
  const totalReplies = tweets.reduce((sum, t) => sum + t.replies, 0)

  const averageLikes = totalTweets ? totalLikes / totalTweets : 0
  const averageRetweets = totalTweets ? totalRetweets / totalTweets : 0
  const averageReplies = totalTweets ? totalReplies / totalTweets : 0

  // Compute top contributors by tweet count
  const userCounts: Record<string, number> = {}
  tweets.forEach(tweet => {
    userCounts[tweet.author] = (userCounts[tweet.author] || 0) + 1
  })

  const topUsers = Object.entries(userCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([username, count]) => ({ username, count }))

  return { totalTweets, averageLikes, averageRetweets, averageReplies, topUsers }
}

export async function generateTwitterInsightBatched(metrics: TwitterMetrics): Promise<z.infer<typeof schema>> {
  // Batch tweets (20 per batch)
  const tweetBatches = batchArray(metrics.tweets, 20)
  
  // Batch mentions (50 per batch, max 101)
  const mentionBatches = metrics.mentions ? batchArray(metrics.mentions, 50) : []

  const aggregatedTweets: Tweet[] = []
  const aggregatedMentions: Mention[] = []

  for (const batch of tweetBatches) aggregatedTweets.push(...batch)
  for (const batch of mentionBatches) aggregatedMentions.push(...batch)

  const tweetStats = aggregateTweetStats(aggregatedTweets)

  // Prepare prompt
  const prompt = `
Analyze the following Twitter activity metrics, including both user tweets and mentions, the tweets and mentions are the recent ones, don't assume that they are all there is. Provide a concise summary, engagement level, and suggestions.

Tweet Metrics:
- Total Tweets: ${tweetStats.totalTweets}
- Average Likes: ${tweetStats.averageLikes.toFixed(2)}
- Average Retweets: ${tweetStats.averageRetweets.toFixed(2)}
- Average Replies: ${tweetStats.averageReplies.toFixed(2)}
- Top Contributors: ${tweetStats.topUsers.map(u => `${u.username} (${u.count} tweets)`).join(', ')}

Mentions:
- Total Mentions: ${aggregatedMentions.length}
- Example Mentions: ${aggregatedMentions.slice(0, 5).map(m => `"${m.text}" by ${m.author}`).join('; ')}

Respond with a JSON object containing:
1. summary: concise analysis of overall Twitter activity.
2. engagementLevel: one of 'low', 'moderate', or 'high'.
3. suggestions: 2-3 actionable recommendations to improve engagement.
`

  const result = await generateObject({
    model: groq('llama-3.3-70b-versatile'),
    schema,
    prompt
  })

  return result.object
}
