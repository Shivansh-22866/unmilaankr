import {
  MomentumScore,
  MomentumData,
  AnomalyAlert,
  TimeSeriesPoint,
  AgentContext,
  TimeSeriesAllPoint,
  AIinsights
} from '@/types/agent';
import { fetchMomentumData } from './tools';
import { TimeSeriesAnalyzer } from '@/lib/scoring/timeSeries';
import { AnomalyDetector } from '@/lib/scoring/anomaly';
import { analyzeWithGroq, formatMomentumContext } from './aiSenti';

// In-memory cache for each project
const timeSeriesMap: Record<string, MomentumData[]> = {};

export async function runMomentumAgent(
  context: AgentContext
): Promise<{
  score: MomentumScore;
  data: MomentumData;
  alerts: AnomalyAlert[];
  timeline: TimeSeriesPoint[];
  breakdown: TimeSeriesAllPoint[];
  aiInput: AIinsights
}> {
  const projectId =
    (context.project as any).id || // if `id` exists
    (context.project as any).slug || // if `slug` exists
    context.project.name; // fallback to name if nothing else

  let data: MomentumData;
  try {
    data = await fetchMomentumData(context.project, context);
  } catch (err) {
    console.error(`[MomentumAgent] Failed to fetch momentum data:`, err);
    return {
      score: getDefaultScore(),
      data: getDefaultData(),
      alerts: [],
      timeline: [],
      breakdown: [],
      aiInput: {
        summary: "",
        confidence: 0,
        outlook: "bearish",
        keySignals: [],
        riskLevel: "low",
        reason: "",
        review: "",
        trendDelta: {
          shortTerm: "stable",
          longTerm: "stable",
          velocity: 0,
        },
        signalAlignment: {
          githubVsTwitter: "inconclusive",
          communityVsOnchain: "inconclusive",
        },
        anomalyTrend: "",
        relativePerformance: {
          category: "",
          rankPercentile: 0,
          outperformingSignals: [],
        },
        narrative: ""
      }
    };
  }

  // Track series
  if (!timeSeriesMap[projectId]) {
    timeSeriesMap[projectId] = [];
  }

  const series = timeSeriesMap[projectId];
  series.push(data);

  if (series.length > 1000) {
    series.splice(0, series.length - 1000);
  }

  // Analyze and score
  const analyzer = new TimeSeriesAnalyzer(series);
  analyzer.updateWeights(context.weights);
  const detector = new AnomalyDetector();

  const score = analyzer.calculateMomentumScore(data);
  const spikeAlerts = detector.detectAnomalies(series);
  const patternAlerts = detector.detectPatternAnomalies(series);
  const alerts = [...spikeAlerts, ...patternAlerts];

  const timeline = analyzer.getTimeSeriesData('overall', context.timeWindow);
  const breakdown = analyzer.getTimeSeriesBreakdown(context.timeWindow);

  console.log("BREAKDOWN: ", breakdown)

  console.log("DATA AND ALERTS SENT FOR NARRATIVE: ", data, alerts)

  const narrativeInput = formatMomentumContext(data, alerts, breakdown);
  const aiInsights = await analyzeWithGroq(narrativeInput);

  console.log(aiInsights)


  return {
    score: { ...score, confidence: aiInsights.confidence },
    data,
    alerts,
    timeline,
    breakdown,
    aiInput: aiInsights
  };
}

function getDefaultScore(): MomentumScore {
  return {
    overall: 0,
    github: 0,
    social: 0,
    onchain: 0,
    community: 0,
    trend: 'stable',
    confidence: 0.5
  };
}

function getDefaultData(): MomentumData {
  return {
    timestamp: Date.now(),
    github: {
      stars: 0,
      forks: 0,
      commits: 0,
      contributors: 0,
      issues: 0,
      pullRequests: 0,
      releases: 0,
      velocity: 0
    },
    twitter: {
      mentions: 0,
      sentiment: 0,
      engagement: 0,
      followers: 0,
      retweets: 0,
      likes: 0,
      impressions: 0
    },
    onchain: {
      transactions: 0,
      uniqueAddresses: 0,
      volume: 0,
      liquidity: 0,
      holders: 0,
      transferCount: 0
    },
    communityMentions: 0,
    interactionPatterns: {
      discordMessages: 0,
      telegramMessages: 0,
      redditPosts: 0,
      mediumPosts: 0,
      githubDiscussions: 0
    }
  };
}
