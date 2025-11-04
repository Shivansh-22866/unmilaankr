// lib/data/twitterPremiumFetcher.ts

import axios from "axios";
import { z } from "zod";

// ------------------------------------
// Interfaces
// ------------------------------------

export interface PremiumScrapedTweet {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  impressions?: number;
  bookmarks?: number;
}

export interface MentionedTweet {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  quoteCount?: number;
  viewCount?: number;
  bookmarkCount?: number;
}

export interface PremiumTwitterMetrics {
  handle: string;
  verifiedFollowersCount?: number;
  totalFollowersCount: number;
  followersGrowth?: {
    startCount: number;
    endCount: number;
    delta: number;
    rate: number;
  };
  impressions?: number;
  impressionsByDay?: Array<{ date: string; count: number }>;
  postsCountByDay?: Array<{ date: string; posts: number; replies: number }>;
  totalPostsCount: number;
  totalRepliesCount: number;
  likesCount: number;
  retweetsCount: number;
  bookmarksCount?: number;
  sharesCount?: number;
  profileVisitsCount?: number;
  engagementRate?: number;
  totalEngagements: number;
  sentimentScore: number;
  tweets: PremiumScrapedTweet[];
  mentionsCount: number;
  mentions?: MentionedTweet[];
}

// ------------------------------------
// API Helper
// ------------------------------------

const API_KEY = process.env.TWITTERAPI_IO_KEY;
const BASE_URL = "https://api.twitterapi.io";

async function apiGet(path: string, params: Record<string, any> = {}) {
  const url = `${BASE_URL}/${path}`;
  const headers = { "X-API-Key": API_KEY || "" };
  console.log(`🛠 apiGet: ${url} | params:`, params);
  const resp = await axios.get(url, { headers, params });
  // console.log(`🛠 apiGet response for ${path}:`, resp.data);
  return resp.data;
}

// ------------------------------------
// Sentiment Analyzer Stub
// ------------------------------------
// ------------------------------------
// Sentiment Analyzer (Real Implementation for Premium Scraper)
// ------------------------------------
export class AIsentimentAnalyzer {
  async analyzeTweetSentiment(tweet: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
    reasoning: string;
  }> {
    try {
      const prompt = `
Analyze the sentiment of this tweet:
"${tweet}"

Return a JSON object like:
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": -1 to 1,
  "confidence": 0 to 1,
  "reasoning": "brief explanation"
}
`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            { role: "system", content: "You are a sentiment analysis model." },
            { role: "user", content: prompt }
          ],
          temperature: 0.4
        })
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        const wait = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
        throw new Error(`Rate limit reached. Wait for ${wait}ms`);
      }

      const json = await response.json();
      const text = json.choices?.[0]?.message?.content;
      const match = text?.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in response");

      const parsed = JSON.parse(match[0]);
      const schema = z.object({
        sentiment: z.enum(["positive", "negative", "neutral"]),
        score: z.number().min(-1).max(1),
        confidence: z.number().min(0).max(1),
        reasoning: z.string()
      });

      return schema.parse(parsed);
    } catch (err) {
      console.error("❌ Sentiment analysis failed:", err);
      return {
        sentiment: "neutral",
        score: 0,
        confidence: 0,
        reasoning: "Failed analysis (default fallback)"
      };
    }
  }

  async analyzeBatchSentiments(tweets: { text: string }[]): Promise<Array<{
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
    reasoning: string;
  }>> {
    const results = [];
    const maxAnalyses = 20;

    for (const tweet of tweets.slice(0, maxAnalyses)) {
      const res = await this.analyzeTweetSentiment(tweet.text);
      results.push(res);
      await new Promise(res => setTimeout(res, 2500)); // Rate limit delay
    }

    return results;
  }
}


// ------------------------------------
// Scraper Class
// ------------------------------------

export class TwitterPremiumScraper {
  private analyzer = new AIsentimentAnalyzer();
  private id = "";

