import { TimeSeriesPoint, MomentumData, MomentumScore, TimeSeriesAllPoint } from '@/types/agent';
import { weightedAverage, calculateTrend, exponentialMovingAverage } from '@/lib/utils';

export class TimeSeriesAnalyzer {
  private data: MomentumData[] = [];
  private weights = {
    github: 0.25,
    social: 0.3,
    onchain: 0.35,
    community: 0.1
  };

  constructor(data: MomentumData[] = []) {
    this.data = data.sort((a, b) => a.timestamp - b.timestamp);
  }

  addDataPoint(dataPoint: MomentumData): void {
    this.data.push(dataPoint);
    this.data.sort((a, b) => a.timestamp - b.timestamp);
    
    // Keep only last 1000 points to manage memory
    if (this.data.length > 1000) {
      this.data = this.data.slice(-1000);
    }
  }

  calculateMomentumScore(latest?: MomentumData): MomentumScore {
    const dataPoint = latest || this.data[this.data.length - 1];
    if (!dataPoint) {
      return this.getDefaultScore();
    }

    // Calculate individual scores
    const githubScore = this.calculateGitHubScore(dataPoint.github);
    const socialScore = this.calculateSocialScore(dataPoint.twitter);
    const onchainScore = this.calculateOnchainScore(dataPoint.onchain);
    const communityScore = this.calculateCommunityScore(
      dataPoint.communityMentions,
      dataPoint.interactionPatterns
    );

    // Calculate weighted overall score
    const overall = weightedAverage(
      [githubScore, socialScore, onchainScore, communityScore],
      [this.weights.github, this.weights.social, this.weights.onchain, this.weights.community]
    );

    // Calculate trend
    const overallScores = this.data.map(d => this.calculateOverallScore(d));
    const trend = calculateTrend(overallScores);

    // Calculate confidence based on data consistency and volume
    const confidence = this.calculateConfidence();

    return {
      overall: Math.round(overall * 100),
      github: Math.round(githubScore * 100),
      social: Math.round(socialScore * 100),
      onchain: Math.round(onchainScore * 100),
      community: Math.round(communityScore * 100),
      trend,
      confidence
    };
  }

  private calculateGitHubScore(github: any): number {
    if (!github) return 0;

    // Normalize GitHub metrics
    const starScore = Math.min(github.stars / 1000, 1); // Max score at 1000 stars
    const forkScore = Math.min(github.forks / 500, 1); // Max score at 500 forks
    const velocityScore = Math.min(github.velocity / 10, 1); // Max score at 10 commits/day
    const contributorScore = Math.min(github.contributors / 20, 1); // Max score at 20 contributors
    const activityScore = Math.min((github.issues + github.pullRequests) / 100, 1);

    return weightedAverage(
      [starScore, forkScore, velocityScore, contributorScore, activityScore],
      [0.3, 0.2, 0.25, 0.15, 0.1]
    );
  }

  private calculateSocialScore(twitter: any): number {
    if (!twitter) return 0;

    // Normalize Twitter metrics
    const followerScore = Math.min(twitter.followers / 10000, 1); // Max at 10k followers
    const engagementScore = Math.min(twitter.engagement / 1000, 1); // Max at 1k engagement
    const sentimentScore = (twitter.sentiment + 1) / 2; // Convert -1,1 to 0,1
    const mentionScore = Math.min(twitter.mentions / 100, 1); // Max at 100 mentions

    return weightedAverage(
      [followerScore, engagementScore, sentimentScore, mentionScore],
      [0.2, 0.4, 0.3, 0.1]
    );
  }

  private calculateOnchainScore(onchain: any): number {
    if (!onchain) return 0;

    // Normalize onchain metrics
    const transactionScore = Math.min(onchain.transactions / 1000, 1); // Max at 1k txs
    const volumeScore = Math.min(onchain.volume / 1000000, 1); // Max at 1M volume
    const holderScore = Math.min(onchain.holders / 10000, 1); // Max at 10k holders
    const liquidityScore = Math.min(onchain.liquidity / 500000, 1); // Max at 500k liquidity
    const addressScore = Math.min(onchain.uniqueAddresses / 1000, 1); // Max at 1k addresses

    return weightedAverage(
      [transactionScore, volumeScore, holderScore, liquidityScore, addressScore],
      [0.25, 0.25, 0.2, 0.15, 0.15]
    );
  }

  private calculateCommunityScore(mentions: number, interactions: any): number {
    const mentionScore = Math.min(mentions / 50, 1); // Max at 50 mentions
    
    if (!interactions) return mentionScore;

    const discordScore = Math.min(interactions.discordMessages / 100, 1);
    const telegramScore = Math.min(interactions.telegramMessages / 100, 1);
    const redditScore = Math.min(interactions.redditPosts / 20, 1);
    const mediumScore = Math.min(interactions.mediumPosts / 5, 1);

    return weightedAverage(
      [mentionScore, discordScore, telegramScore, redditScore, mediumScore],
      [0.3, 0.25, 0.2, 0.15, 0.1]
    );
  }

  private calculateOverallScore(dataPoint: MomentumData): number {
    const githubScore = this.calculateGitHubScore(dataPoint.github);
    const socialScore = this.calculateSocialScore(dataPoint.twitter);
    const onchainScore = this.calculateOnchainScore(dataPoint.onchain);
    const communityScore = this.calculateCommunityScore(
      dataPoint.communityMentions,
      dataPoint.interactionPatterns
    );

    return weightedAverage(
      [githubScore, socialScore, onchainScore, communityScore],
      [this.weights.github, this.weights.social, this.weights.onchain, this.weights.community]
    );
  }

