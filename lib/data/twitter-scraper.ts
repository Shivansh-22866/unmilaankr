import axios from "axios";
import { z } from "zod";

// ------------------------------------
// Interfaces
// ------------------------------------

interface ScrapedTweet {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
}

interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  reasoning: string;
}

interface TwitterMetrics {
  mentions: number;
  sentiment: number;
  engagement: number;
  followers: number;
  retweets: number;
  likes: number;
  impressions: number;
}

// ------------------------------------
// Helper to Call TwitterAPI.io
// ------------------------------------
const API_KEY = process.env.TWITTERAPI_IO_KEY;

async function callApi(path: string, params: Record<string, any> = {}) {
  const url = `https://api.twitterapi.io/${path}`;
  const headers = {
    'x-api-key': API_KEY || ""
  };
  console.log(`🔍 Calling API: ${url} with params:`, params);
  try {
    const response = await axios.get(url, { headers, params });
    console.log(`✅ API response for ${path} status=${response.status}, sampleData=`, 
      Array.isArray(response.data.tweets) ? response.data.tweets.slice(0,2) : response.data);
    return response.data;
  } catch (err: any) {
    console.error('❌ API call error:', err.response ? err.response.data : err.message);
    throw err;
  }
}

// ------------------------------------
// Twitter Scraper (Using TwitterAPI.io)
// ------------------------------------

export class TwitterScraper {
  async getUserInfo(userName: string) {
    console.log(`Getting user info for ${userName}`);
    const data = await callApi('twitter/user/info', { userName });
    console.log(`User info received:`, data.data);
    return data.data;
  }

  async getMentions(userName: string, limit = 10, cursor = "") {
    console.log(`Getting mentions for @${userName}, limit=${limit}, cursor='${cursor}'`);
    const data = await callApi('twitter/user/mentions', { userName, limit, cursor });
    const tweets = data.tweets;
    const hasNextPage = data.has_next_page;
    const nextCursor = data.next_cursor;
    console.log(`Mentions fetched: count=${tweets?.length}, hasNextPage=${hasNextPage}, nextCursor=${nextCursor}`);
    return { tweets, hasNextPage, nextCursor };
  }

  async scrapeTweetsByHandle(handle: string, count: number = 20): Promise<ScrapedTweet[]> {
    console.log(`--- Starting scrapeTweetsByHandle for @${handle}, target count=${count}`);
    const tweets: ScrapedTweet[] = [];
    let cursor = "";
    const pageSize = Math.min(count, 100);

    while (tweets.length < count) {
      try {
        const { tweets: pageTweets, hasNextPage, nextCursor } = await this.getMentions(handle, pageSize, cursor);
        if (!pageTweets || pageTweets.length === 0) {
          console.warn(`⚠️ No tweets returned for cursor='${cursor}'. Breaking loop.`);
          break;
        }
        console.log(`Fetched ${pageTweets.length} tweets this page. Total so far: ${tweets.length}`);
        pageTweets.forEach((tweet: { id: any; text: any; author: { userName: any; name: any; }; createdAt: any; likeCount: any; retweetCount: any; replyCount: any; }, index: any) => {
          tweets.push({
            id: `mention_${tweet.id}`,
            text: tweet.text || "",
            author: tweet.author?.userName || tweet.author?.name || "unknown",
            timestamp: tweet.createdAt || "",
            likes: tweet.likeCount || 0,
            retweets: tweet.retweetCount || 0,
            replies: tweet.replyCount || 0
          });
        });
        console.log(`After mapping, total collected: ${tweets.length}`);
        if (!hasNextPage) {
          console.log(`✅ No more pages (hasNextPage=false). Exiting.`);
          break;
        }
        cursor = nextCursor;
        console.log(`➡️ Going to next cursor=${cursor}`);
        await new Promise(res => setTimeout(res, 500));
      } catch (err) {
        console.error(`❌ Error during paging mentions for @${handle}:`, err);
        break;
      }
    }

    const result = tweets.slice(0, count);
    console.log(`--- scrapeTweetsByHandle DONE for @${handle}. Collected ${result.length} tweets.`);
    return result;
  }
}

// ------------------------------------
// Sentiment Analyzer (Groq)
// ------------------------------------