  async getUserInfo(userName: string) {
    // console.log(`🔍 getUserInfo for @${userName}`);
    const data = await apiGet("twitter/user/info", { userName });
    // console.log(`🔍 getUserInfo returned:`, data);
    this.id = data.data.id
    return data.data;
  }

  async getUserVerifiedFollowers(user_id: string) {
    console.log("🔍 getUserVerifiedFollowers for @", user_id);
    const data = await apiGet("twitter/user/verifiedFollowers", {user_id})

    return data.followers.length
  }

  // Pagination implemented to fetch up to `limit` tweets across pages
async getUserTweets(userName: string): Promise<any[]> {
  console.log(`🔍 getUserTweets for @${userName}`);

  try {
    const params = { userName };
    const resp = await apiGet("twitter/user/last_tweets", params);

    const tweets = resp?.data?.tweets ?? [];
    console.log(`✅ fetched ${tweets.length} tweets for @${userName}`);
    console.log(`🔍 getUserTweets returned:`, tweets);

return tweets.map((t: any): PremiumScrapedTweet => ({
  id: t.id,
  text: t.text || "",
  author: t.author?.userName || "unknown",
  timestamp: t.createdAt || "",
  likes: t.likeCount ?? 0,
  retweets: t.retweetCount ?? 0,
  replies: t.replyCount ?? 0,
  impressions: t.viewCount ?? 0,     // total views
  bookmarks: t.bookmarkCount ?? 0,   // total bookmarks
}));

  } catch (err) {
    console.error(`❌ Error fetching tweets for @${userName}:`, err);
    return [];
  }
}



  // Pagination implemented to fetch up to `limit` mentions across pages
  async getMentions(userName: string, limit: number = 40, since?: string, until?: string) {
    // console.log(`🔍 getMentions for @${userName}, limit=${limit}, since=${since}, until=${until}`);
    const collected: any[] = [];
    let cursor = "";
    let remaining = limit;

    while (remaining > 0) {
      const params: any = { userName, limit: Math.min(remaining, 40), cursor };
      if (since) params.sinceTime = since;
      if (until) params.untilTime = until;
      const resp = await apiGet("twitter/user/mentions", params);
      const pageTweets = resp.tweets ?? [];
      // console.log(`🔍 getMentions fetched page: count=${pageTweets.length}, cursorNext=${resp.next_cursor}`);
      collected.push(...pageTweets);
      remaining -= pageTweets.length;
      if (!resp.has_next_page || pageTweets.length === 0) {
        break;
      }
      cursor = resp.next_cursor;
    }

    // console.log(`🔍 getMentions total collected=${collected.length}`);
    return collected;
  }

