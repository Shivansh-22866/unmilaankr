import { TwitterMetrics } from '@/types/agent';
import axios from 'axios';

interface TwitterUser {
  id: string;
  username: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
}

interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  context_annotations?: Array<{
    domain: { name: string };
    entity: { name: string };
  }>;
}

interface TwitterMention {
  id: string;
  text: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
  };
  author_id: string;
}

export class TwitterDataFetcher {
  private bearerToken: string;
  private baseURL = 'https://api.twitter.com/2';

  constructor(bearerToken: string) {
    this.bearerToken = bearerToken;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.bearerToken}`,
      'Content-Type': 'application/json'
    };
  }

  async fetchUserMetrics(username: string): Promise<TwitterMetrics> {
    try {
      const headers = this.getHeaders();
      
      // Fetch user data
      const userResponse = await axios.get<{ data: TwitterUser }>(
        `${this.baseURL}/users/by/username/${username}?user.fields=public_metrics`,
        { headers }
      );
      
      const user = userResponse.data.data;
      
      // Fetch recent tweets
      const tweetsResponse = await axios.get<{ data: TwitterTweet[] }>(
        `${this.baseURL}/users/${user.id}/tweets?max_results=100&tweet.fields=created_at,public_metrics,context_annotations`,
        { headers }
      );
      
      const tweets = tweetsResponse.data.data || [];
      
      // Calculate metrics from recent tweets
      const totalEngagement = tweets.reduce((sum, tweet) => 
        sum + tweet.public_metrics.like_count + tweet.public_metrics.retweet_count + 
        tweet.public_metrics.reply_count + tweet.public_metrics.quote_count, 0
      );
      
      const totalRetweets = tweets.reduce((sum, tweet) => sum + tweet.public_metrics.retweet_count, 0);
      const totalLikes = tweets.reduce((sum, tweet) => sum + tweet.public_metrics.like_count, 0);
      
      // Simple sentiment analysis based on engagement ratios
      const sentiment = this.calculateSentiment(tweets);
      
      // Estimate impressions (rough calculation based on followers and engagement)
      const estimatedImpressions = user.public_metrics.followers_count * tweets.length * 0.1;
      
      return {
        mentions: 0, // Will be calculated separately
        sentiment,
        engagement: totalEngagement,
        followers: user.public_metrics.followers_count,
        retweets: totalRetweets,
        likes: totalLikes,
        impressions: estimatedImpressions
      };
      
    } catch (error) {
      console.error('Error fetching Twitter user metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  async fetchMentions(query: string, maxResults: number = 100): Promise<{
    mentions: TwitterMention[];
    count: number;
    sentiment: number;
  }> {
    try {
      const headers = this.getHeaders();
      
      const response = await axios.get<{ data: TwitterMention[]; meta: { result_count: number } }>(
        `${this.baseURL}/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${maxResults}&tweet.fields=created_at,public_metrics,context_annotations&expansions=author_id`,
        { headers }
      );
      
      const mentions = response.data.data || [];
      const count = response.data.meta.result_count || 0;
      
      // Calculate aggregate sentiment
      const sentiment = this.calculateMentionsSentiment(mentions);
      
      return { mentions, count, sentiment };
      
    } catch (error) {
      console.error('Error fetching Twitter mentions:', error);
      return { mentions: [], count: 0, sentiment: 0 };
    }
  }

  async fetchHashtagMetrics(hashtag: string): Promise<{
    volume: number;
    engagement: number;
    sentiment: number;
  }> {
    try {
      const headers = this.getHeaders();
      
      const response = await axios.get<{ data: TwitterTweet[]; meta: { result_count: number } }>(
        `${this.baseURL}/tweets/search/recent?query=%23${hashtag}&max_results=100&tweet.fields=created_at,public_metrics`,
        { headers }
      );
      
      const tweets = response.data.data || [];
      const volume = response.data.meta.result_count || 0;
      
      const totalEngagement = tweets.reduce((sum, tweet) => 
        sum + tweet.public_metrics.like_count + tweet.public_metrics.retweet_count + 
        tweet.public_metrics.reply_count + tweet.public_metrics.quote_count, 0
      );
      
      const sentiment = this.calculateSentiment(tweets);
      
      return { volume, engagement: totalEngagement, sentiment };
      
    } catch (error) {
      console.error('Error fetching hashtag metrics:', error);
      return { volume: 0, engagement: 0, sentiment: 0 };
    }
  }

  private calculateSentiment(tweets: TwitterTweet[]): number {
    if (tweets.length === 0) return 0;
    
    // Simple sentiment calculation based on engagement patterns and keywords
    let sentimentScore = 0;
    
    for (const tweet of tweets) {
      const text = tweet.text.toLowerCase();
      const metrics = tweet.public_metrics;
      
      // Positive keywords
      const positiveWords = ['great', 'awesome', 'amazing', 'love', 'excellent', 'good', 'fantastic', 'wonderful'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointed', 'sad'];
      
      let tweetSentiment = 0;
      
      // Count positive/negative words
      positiveWords.forEach(word => {
        if (text.includes(word)) tweetSentiment += 1;
      });
      
      negativeWords.forEach(word => {
        if (text.includes(word)) tweetSentiment -= 1;
      });
      
      // Weight by engagement (more engaged tweets have more impact)
      const engagementWeight = Math.log(1 + metrics.like_count + metrics.retweet_count);
      sentimentScore += tweetSentiment * engagementWeight;
    }
    
    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, sentimentScore / tweets.length));
  }

  private calculateMentionsSentiment(mentions: TwitterMention[]): number {
    if (mentions.length === 0) return 0;
    
    // Similar to calculateSentiment but for mentions
    let totalSentiment = 0;
    
    for (const mention of mentions) {
      const text = mention.text.toLowerCase();
      let mentionSentiment = 0;
      
      // Simple keyword-based sentiment
      if (text.includes('bullish') || text.includes('moon') || text.includes('gem')) {
        mentionSentiment += 1;
      }
      if (text.includes('bearish') || text.includes('dump') || text.includes('scam')) {
        mentionSentiment -= 1;
      }
      
      totalSentiment += mentionSentiment;
    }
    
    return Math.max(-1, Math.min(1, totalSentiment / mentions.length));
  }

  private getDefaultMetrics(): TwitterMetrics {
    return {
      mentions: 0,
      sentiment: 0,
      engagement: 0,
      followers: 0,
      retweets: 0,
      likes: 0,
      impressions: 0
    };
  }
}

export function extractTwitterHandle(input: string): string | null {
  const match = input.match(/@?([a-zA-Z0-9_]+)/);
  return match ? match[1] : null;
}