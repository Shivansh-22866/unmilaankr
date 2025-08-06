export interface MomentumData {
  timestamp: number;
  github: GitHubMetrics;
  twitter: TwitterMetrics;
  onchain: OnchainMetrics;
  communityMentions: number;
  interactionPatterns: InteractionMetrics;
}

export interface GitHubMetrics {
  stars: number;
  forks: number;
  commits: number;
  contributors: number;
  issues: number;
  pullRequests: number;
  releases: number;
  velocity: number; // commits per day
}

export interface TwitterMetrics {
  mentions: number;
  sentiment: number; // -1 to 1
  engagement: number;
  followers: number;
  retweets: number;
  likes: number;
  impressions: number;
}

export interface OnchainMetrics {
  transactions: number;
  uniqueAddresses: number;
  volume: number;
  liquidity: number;
  holders: number;
  transferCount: number;
}

export interface InteractionMetrics {
  discordMessages: number;
  telegramMessages: number;
  redditPosts: number;
  mediumPosts: number;
  githubDiscussions: number;
}

export interface MomentumScore {
  overall: number;
  github: number;
  social: number;
  onchain: number;
  community: number;
  trend: 'rising' | 'falling' | 'stable';
  confidence: number;
}

export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
  metric: string;
}

export interface TimeSeriesAllPoint {
  timestamp: number;
  github: number;
  social: number;
  onchain: number;
  community: number;
}


export interface AnomalyAlert {
  id: string;
  timestamp: number;
  metric: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  value: number;
  expectedRange: [number, number];
}

export interface ProjectConfig {
  name: string;
  githubRepo?: string;
  twitterHandle?: string;
  contractAddress?: string;
  tokenSymbol?: string;
  telegram?: string;
  discord?: {
    serverId: string;
    channelId: string;
  }
}

export interface AgentContext {
  project: ProjectConfig;
  timeWindow: number; // hours
  updateInterval: number; // minutes
  anomalyThreshold: number;
  weights: ScoringWeights;
}

export interface AIinsights {
  summary: string;
  outlook: 'bullish' | 'bearish' | 'neutral';
  keySignals: string[];
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number; // 0–1
  reason: string;
  review: string;
  narrative: string;
  trendDelta: {
    shortTerm: string;   // e.g., 'rising', 'falling', 'stable'
    longTerm: string;    // e.g., 'stable', 'declining'
    velocity: number;    // Numeric representation of change speed
  };
  signalAlignment: {
    githubVsTwitter: 'aligned' | 'diverging' | 'inconclusive';
    communityVsOnchain: 'aligned' | 'diverging' | 'inconclusive';
  };
  anomalyTrend: string; // Summary of recent anomaly activity
  relativePerformance: {
    category: string;            // e.g., 'DeFi', 'L2', 'NFT'
    rankPercentile: number;      // 0–100 scale
    outperformingSignals: string[];
  };
}

interface ScoringWeights {
  github: number
  social: number
  onchain: number
  community: number
}
