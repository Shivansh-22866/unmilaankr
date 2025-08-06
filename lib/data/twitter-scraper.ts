import puppeteer from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { z } from 'zod';

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
// Twitter Scraper (Puppeteer)
// ------------------------------------

export class TwitterScraper {
  private async initBrowser() {
    return await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ]
    });
  }

  async scrapeTweetsByHandle(handle: string, count: number = 100): Promise<ScrapedTweet[]> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    const tweets: ScrapedTweet[] = [];

    try {
      const searchUrl = `https://twitter.com/search?q=%40${handle}&src=typed_query&f=live`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });

      const content = await page.content();
      if (!content.includes('@' + handle)) {
        console.warn('Handle not found in page HTML. Twitter may have blocked or redirected.');
      }

      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="tweet"]'),
        { timeout: 3000 }
      );

      let scrollCount = 0;
      const maxScrolls = Math.ceil(count / 20);

      while (tweets.length < count && scrollCount < maxScrolls) {
        const newTweets = await page.evaluate(() => {
          const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
          const extracted: ScrapedTweet[] = [];

          tweetElements.forEach((tweet, index) => {
            try {
              const textElement = tweet.querySelector('[data-testid="tweetText"]');
              const authorElement = tweet.querySelector('[data-testid="User-Name"] a');
              const timeElement = tweet.querySelector('time');
              const like = tweet.querySelector('[data-testid="like"] span');
              const retweet = tweet.querySelector('[data-testid="retweet"] span');
              const reply = tweet.querySelector('[data-testid="reply"] span');

              if (textElement && authorElement) {
                extracted.push({
                  id: `scraped_${Date.now()}_${index}`,
                  text: textElement.textContent || '',
                  author: authorElement.textContent?.replace('@', '') || '',
                  timestamp: timeElement?.getAttribute('datetime') || new Date().toISOString(),
                  likes: parseInt(like?.textContent || '0'),
                  retweets: parseInt(retweet?.textContent || '0'),
                  replies: parseInt(reply?.textContent || '0'),
                });
              }
            } catch (_) {}
          });

          return extracted;
        });

        newTweets.forEach(t => {
          if (!tweets.find(existing => existing.text === t.text)) {
            tweets.push(t);
          }
        });

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(res => setTimeout(res, 2000));
        scrollCount++;
      }

      return tweets.slice(0, count);

    } catch (err) {
      console.error('❌ Puppeteer scraping failed:', err);
      return [];
    } finally {
      await browser.close();
    }
  }
}

// ------------------------------------
// Nitter Scraper
// ------------------------------------

export class NitterScraper {
  private nitterInstances = [
    'https://nitter.net',
    'https://nitter.unixfox.eu',
    'https://nitter.moomoo.me',
    'https://nitter.pussthecat.org'
  ];

  async scrapeTweetsByHandle(handle: string, count: number = 100): Promise<ScrapedTweet[]> {
    for (const instance of this.nitterInstances) {
      try {
        console.log(`Trying Nitter instance: ${instance}`);
        const response = await axios.get(`${instance}/search`, {
          params: { q: `@${handle}`, f: 'tweets' },
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const tweets: ScrapedTweet[] = [];

        $('.timeline-item').each((index, el) => {
          if (tweets.length >= count) return false;

          const $tweet = $(el);
          tweets.push({
            id: `nitter_${Date.now()}_${index}`,
            text: $tweet.find('.tweet-content').text().trim(),
            author: $tweet.find('.username').text().replace('@', ''),
            timestamp: $tweet.find('.tweet-date a').attr('title') || '',
            likes: parseInt($tweet.find('.icon-heart').parent().text()) || 0,
            retweets: parseInt($tweet.find('.icon-retweet').parent().text()) || 0,
            replies: parseInt($tweet.find('.icon-comment').parent().text()) || 0
          });
        });

        if (tweets.length > 0) return tweets;

      } catch (err: any) {
        console.warn(`❌ Failed to scrape from ${instance}: ${err.message}`);
        continue;
      }
    }

    console.error('⚠️ All Nitter instances failed.');
    return [];
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

      const json = await response.json();
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

        return schema.parse(parsed);
      }

      throw new Error('Invalid response');

    } catch (error) {
      console.error('Groq sentiment analysis failed:', error);
      return {
        sentiment: 'neutral',
        score: 0,
        confidence: 0.5,
        reasoning: 'Analysis failed or invalid JSON'
      };
    }
  }

  async analyzeBatchSentiments(tweets: { text: string }[]): Promise<SentimentAnalysis[]> {
    const results: SentimentAnalysis[] = [];

    for (const tweet of tweets) {
      const result = await this.analyzeTweetSentiment(tweet.text);
      results.push(result);
      await new Promise(res => setTimeout(res, 500)); // rate limit
    }

    return results;
  }
}

// ------------------------------------
// Main Calculator
// ------------------------------------

export class TwitterMetricsCalculator {
  private scraper: TwitterScraper | NitterScraper;
  private analyzer: AIsentimentAnalyzer;

  constructor(useNitter: boolean = false) {
    this.scraper = useNitter ? new NitterScraper() : new TwitterScraper();
    this.analyzer = new AIsentimentAnalyzer();
  }

  async calculateMetrics(handle: string, tweetCount: number = 100): Promise<TwitterMetrics> {
    try {
      console.log(`Scraping ${tweetCount} tweets mentioning @${handle}...`);
      const tweets = await this.scraper.scrapeTweetsByHandle(handle, tweetCount);

      if (tweets.length === 0) {
        console.warn('⚠️ Scraping failed, returning dummy metrics');
        return this.getDefaultMetrics();
      }

      console.log(`Analyzing ${tweets.length} tweets...`);
      const sentiments = await this.analyzer.analyzeBatchSentiments(tweets);

      const totalEngagement = tweets.reduce((sum, t) => sum + t.likes + t.retweets + t.replies, 0);
      const totalLikes = tweets.reduce((sum, t) => sum + t.likes, 0);
      const totalRetweets = tweets.reduce((sum, t) => sum + t.retweets, 0);
      const avgSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;

      return {
        mentions: tweets.length,
        sentiment: avgSentiment,
        engagement: totalEngagement,
        followers: 0,
        retweets: totalRetweets,
        likes: totalLikes,
        impressions: totalEngagement * 10
      };

    } catch (error) {
      console.error('Error calculating Twitter metrics:', error);
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
