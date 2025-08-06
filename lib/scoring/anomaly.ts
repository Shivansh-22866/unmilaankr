import { AnomalyAlert, TimeSeriesPoint, MomentumData } from '@/types/agent';
import { detectSpikes } from '@/lib/utils';

interface AnomalyThreshold {
  metric: string;
  threshold: number;
  sensitivity: 'low' | 'medium' | 'high';
}

export class AnomalyDetector {
  private thresholds: AnomalyThreshold[] = [
    { metric: 'github_stars', threshold: 2.5, sensitivity: 'medium' },
    { metric: 'github_velocity', threshold: 3.0, sensitivity: 'high' },
    { metric: 'twitter_engagement', threshold: 2.0, sensitivity: 'medium' },
    { metric: 'twitter_mentions', threshold: 2.5, sensitivity: 'medium' },
    { metric: 'onchain_transactions', threshold: 2.0, sensitivity: 'high' },
    { metric: 'onchain_volume', threshold: 2.5, sensitivity: 'high' },
    { metric: 'community_mentions', threshold: 2.0, sensitivity: 'medium' }
  ];

  private historicalData: Map<string, number[]> = new Map();
  private alerts: AnomalyAlert[] = [];

  detectAnomalies(data: MomentumData[]): AnomalyAlert[] {
    const newAlerts: AnomalyAlert[] = [];
    const currentTime = Date.now();

    // Update historical data
    this.updateHistoricalData(data);

    // Check each metric for anomalies
    this.thresholds.forEach(threshold => {
      const metricValues = this.getMetricValues(data, threshold.metric);
      const anomalies = this.detectMetricAnomalies(metricValues, threshold);
      
      anomalies.forEach(anomaly => {
        const alert: AnomalyAlert = {
          id: `${threshold.metric}_${currentTime}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: currentTime,
          metric: threshold.metric,
          severity: this.calculateSeverity(anomaly.zscore, threshold.sensitivity),
          description: this.generateDescription(threshold.metric, anomaly),
          value: anomaly.value,
          expectedRange: anomaly.expectedRange
        };
        
        newAlerts.push(alert);
      });
    });

    // Add new alerts to history
    this.alerts.push(...newAlerts);
    
    // Clean old alerts (keep last 100)
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    return newAlerts;
  }

  private updateHistoricalData(data: MomentumData[]): void {
    this.thresholds.forEach(threshold => {
      const values = this.getMetricValues(data, threshold.metric);
      this.historicalData.set(threshold.metric, values);
    });
  }

  private getMetricValues(data: MomentumData[], metric: string): number[] {
    return data.map(d => {
      switch (metric) {
        case 'github_stars':
          return d.github?.stars || 0;
        case 'github_velocity':
          return d.github?.velocity || 0;
        case 'github_commits':
          return d.github?.commits || 0;
        case 'twitter_engagement':
          return d.twitter?.engagement || 0;
        case 'twitter_mentions':
          return d.twitter?.mentions || 0;
        case 'twitter_sentiment':
          return d.twitter?.sentiment || 0;
        case 'onchain_transactions':
          return d.onchain?.transactions || 0;
        case 'onchain_volume':
          return d.onchain?.volume || 0;
        case 'onchain_holders':
          return d.onchain?.holders || 0;
        case 'community_mentions':
          return d.communityMentions || 0;
        default:
          return 0;
      }
    });
  }

  private detectMetricAnomalies(values: number[], threshold: AnomalyThreshold): Array<{
    value: number;
    zscore: number;
    expectedRange: [number, number];
    index: number;
  }> {
    if (values.length < 10) return []; // Need minimum data points

    const anomalies: Array<{
      value: number;
      zscore: number;
      expectedRange: [number, number];
      index: number;
    }> = [];

    // Statistical anomaly detection using Z-score
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Check recent values (last 5 points)
    const recentValues = values.slice(-5);
    
    recentValues.forEach((value, relativeIndex) => {
      const actualIndex = values.length - 5 + relativeIndex;
      const zscore = stdDev > 0 ? Math.abs((value - mean) / stdDev) : 0;
      
      if (zscore > threshold.threshold) {
        anomalies.push({
          value,
          zscore,
          expectedRange: [
            mean - threshold.threshold * stdDev,
            mean + threshold.threshold * stdDev
          ],
          index: actualIndex
        });
      }
    });

    // Detect spikes using utility function
    const spikeIndices = detectSpikes(values, threshold.threshold);
    spikeIndices.forEach(index => {
      if (index >= values.length - 5) { // Only recent spikes
        const value = values[index];
        const zscore = stdDev > 0 ? Math.abs((value - mean) / stdDev) : 0;
        
        // Avoid duplicates
        if (!anomalies.find(a => a.index === index)) {
          anomalies.push({
            value,
            zscore,
            expectedRange: [
              mean - threshold.threshold * stdDev,
              mean + threshold.threshold * stdDev
            ],
            index
          });
        }
      }
    });

    return anomalies;
  }

  private calculateSeverity(zscore: number, sensitivity: 'low' | 'medium' | 'high'): 'low' | 'medium' | 'high' {
    const multiplier = {
      low: 1.5,
      medium: 1.0,
      high: 0.7
    }[sensitivity];

    const adjustedScore = zscore * multiplier;

    if (adjustedScore > 4) return 'high';
    if (adjustedScore > 2.5) return 'medium';
    return 'low';
  }

  private generateDescription(metric: string, anomaly: {
    value: number;
    zscore: number;
    expectedRange: [number, number];
  }): string {
    const metricNames: Record<string, string> = {
      github_stars: 'GitHub Stars',
      github_velocity: 'GitHub Commit Velocity',
      github_commits: 'GitHub Commits',
      twitter_engagement: 'Twitter Engagement',
      twitter_mentions: 'Twitter Mentions',
      twitter_sentiment: 'Twitter Sentiment',
      onchain_transactions: 'Onchain Transactions',
      onchain_volume: 'Onchain Volume',
      onchain_holders: 'Token Holders',
      community_mentions: 'Community Mentions'
    };

    const metricName = metricNames[metric] || metric;
    const direction = anomaly.value > anomaly.expectedRange[1] ? 'spike' : 'drop';
    const magnitude = anomaly.zscore > 3 ? 'significant' : 'moderate';

    return `${magnitude} ${direction} detected in ${metricName}. Current value: ${anomaly.value.toFixed(2)}, Expected range: ${anomaly.expectedRange[0].toFixed(2)} - ${anomaly.expectedRange[1].toFixed(2)}`;
  }

  // Pattern-based anomaly detection
  detectPatternAnomalies(data: MomentumData[]): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = [];
    const currentTime = Date.now();

    // Detect sudden correlation breaks
    const correlationAnomalies = this.detectCorrelationAnomalies(data);
    correlationAnomalies.forEach(anomaly => {
      alerts.push({
        id: `correlation_${currentTime}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: currentTime,
        metric: 'correlation',
        severity: 'medium',
        description: anomaly.description,
        value: anomaly.correlation,
        expectedRange: [0.3, 0.8] // Expected correlation range
      });
    });

    // Detect momentum reversals
    const reversalAnomalies = this.detectMomentumReversals(data);
    reversalAnomalies.forEach(anomaly => {
      alerts.push({
        id: `reversal_${currentTime}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: currentTime,
        metric: 'momentum_reversal',
        severity: 'high',
        description: anomaly.description,
        value: anomaly.strength,
        expectedRange: [-0.1, 0.1] // Expected stability range
      });
    });

    return alerts;
  }

  private detectCorrelationAnomalies(data: MomentumData[]): Array<{
    description: string;
    correlation: number;
  }> {
    if (data.length < 20) return [];

    const githubStars = data.map(d => d.github?.stars || 0);
    const twitterEngagement = data.map(d => d.twitter?.engagement || 0);
    const onchainVolume = data.map(d => d.onchain?.volume || 0);

    // Calculate correlations
    const githubTwitterCorr = this.calculateCorrelation(githubStars, twitterEngagement);
    const githubOnchainCorr = this.calculateCorrelation(githubStars, onchainVolume);
    const twitterOnchainCorr = this.calculateCorrelation(twitterEngagement, onchainVolume);

    const anomalies: Array<{ description: string; correlation: number }> = [];

    // Check for unusually low correlations (potential decoupling)
    if (Math.abs(githubTwitterCorr) < 0.1) {
      anomalies.push({
        description: 'Unusual decoupling between GitHub activity and Twitter engagement detected',
        correlation: githubTwitterCorr
      });
    }

    if (Math.abs(twitterOnchainCorr) < 0.1) {
      anomalies.push({
        description: 'Unusual decoupling between social activity and onchain metrics detected',
        correlation: twitterOnchainCorr
      });
    }

    return anomalies;
  }

    private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const meanX = x.reduce((sum, xi) => sum + xi, 0) / n;
    const meanY = y.reduce((sum, yi) => sum + yi, 0) / n;

    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denominatorX += dx * dx;
      denominatorY += dy * dy;
    }

    const denominator = Math.sqrt(denominatorX * denominatorY);
    return denominator === 0 ? 0 : numerator / denominator;
  }


  private detectMomentumReversals(data: MomentumData[]): Array<{
    description: string;
    strength: number;
  }> {
    if (data.length < 10) return [];

    const anomalies: Array<{ description: string; strength: number }> = [];
    
    // Calculate momentum proxies for recent data
    const recentData = data.slice(-10);
    const momentumScores = recentData.map(d => {
      const github = (d.github?.stars || 0) + (d.github?.velocity || 0) * 10;
      const social = (d.twitter?.engagement || 0) + (d.twitter?.mentions || 0);
      const onchain = (d.onchain?.volume || 0) + (d.onchain?.transactions || 0);
      return github + social + onchain;
    });

    // Calculate first half vs second half average
    const firstHalf = momentumScores.slice(0, 5);
    const secondHalf = momentumScores.slice(5);

    const avg1 = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const change = (avg2 - avg1) / Math.max(avg1, 1); // prevent div by 0

    if (Math.abs(change) > 0.2) {
      anomalies.push({
        description: change > 0
          ? 'Sudden upward momentum reversal detected in overall project activity.'
          : 'Sudden downward momentum reversal detected in overall project activity.',
        strength: change
      });
    }

    return anomalies;
  }
}