  async calculatePremiumMetrics(
    handle: string,
    options: {
      tweetLimit?: number;
      since?: string;
      until?: string;
      includeFollowersGrowth?: boolean;
      includeImpressions?: boolean;
      mentionLimit?: number;
    } = {}
  ): Promise<PremiumTwitterMetrics> {
    // console.log(`🚀 calculatePremiumMetrics for @${handle} with options:`, options);
    const tweetLimit = options.tweetLimit ?? 100;
    const mentionLimit = options.mentionLimit ?? 100;

    // 1. Profile info
    const userInfo = await this.getUserInfo(handle);
    const totalFollowers = userInfo.followers ?? 0;
    const verifiedFollowers = await this.getUserVerifiedFollowers(this.id);
    // console.log(`👤 totalFollowers=${totalFollowers}, verifiedFollowers=${verifiedFollowers}`);

    const metrics: PremiumTwitterMetrics = {
      handle,
      verifiedFollowersCount: verifiedFollowers,
      totalFollowersCount: totalFollowers,
      totalPostsCount: 0,
      totalRepliesCount: 0,
      likesCount: 0,
      retweetsCount: 0,
      totalEngagements: 0,
      sentimentScore: 0,
      tweets: [],
      mentionsCount: 0
    };

    if (options.includeFollowersGrowth) {
      // console.log(`📈 Including followers growth`);
      const startCount = 0; // TODO: fetch from storage
      const endCount = totalFollowers;
      const delta = endCount - startCount;
      metrics.followersGrowth = {
        startCount,
        endCount,
        delta,
        rate: startCount ? delta / startCount : 0
      };
      // console.log(`📈 followersGrowth:`, metrics.followersGrowth);
    }

    // 2. Fetch user tweets
    const rawTweets = await this.getUserTweets(handle);
    // console.log(`📰 rawTweets length=${rawTweets.length}`);
const scraped: PremiumScrapedTweet[] = rawTweets.map((t: PremiumScrapedTweet) => ({
  ...t,
  id: `tweet_${t.id}`,
}));
    // console.log(`📰 scraped tweets:`, scraped);

    metrics.tweets = scraped;
    metrics.totalPostsCount = scraped.length;
    metrics.totalRepliesCount = scraped.reduce((sum, tw) => sum + tw.replies, 0);
    metrics.likesCount = scraped.reduce((sum, tw) => sum + tw.likes, 0);
    metrics.retweetsCount = scraped.reduce((sum, tw) => sum + tw.retweets, 0);

    const totalEngagement = scraped.reduce(
  (sum, tw) =>
    sum +
    (tw.likes ?? 0) +
    (tw.retweets ?? 0) +
    (tw.replies ?? 0) +
    (tw.bookmarks ?? 0),
  0
);
    metrics.totalEngagements = totalEngagement;
    // console.log(`📊 totalEngagement=${totalEngagement}`);

    if (options.includeImpressions) {
      const totImpr = scraped.reduce((sum, tw) => sum + (tw.impressions ?? 0), 0);
      metrics.impressions = totImpr;
      metrics.engagementRate = totImpr ? totalEngagement / totImpr : undefined;
      // console.log(`📊 impressions=${totImpr}, engagementRate=${metrics.engagementRate}`);
    } else {
      metrics.engagementRate = totalFollowers ? totalEngagement / totalFollowers : undefined;
      // console.log(`📊 engagementRate (via followers)=${metrics.engagementRate}`);
    }

    // 3. Fetch mentions
    const mentionTweets = await this.getMentions(handle, mentionLimit, options.since, options.until);
    // console.log(`💬 mentionTweets length=${mentionTweets.length}`);
    metrics.mentionsCount = mentionTweets.length;
    metrics.mentions = mentionTweets.map((t: any) => ({
      id: `mention_${t.id}`,
      text: t.text || "",
      author: t.author?.userName || t.author?.name || "unknown",
      timestamp: t.createdAt || "",
      likes: t.likeCount ?? 0,
      retweets: t.retweetCount ?? 0,
      replies: t.replyCount ?? 0,
      quoteCount: t.quoteCount ?? undefined,
      viewCount: t.viewCount ?? undefined,
      bookmarkCount: t.bookmarkCount ?? undefined
    }));
    // console.log(`💬 scraped mentions:`, metrics.mentions);

    // 4. Sentiment analysis
    const sentiments = await this.analyzer.analyzeBatchSentiments(scraped);
    // console.log(`🧠 sentiments:`, sentiments);
    const avgSentiment = sentiments.length
      ? sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length
      : 0;
    metrics.sentimentScore = avgSentiment;
    // console.log(`🧠 avgSentimentScore=${avgSentiment}`);

    // 5. Placeholders for unsupported metrics
    metrics.bookmarksCount = undefined;     // TODO
    metrics.sharesCount = undefined;        // TODO
    metrics.profileVisitsCount = undefined; // TODO
    metrics.postsCountByDay = undefined;    // TODO
    metrics.impressionsByDay = undefined;   // TODO

    // console.log(`✅ calculatePremiumMetrics complete for @${handle}`, metrics);
    return metrics;
  }
}