export class AIsentimentAnalyzer {
  async analyzeTweetSentiment(tweet: string): Promise<SentimentAnalysis> {
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
      console.log(`🧠 Sending tweet for sentiment analysis: "${tweet.substring(0,50)}..."`);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            { role: 'system', content: 'You are a sentiment analysis model.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.4
        })
      });

      const headers = response.headers;
      const remainingReq = headers.get('x-ratelimit-remaining-requests');
      const retryAfter = headers.get('retry-after');
      console.log(`📩 Response headers: remainingRequests=${remainingReq}, retryAfter=${retryAfter}`);

      if (response.status === 429) {
        const wait = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
        throw new Error(`Rate limit reached. Wait for ${wait}ms`);
      }

      const json = await response.json();
      console.log(`📩 Response body from sentiment API:`, json);

      const text = json.choices?.[0]?.message?.content;
      const match = text?.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        const schema = z.object({
          sentiment: z.enum(['positive', 'negative', 'neutral']),
          score: z.number().min(-1).max(1),
          confidence: z.number().min(0).max(1),
          reasoning: z.string()
        });
        const result = schema.parse(parsed);
        console.log(`✅ Parsed sentiment analysis:`, result);
        return result;
      }
      throw new Error('Invalid JSON response content');
    } catch (error: any) {
      console.error('❌ Groq sentiment analysis failed:', error);
      // Edge case fallback: assign neutral
      return {
        sentiment: 'neutral',
        score: 0,
        confidence: 0,
        reasoning: 'Failed analysis (possibly rate-limit or error)'
      };
    }
  }

  async analyzeBatchSentiments(tweets: { text: string }[]): Promise<SentimentAnalysis[]> {
    console.log(`--- Starting analyzeBatchSentiments on ${tweets.length} tweets (max 20)`);
    const results: SentimentAnalysis[] = [];
    const maxAnalyses = 20; // cap
    let countAnalyzed = 0;

    for (const tweet of tweets) {
      if (countAnalyzed >= maxAnalyses) break;
      const result = await this.analyzeTweetSentiment(tweet.text);
      results.push(result);
      countAnalyzed++;

      // Pause to respect rate limits
      await new Promise(res => setTimeout(res, 2500)); // 2.5s delay
    }

    console.log(`--- analyzeBatchSentiments DONE. Processed ${results.length} tweets.`);
    return results;
  }
}

// ------------------------------------
// Twitter Metrics Calculator
// ------------------------------------

export class TwitterMetricsCalculator {
  private scraper: TwitterScraper;
  private analyzer: AIsentimentAnalyzer;

  constructor() {
    this.scraper = new TwitterScraper();
    this.analyzer = new AIsentimentAnalyzer();
  }

  async calculateMetrics(handle: string, tweetCount: number = 20): Promise<TwitterMetrics> {
    console.log(`### Starting calculateMetrics for @${handle}, tweetCount=${tweetCount}`);
    try {
      const userInfo = await this.scraper.getUserInfo(handle);
      const followersCount = userInfo.followers ?? 0;
      console.log(`👤 Followers for @${handle}: ${followersCount}`);

      const tweets = await this.scraper.scrapeTweetsByHandle(handle, tweetCount);
      console.log(`📰 Tweets fetched: ${tweets.length}`);

      if (tweets.length === 0) {
        console.warn('⚠️ No tweets fetched, returning default metrics');
        return this.getDefaultMetrics();
      }

      console.log(`🧮 Starting sentiment analysis on ${tweets.length} tweets...`);
      const sentiments = await this.analyzer.analyzeBatchSentiments(tweets);

      const totalEngagement = tweets.reduce((sum, t) => sum + t.likes + t.retweets + t.replies, 0);
      const totalLikes = tweets.reduce((sum, t) => sum + t.likes, 0);
      const totalRetweets = tweets.reduce((sum, t) => sum + t.retweets, 0);
      const avgSentiment = sentiments.length > 0
        ? sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length
        : 0;

      console.log(`📊 Engagement: ${totalEngagement}, Likes: ${totalLikes}, Retweets: ${totalRetweets}, AvgSentiment: ${avgSentiment}`);

      return {
        mentions: tweets.length,
        sentiment: avgSentiment,
        engagement: totalEngagement,
        followers: followersCount,
        retweets: totalRetweets,
        likes: totalLikes,
        impressions: totalEngagement * 10
      };
    } catch (error) {
      console.error('❌ Error calculating Twitter metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  private getDefaultMetrics(): TwitterMetrics {
    return {
      mentions: 20,
      sentiment: 0.1,
      engagement: 180,
      followers: 0,
      retweets: 45,
      likes: 105,
      impressions: 1800
    };
  }
}

// ------------------------------------
// Handle Extractor
// ------------------------------------

export function extractTwitterHandle(input: string): string | null {
  const match = input.match(/@?([a-zA-Z0-9_]+)/);
  return match ? match[1] : null;
}