  private calculateConfidence(): number {
    if (this.data.length < 5) return 0.3; // Low confidence with little data

    // Calculate confidence based on data consistency and trends
    const recentScores = this.data.slice(-10).map(d => this.calculateOverallScore(d));
    
    // Variance-based confidence (lower variance = higher confidence)
    const mean = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const variance = recentScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / recentScores.length;
    const consistencyScore = Math.max(0, 1 - variance * 4); // Scale variance to 0-1

    // Data volume confidence
    const volumeScore = Math.min(this.data.length / 50, 1); // Max confidence at 50 data points

    return weightedAverage([consistencyScore, volumeScore], [0.7, 0.3]);
  }

  getTimeSeriesData(metric: string, window: number = 24): TimeSeriesPoint[] {
    const endTime = Date.now();
    const startTime = endTime - (window * 60 * 60 * 1000); // Convert hours to ms
    
    const filteredData = this.data.filter(d => d.timestamp >= startTime);
    
    return filteredData.map(d => ({
      timestamp: d.timestamp,
      value: this.extractMetricValue(d, metric),
      metric
    }));
  }

  private extractMetricValue(data: MomentumData, metric: string): number {
    switch (metric) {
      case 'overall':
        return this.calculateOverallScore(data) * 100;
      case 'github_stars':
        return data.github?.stars || 0;
      case 'github_velocity':
        return data.github?.velocity || 0;
      case 'twitter_engagement':
        return data.twitter?.engagement || 0;
      case 'twitter_sentiment':
        return ((data.twitter?.sentiment || 0) + 1) * 50; // Convert -1,1 to 0,100
      case 'onchain_transactions':
        return data.onchain?.transactions || 0;
      case 'onchain_volume':
        return data.onchain?.volume || 0;
      case 'community_mentions':
        return data.communityMentions || 0;
      default:
        return 0;
    }
  }

  getMovingAverage(metric: string, window: number = 7): TimeSeriesPoint[] {
    const rawData = this.getTimeSeriesData(metric, window * 24);
    const values = rawData.map(point => point.value);
    const smoothedValues = exponentialMovingAverage(values);
    
    return rawData.map((point, index) => ({
      ...point,
      value: smoothedValues[index] || point.value
    }));
  }

  detectTrendChanges(metric: string): Array<{
    timestamp: number;
    direction: 'up' | 'down';
    strength: number;
  }> {
    const data = this.getTimeSeriesData(metric);
    const changes: Array<{
      timestamp: number;
      direction: 'up' | 'down';
      strength: number;
    }> = [];
    
    for (let i = 5; i < data.length; i++) {
      const recent = data.slice(i - 5, i);
      const previous = data.slice(i - 10, i - 5);
      
      if (recent.length < 5 || previous.length < 5) continue;
      
      const recentAvg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
      const previousAvg = previous.reduce((sum, p) => sum + p.value, 0) / previous.length;
      
      const change = (recentAvg - previousAvg) / previousAvg;
      
      if (Math.abs(change) > 0.1) { // 10% change threshold
        changes.push({
          timestamp: data[i].timestamp,
          direction: change > 0 ? 'up' : 'down',
          strength: Math.abs(change)
        });
      }
    }
    
    return changes;
  }

  private getDefaultScore(): MomentumScore {
    return {
      overall: 0,
      github: 0,
      social: 0,
      onchain: 0,
      community: 0,
      trend: 'stable',
      confidence: 0
    };
  }

updateWeights(newWeights: Partial<typeof this.weights>): void {
  // Merge new weights with existing ones
  const merged = { ...this.weights, ...newWeights };

  // Ensure all weights are numbers and non-negative
  for (const [key, value] of Object.entries(merged)) {
    if (typeof value !== 'number' || value < 0) {
      throw new Error(`Invalid weight for "${key}": must be a non-negative number`);
    }
  }

  // Normalize weights to ensure they sum to 1
  const total = Object.values(merged).reduce((sum, w) => sum + w, 0);
  if (total === 0) {
    throw new Error('Total weight cannot be zero');
  }

  Object.keys(merged).forEach((key) => {
    merged[key as keyof typeof merged] /= total;
  });

  this.weights = merged;
}


  getWeights() {
    return { ...this.weights };
  }

  /**
 * Returns federated time-series breakdown for the stacked area chart.
 * Each point contains timestamp + 4 momentum components.
 */
getTimeSeriesBreakdown(window: number = 48): TimeSeriesAllPoint[] {
  const endTime = Date.now();
  const startTime = endTime - window * 60 * 60 * 1000; // past N hours

  return this.data
    .filter((d) => d.timestamp >= startTime)
    .map((d) => ({
      timestamp: d.timestamp,
      github: parseFloat((this.calculateGitHubScore(d.github) * 100).toFixed(2)),
      social: parseFloat((this.calculateSocialScore(d.twitter) * 100).toFixed(2)),
      onchain: parseFloat((this.calculateOnchainScore(d.onchain) * 100).toFixed(2)),
      community: parseFloat((this.calculateCommunityScore(d.communityMentions, d.interactionPatterns) * 100).toFixed(2)),
    }));
}


}