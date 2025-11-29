'use client'

import React, { useState, useEffect } from 'react';
import { TrendingUp, Moon, Sun, RefreshCw, AlertCircle, Shield, AlertTriangle, TrendingDown, Zap, Lock, CheckCircle, Eye, Star, X, Plus, BarChart2, MessageCircle, Github, Activity, Users, LineChart, Filter, Bell, BellOff, ArrowUpRight, ArrowDownRight, Copy, ExternalLink, Brain } from 'lucide-react';

interface MarketData {
  totalMarketCap: number;
  volume24h: number;
  avgMomentum: number;
  topGainer: string;
}

interface ProjectConfig {
  id: number;
  tick: string;
  name: string;
  icon: string;
  contractAddress: string;
  category: 'MEME' | 'DEFI' | 'GAMER' | 'X SCAN';
}

interface SecurityScore {
  overall: number;
  liquidity: number;
  holderDistribution: number;
  contractVerified: boolean;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  flags: string[];
}

interface MomentumAlert {
  type: 'SPIKE' | 'DUMP' | 'VOLUME_SURGE' | 'HOLDER_GROWTH';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  timestamp: Date;
}

interface PriceHistory {
  timestamp: number;
  price: number;
}

interface AIInsight {
  signal: 'BUY' | 'SELL' | 'HOLD' | 'WATCH';
  confidence: number;
  reason: string;
  timeframe: '1H' | '4H' | '1D' | '1W';
}

interface MomentumSignal {
  type: 'BREAKOUT' | 'REVERSAL' | 'TRENDING' | 'CONSOLIDATION';
  strength: number;
  confidence: number;
  description: string;
  timestamp: Date;
  priceTarget?: number;
  stopLoss?: number;
}

interface TradingOpportunity {
  projectId: number;
  signal: MomentumSignal;
  riskReward: number;
  timeframe: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface Project extends ProjectConfig {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  supply: number;
  liquidity?: number;
  error?: boolean;
  securityScore?: SecurityScore;
  momentumAlerts?: MomentumAlert[];
  priceHistory?: PriceHistory[];
  momentum24h?: number;
  aiInsight?: AIInsight;
  momentumSignals?: MomentumSignal[];
}

interface WatchlistItem {
  projectId: number;
  priceAlert?: {
    type: 'ABOVE' | 'BELOW';
    price: number;
  };
}

type FilterType = 'ALL' | 'MEME' | 'DEFI' | 'GAMER' | 'X SCAN';
type ViewMode = 'TABLE' | 'CARDS';

const SigniqMarket: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showAlerts, setShowAlerts] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'momentum' | 'security' | 'marketCap'>('momentum');
  const [viewMode, setViewMode] = useState<ViewMode>('TABLE');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAIInsights, setShowAIInsights] = useState<boolean>(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [compareProjects, setCompareProjects] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState<boolean>(false);
  const [tradingOpportunities, setTradingOpportunities] = useState<TradingOpportunity[]>([]);
  const [activeSignals, setActiveSignals] = useState<MomentumSignal[]>([]);
  const [showTradingPanel, setShowTradingPanel] = useState<boolean>(true);
  
  const [marketData, setMarketData] = useState<MarketData>({
    totalMarketCap: 0,
    volume24h: 0,
    avgMomentum: 0,
    topGainer: ''
  });

  const projectConfigs: ProjectConfig[] = [
    {
      id: 1,
      tick: 'CYAI',
      name: 'CyreneAI',
      icon: '🔷',
      contractAddress: '6Tph3SxbAW12BSJdCevVV9Zujh97X69d5MJ4XjwKmray',
      category: 'DEFI'
    },
    {
      id: 2,
      tick: 'CT',
      name: "CromaFun",
      icon: "🎉",
      contractAddress: 'QGA9gSriVnubWRU21Ph5roaGdxFwdpSRT6hmjwycyai',
      category: "GAMER"
    },
    {
      id: 3,
      tick: 'AS',
      name: "Aytes",
      icon: "🎉",
      contractAddress: 'VsnkRuJmAfymCs8kctHEa4kL3Tvjvg3p21QES1ucyai',
      category: "DEFI"
    },
    {
      id: 4,
      tick: 'SGQ',
      name: "Signiq",
      icon: "🌀",
      contractAddress: "K9uxt28GvfPsQuapLU1rYxY1REAcZ9NMQ3SYwWbcyai",
      category: "X SCAN"
    },
    {
      id: 5,
      tick: "MDS",
      name: "Medusa Shards",
      icon: "🎉",
      contractAddress: "Dria68ScNfmRrvL7K1nx5cEkND6V6V5yUGkFr7gcyai",
      category: "GAMER"
    },
    {
      id: 6,
      tick: "SENT",
      name: "Sentinel AI",
      icon: "🎉",
      contractAddress: "r6j6eBMX3WFpDP6iBCaMUW2AXJbBDN4rQquiFPfcyai",
      category: "DEFI"
    },
    {
      id: 7,
      tick: "PRN",
      name: "Prana Chain",
      icon: "🎉",
      contractAddress: "C15AhpLTjjVBLLPq5xqH9ewXscSN4DcpkePmHg7geTa6",
      category: "DEFI"
    },
    {
      id: 8,
      tick: "SCRIPT",
      name: "Scriptonia",
      icon: "🎉",
      contractAddress: "C15AhpLTjjVBLLPq5xqH9ewXscSN4DcpkePmHg7geTa6",
      category: "X SCAN"
    },
    {
      id: 9,
      tick: "SWARM",
      name: "Swarm",
      icon: "🎉",
      contractAddress: "otgodXJDJFFip57AA43ERfDs8pcGviDd9oUJsnEcyai",
      category: "X SCAN"
    },
    {
      id: 10,
      tick: "AIDP",
      name: "AIdp.Store",
      icon: "🎉",
      contractAddress: "PLNk8NUTBeptajEX9GzZrxsYPJ1psnw62dPnWkGcyai",
      category: "DEFI"
    },
    {
      id: 11,
      tick: "MICK",
      name: "Mikayla",
      icon: "🎉",
      contractAddress: "QCDgZ9RDarrnDq57GiSxPyWeJ3PKJndfMcHYkMWcyai",
      category: "MEME",
    },
    {
      id: 12,
      tick: "CF",
      name: "CrossFund",
      icon: "🎉",
      contractAddress: "quauDjvWByAgtij5eJiTgi4NuMtcbaPLd3FpWG9cyai",
      category: "DEFI",
    }
  ];

  const [projects, setProjects] = useState<Project[]>([]);
  const [previousProjects, setPreviousProjects] = useState<Project[]>([]);

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('signiq-watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('signiq-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Enhanced AI signal generation with momentum analysis
  const generateEnhancedAIInsight = (project: Project, previous?: Project): AIInsight & { momentumSignals: MomentumSignal[] } => {
    const momentum = project.momentum24h || 50;
    const security = project.securityScore?.overall || 50;
    const volumeChange = previous ? ((project.volume24h - previous.volume24h) / previous.volume24h) * 100 : 0;
    const priceChange = project.change24h;

    const signals: MomentumSignal[] = [];
    let mainSignal: AIInsight['signal'] = 'HOLD';
    let confidence = 0;
    let reason = '';

    // Momentum breakout detection
    if (momentum >= 75 && volumeChange > 50 && priceChange > 15) {
      signals.push({
        type: 'BREAKOUT',
        strength: 85,
        confidence: 80,
        description: `Strong momentum breakout with ${volumeChange.toFixed(0)}% volume surge`,
        timestamp: new Date(),
        priceTarget: project.price * 1.25,
        stopLoss: project.price * 0.92
      });
      mainSignal = 'BUY';
      confidence = 85;
      reason = 'Momentum breakout with high volume confirmation';
    }
    // Reversal detection
    else if (momentum <= 25 && priceChange < -20 && volumeChange > 100) {
      signals.push({
        type: 'REVERSAL',
        strength: 70,
        confidence: 75,
        description: `Potential reversal after ${Math.abs(priceChange).toFixed(1)}% drop with capitulation volume`,
        timestamp: new Date(),
        priceTarget: project.price * 1.15,
        stopLoss: project.price * 0.85
      });
      mainSignal = 'BUY';
      confidence = 70;
      reason = 'Oversold with capitulation volume, potential bounce';
    }
    // Trend continuation
    else if (momentum >= 60 && security >= 60 && priceChange > 5) {
      signals.push({
        type: 'TRENDING',
        strength: 75,
        confidence: 70,
        description: `Strong uptrend with ${priceChange.toFixed(1)}% gains and solid fundamentals`,
        timestamp: new Date(),
        priceTarget: project.price * 1.20,
        stopLoss: project.price * 0.88
      });
      mainSignal = 'BUY';
      confidence = 75;
      reason = 'Strong trend continuation with good fundamentals';
    }
    // Consolidation detection
    else if (Math.abs(priceChange) < 5 && volumeChange < 20 && momentum >= 40 && momentum <= 60) {
      signals.push({
        type: 'CONSOLIDATION',
        strength: 60,
        confidence: 65,
        description: 'Price consolidating, watching for next move',
        timestamp: new Date()
      });
      mainSignal = 'WATCH';
      confidence = 60;
      reason = 'Consolidation phase, wait for breakout confirmation';
    }
    else {
      mainSignal = 'HOLD';
      confidence = 50;
      reason = 'Mixed signals, waiting for clearer trend';
    }

    return {
      signal: mainSignal,
      confidence,
      reason,
      timeframe: '4H',
      momentumSignals: signals
    };
  };

  // Calculate Security Score based on real data
  const calculateSecurityScore = (project: Partial<Project>): SecurityScore => {
    const flags: string[] = [];
    let liquidityScore = 0;
    let distributionScore = 0;

    if (project.liquidity) {
      if (project.liquidity > 100000) liquidityScore = 50;
      else if (project.liquidity > 50000) liquidityScore = 40;
      else if (project.liquidity > 10000) liquidityScore = 30;
      else {
        liquidityScore = 20;
        flags.push('Low Liquidity');
      }
    } else {
      liquidityScore = 25;
    }

    if (project.holders) {
      if (project.holders > 1000) distributionScore = 50;
      else if (project.holders > 500) distributionScore = 40;
      else if (project.holders > 100) distributionScore = 30;
      else {
        distributionScore = 20;
        flags.push('Low Holder Count');
      }
    } else {
      distributionScore = 25;
    }

    if (project.change24h && Math.abs(project.change24h) > 100) {
      flags.push('High Volatility');
    }

    if (project.volume24h && project.marketCap && project.volume24h > project.marketCap * 2) {
      flags.push('Unusual Volume');
    }

    const overall = liquidityScore + distributionScore;
    let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    
    if (overall >= 80) risk = 'LOW';
    else if (overall >= 50) risk = 'MEDIUM';
    else risk = 'HIGH';

    return {
      overall,
      liquidity: liquidityScore * 2,
      holderDistribution: distributionScore * 2,
      contractVerified: true,
      risk,
      flags
    };
  };

  const calculateMomentum = (project: Project, previous?: Project): number => {
    let score = 50;

    if (project.change24h > 20) score += 20;
    else if (project.change24h > 10) score += 15;
    else if (project.change24h > 5) score += 10;
    else if (project.change24h < -20) score -= 20;
    else if (project.change24h < -10) score -= 15;

    if (previous?.volume24h) {
      const volumeChange = ((project.volume24h - previous.volume24h) / previous.volume24h) * 100;
      if (volumeChange > 50) score += 15;
      else if (volumeChange > 25) score += 10;
      else if (volumeChange < -25) score -= 10;
    }

    if (previous?.holders) {
      const holderGrowth = ((project.holders - previous.holders) / previous.holders) * 100;
      if (holderGrowth > 10) score += 15;
      else if (holderGrowth > 5) score += 10;
      else if (holderGrowth < -5) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  };

  const generateAlerts = (project: Project, previous?: Project): MomentumAlert[] => {
    const alerts: MomentumAlert[] = [];

    if (project.change24h > 50) {
      alerts.push({
        type: 'SPIKE',
        severity: 'CRITICAL',
        message: `${project.tick} surged ${project.change24h.toFixed(1)}% in 24h!`,
        timestamp: new Date()
      });
    } else if (project.change24h > 20) {
      alerts.push({
        type: 'SPIKE',
        severity: 'WARNING',
        message: `${project.tick} up ${project.change24h.toFixed(1)}% - Strong momentum`,
        timestamp: new Date()
      });
    }

    if (previous?.volume24h) {
      const volumeChange = ((project.volume24h - previous.volume24h) / previous.volume24h) * 100;
      if (volumeChange > 100) {
        alerts.push({
          type: 'VOLUME_SURGE',
          severity: 'WARNING',
          message: `${project.tick} volume surged ${volumeChange.toFixed(0)}%`,
          timestamp: new Date()
        });
      }
    }

    if (project.change24h < -30) {
      alerts.push({
        type: 'DUMP',
        severity: 'CRITICAL',
        message: `${project.tick} down ${Math.abs(project.change24h).toFixed(1)}% - High risk`,
        timestamp: new Date()
      });
    }

    if (previous?.holders) {
      const holderGrowth = ((project.holders - previous.holders) / previous.holders) * 100;
      if (holderGrowth > 20) {
        alerts.push({
          type: 'HOLDER_GROWTH',
          severity: 'INFO',
          message: `${project.tick} gained ${holderGrowth.toFixed(0)}% more holders`,
          timestamp: new Date()
        });
      }
    }

    return alerts;
  };

  // Real data fetching functions
  const fetchHoldersCount = async (mintAddress: string): Promise<number> => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "fetch-holders",
          method: "getTokenLargestAccounts",
          params: [mintAddress],
        }),
      });
      const { result, error } = await response.json();
      if (error) throw new Error(error.message);
      const nonZeroHolders = result.value.filter((acc: any) => Number(acc.amount) > 0);
      return nonZeroHolders.length;
    } catch (err) {
      console.error("Error fetching holders:", err);
      return 0;
    }
  };

  const fetchPriceData = async (mintAddress: string) => {
    try {
      const response = await fetch(`https://api.jup.ag/price/v2?ids=${mintAddress}`);
      if (!response.ok) throw new Error(`Failed to fetch price: ${response.status}`);
      const data = await response.json();
      const priceInfo = data.data?.[mintAddress];
      return priceInfo ? { price: priceInfo.price } : null;
    } catch (err) {
      console.error("Error fetching price:", err);
      return null;
    }
  };

  const fetchTokenSupply = async (mintAddress: string): Promise<number> => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenSupply',
          params: [mintAddress]
        })
      });
      const data = await response.json();
      if (data.result?.value?.uiAmount) {
        return data.result.value.uiAmount;
      }
      return 0;
    } catch (err) {
      console.error('Error fetching supply:', err);
      return 0;
    }
  };

  const fetchDexData = async (mintAddress: string) => {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`);
      if (!response.ok) throw new Error('Failed to fetch DEX data');
      const data = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0];
        return {
          price: parseFloat(pair.priceUsd) || 0,
          volume24h: parseFloat(pair.volume?.h24) || 0,
          priceChange24h: parseFloat(pair.priceChange?.h24) || 0,
          liquidity: parseFloat(pair.liquidity?.usd) || 0
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching DEX data:', err);
      return null;
    }
  };

  const fetchProjectData = async (config: ProjectConfig): Promise<Project> => {
    try {
      const [dexData, holders, supply] = await Promise.all([
        fetchDexData(config.contractAddress),
        fetchHoldersCount(config.contractAddress),
        fetchTokenSupply(config.contractAddress)
      ]);

      if (!dexData) {
        const priceData = await fetchPriceData(config.contractAddress);
        if (priceData) {
          const marketCap = priceData.price * supply;
          const baseProject = {
            ...config,
            price: priceData.price || 0,
            change24h: 0,
            volume24h: 0,
            marketCap: marketCap,
            holders: holders,
            supply: supply
          };
          
          const project = {
            ...baseProject,
            securityScore: calculateSecurityScore(baseProject),
            momentum24h: 50
          };

          const previous = previousProjects.find(p => p.id === project.id);
          const enhancedInsight = generateEnhancedAIInsight(project, previous);

          return {
            ...project,
            aiInsight: {
              signal: enhancedInsight.signal,
              confidence: enhancedInsight.confidence,
              reason: enhancedInsight.reason,
              timeframe: enhancedInsight.timeframe
            },
            momentumSignals: enhancedInsight.momentumSignals
          };
        }
      }

      const marketCap = dexData ? dexData.price * supply : 0;
      const baseProject = {
        ...config,
        price: dexData?.price || 0,
        change24h: dexData?.priceChange24h || 0,
        volume24h: dexData?.volume24h || 0,
        marketCap: marketCap,
        holders: holders,
        supply: supply,
        liquidity: dexData?.liquidity
      };

      const project = {
        ...baseProject,
        securityScore: calculateSecurityScore(baseProject),
        momentum24h: calculateMomentum(baseProject)
      };

      const previous = previousProjects.find(p => p.id === project.id);
      const enhancedInsight = generateEnhancedAIInsight(project, previous);

      return {
        ...project,
        aiInsight: {
          signal: enhancedInsight.signal,
          confidence: enhancedInsight.confidence,
          reason: enhancedInsight.reason,
          timeframe: enhancedInsight.timeframe
        },
        momentumSignals: enhancedInsight.momentumSignals
      };
    } catch (err) {
      console.error(`Error fetching data for ${config.tick}:`, err);
      return {
        ...config,
        price: 0,
        change24h: 0,
        volume24h: 0,
        marketCap: 0,
        holders: 0,
        supply: 0,
        error: true,
        momentum24h: 0
      };
    }
  };

  const fetchAllProjectsData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      setPreviousProjects(projects);
      
      const projectsData = await Promise.all(
        projectConfigs.map(config => fetchProjectData(config))
      );
      
      const projectsWithAlerts = projectsData.map((project) => {
        const previous = previousProjects.find(p => p.id === project.id);
        return {
          ...project,
          momentumAlerts: generateAlerts(project, previous),
          momentum24h: calculateMomentum(project, previous)
        };
      });
      
      const totalMarketCap = projectsData.reduce((sum, p) => sum + (p.marketCap || 0), 0);
      const totalVolume = projectsData.reduce((sum, p) => sum + (p.volume24h || 0), 0);
      const avgMomentum = projectsData.reduce((sum, p) => sum + (p.momentum24h || 0), 0) / projectsData.length;
      const topGainer = projectsData.reduce((max, p) => 
        (p.change24h || 0) > (max.change24h || 0) ? p : max, projectsData[0]
      );
      
      setProjects(projectsWithAlerts);
      setMarketData({
        totalMarketCap,
        volume24h: totalVolume,
        avgMomentum,
        topGainer: topGainer.tick
      });
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to fetch market data. Please try again.');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProjectsData();
    const interval = setInterval(fetchAllProjectsData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate trading opportunities from real data
  useEffect(() => {
    const newOpportunities: TradingOpportunity[] = [];
    const newActiveSignals: MomentumSignal[] = [];

    projects.forEach(project => {
      if (project.momentumSignals) {
        project.momentumSignals.forEach(signal => {
          if (signal.strength >= 70) {
            const riskReward = signal.priceTarget && signal.stopLoss 
              ? (signal.priceTarget - project.price) / (project.price - signal.stopLoss)
              : 2;
            
            newOpportunities.push({
              projectId: project.id,
              signal,
              riskReward,
              timeframe: '1-3 days',
              urgency: signal.strength >= 80 ? 'HIGH' : signal.strength >= 70 ? 'MEDIUM' : 'LOW'
            });

            newActiveSignals.push(signal);
          }
        });
      }
    });

    setTradingOpportunities(newOpportunities.slice(0, 5));
    setActiveSignals(newActiveSignals.slice(0, 10));
  }, [projects]);

  const formatNumber = (num: number): string => {
    if (!num || num === 0) return '$0';
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  const formatPrice = (price: number): string => {
    if (!price || price === 0) return '$0.00';
    if (price < 0.000001) {
      return `$${price.toExponential(2)}`;
    } else if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toFixed(4)}`;
  };

  const getSecurityColor = (score?: SecurityScore) => {
    if (!score) return 'text-gray-500';
    if (score.overall >= 80) return 'text-green-500';
    if (score.overall >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSecurityIcon = (score?: SecurityScore) => {
    if (!score) return <Shield size={16} />;
    if (score.overall >= 80) return <CheckCircle size={16} />;
    if (score.overall >= 50) return <AlertCircle size={16} />;
    return <AlertTriangle size={16} />;
  };

  const getMomentumColor = (momentum?: number) => {
    if (!momentum) return 'text-gray-500';
    if (momentum >= 70) return 'text-green-500';
    if (momentum >= 50) return 'text-cyan-500';
    if (momentum >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSignalColor = (signal?: AIInsight['signal']) => {
    if (signal === 'BUY') return 'text-green-500 bg-green-500/10';
    if (signal === 'SELL') return 'text-red-500 bg-red-500/10';
    if (signal === 'WATCH') return 'text-yellow-500 bg-yellow-500/10';
    return 'text-gray-500 bg-gray-500/10';
  };

  const toggleWatchlist = (projectId: number) => {
    setWatchlist(prev => {
      const exists = prev.find(w => w.projectId === projectId);
      if (exists) {
        return prev.filter(w => w.projectId !== projectId);
      } else {
        return [...prev, { projectId }];
      }
    });
  };

  const isInWatchlist = (projectId: number) => {
    return watchlist.some(w => w.projectId === projectId);
  };

  const toggleCompare = (projectId: number) => {
    setCompareProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else if (prev.length < 3) {
        return [...prev, projectId];
      }
      return prev;
    });
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  // Sort and filter projects
  let filteredProjects = projects.filter(project => {
    const matchesSearch = project.tick.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'ALL' || project.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  filteredProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'momentum') {
      return (b.momentum24h || 0) - (a.momentum24h || 0);
    } else if (sortBy === 'security') {
      return (b.securityScore?.overall || 0) - (a.securityScore?.overall || 0);
    } else {
      return (b.marketCap || 0) - (a.marketCap || 0);
    }
  });

  const allAlerts = projects.flatMap(p => 
    (p.momentumAlerts || []).map(alert => ({ ...alert, project: p.tick }))
  ).slice(0, 5);

  const filters: FilterType[] = ['MEME', 'DEFI', 'GAMER', 'X SCAN'];

  const MiniSparkline: React.FC<{ change: number }> = ({ change }) => {
    const isPositive = change >= 0;
    const points = Array.from({ length: 10 }, (_, i) => {
      const variance = Math.random() * 10 - 5;
      return 50 + (change / 2) + variance;
    });
    
    const maxY = Math.max(...points);
    const minY = Math.min(...points);
    const normalize = (y: number) => ((y - minY) / (maxY - minY)) * 30;
    
    const pathData = points.map((y, i) => 
      `${i === 0 ? 'M' : 'L'} ${i * 4} ${40 - normalize(y)}`
    ).join(' ');

    return (
      <svg width="40" height="40" className="inline-block">
        <path
          d={pathData}
          fill="none"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="2"
        />
      </svg>
    );
  };

  // Trading Intelligence Panel Component
  const TradingIntelligencePanel = () => (
    <div className="mb-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-yellow-500" />
          <span className="font-bold text-yellow-400">TRADING INTELLIGENCE</span>
          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full animate-pulse">
            LIVE
          </span>
        </div>
        <button 
          onClick={() => setShowTradingPanel(!showTradingPanel)}
          className="text-gray-500 hover:text-white transition-colors"
        >
          {showTradingPanel ? '↑' : '↓'}
        </button>
      </div>

      {showTradingPanel && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trading Opportunities */}
          <div className="space-y-4">
            <h3 className="font-bold text-green-400 flex items-center gap-2">
              <TrendingUp size={16} />
              Hot Opportunities
            </h3>
            {tradingOpportunities.length > 0 ? (
              tradingOpportunities.map((opp, index) => {
                const project = projects.find(p => p.id === opp.projectId);
                return (
                  <div key={index} className="bg-black/40 p-3 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{project?.icon}</span>
                        <span className="font-bold">{project?.tick}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        opp.urgency === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                        opp.urgency === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {opp.urgency}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 mb-2">{opp.signal.description}</div>
                    <div className="flex justify-between text-xs">
                      <span>R/R: {opp.riskReward.toFixed(2)}</span>
                      <span>Target: {formatPrice(opp.signal.priceTarget || 0)}</span>
                      <span>SL: {formatPrice(opp.signal.stopLoss || 0)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 text-sm text-center py-4">
                No high-confidence opportunities at the moment
              </div>
            )}
          </div>

          {/* Active Signals */}
          <div className="space-y-4">
            <h3 className="font-bold text-purple-400 flex items-center gap-2">
              <Activity size={16} />
              Active Signals
            </h3>
            {activeSignals.length > 0 ? (
              activeSignals.map((signal, index) => (
                <div key={index} className="bg-black/40 p-3 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-bold text-sm ${
                      signal.type === 'BREAKOUT' ? 'text-green-400' :
                      signal.type === 'REVERSAL' ? 'text-yellow-400' :
                      signal.type === 'TRENDING' ? 'text-cyan-400' :
                      'text-gray-400'
                    }`}>
                      {signal.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {signal.strength}% strength
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">{signal.description}</div>
                  <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        signal.strength >= 80 ? 'bg-green-500' :
                        signal.strength >= 70 ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${signal.strength}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm text-center py-4">
                No active trading signals
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Enhanced AI Intelligence Panel
  const EnhancedAIIntelligencePanel = () => {
    const buySignals = projects.filter(p => p.aiInsight?.signal === 'BUY').length;
    const watchSignals = projects.filter(p => p.aiInsight?.signal === 'WATCH').length;
    const strongMomentum = projects.filter(p => (p.momentum24h || 0) >= 70).length;
    const highSecurity = projects.filter(p => (p.securityScore?.overall || 0) >= 80).length;

    return (
      <div className="mb-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-purple-400" />
            <span className="font-bold text-purple-400">AI MARKET INTELLIGENCE</span>
          </div>
          <button onClick={() => setShowAIInsights(false)} className="text-gray-500 hover:text-white">
            ✕
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/40 p-4 rounded-lg border-l-4 border-green-500">
            <div className="text-xs text-gray-400 mb-1">BUY Signals</div>
            <div className="text-2xl font-bold text-green-500">{buySignals}</div>
            <div className="text-xs text-gray-500 mt-1">Trading Opportunities</div>
          </div>
          <div className="bg-black/40 p-4 rounded-lg border-l-4 border-yellow-500">
            <div className="text-xs text-gray-400 mb-1">WATCH Signals</div>
            <div className="text-2xl font-bold text-yellow-500">{watchSignals}</div>
            <div className="text-xs text-gray-500 mt-1">Potential Entries</div>
          </div>
          <div className="bg-black/40 p-4 rounded-lg border-l-4 border-cyan-500">
            <div className="text-xs text-gray-400 mb-1">Strong Momentum</div>
            <div className="text-2xl font-bold text-cyan-500">{strongMomentum}</div>
            <div className="text-xs text-gray-500 mt-1">Trending Projects</div>
          </div>
          <div className="bg-black/40 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="text-xs text-gray-400 mb-1">High Security</div>
            <div className="text-2xl font-bold text-blue-500">{highSecurity}</div>
            <div className="text-xs text-gray-500 mt-1">Safe Projects</div>
          </div>
        </div>
      </div>
    );
  };

  // Project Detail Modal Component
  const ProjectDetailModal = ({ project, onClose }: { project: Project; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 backdrop-blur-sm border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{project.icon}</div>
              <div>
                <h2 className="text-3xl font-bold">{project.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xl text-gray-400">{project.tick}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    project.category === 'DEFI' ? 'bg-blue-500/20 text-blue-400' :
                    project.category === 'MEME' ? 'bg-purple-500/20 text-purple-400' :
                    project.category === 'GAMER' ? 'bg-green-500/20 text-green-400' :
                    'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {project.category}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price & Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`${darkMode ? 'bg-black/40' : 'bg-gray-100'} p-4 rounded-xl`}>
              <div className="text-xs text-gray-400 mb-1">Price</div>
              <div className="text-2xl font-bold">{formatPrice(project.price)}</div>
              <div className={`text-sm mt-1 ${project.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {project.change24h >= 0 ? '+' : ''}{project.change24h.toFixed(2)}%
              </div>
            </div>
            <div className={`${darkMode ? 'bg-black/40' : 'bg-gray-100'} p-4 rounded-xl`}>
              <div className="text-xs text-gray-400 mb-1">Market Cap</div>
              <div className="text-2xl font-bold">{formatNumber(project.marketCap)}</div>
            </div>
            <div className={`${darkMode ? 'bg-black/40' : 'bg-gray-100'} p-4 rounded-xl`}>
              <div className="text-xs text-gray-400 mb-1">Volume 24h</div>
              <div className="text-2xl font-bold">{formatNumber(project.volume24h)}</div>
            </div>
            <div className={`${darkMode ? 'bg-black/40' : 'bg-gray-100'} p-4 rounded-xl`}>
              <div className="text-xs text-gray-400 mb-1">Holders</div>
              <div className="text-2xl font-bold">{project.holders.toLocaleString()}</div>
            </div>
          </div>

          {/* AI Insight */}
          {project.aiInsight && (
            <div className={`${darkMode ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20' : 'bg-purple-50'} border ${darkMode ? 'border-purple-500/30' : 'border-purple-200'} rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain size={20} className="text-purple-400" />
                  <span className="font-bold">AI Trading Signal</span>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold ${getSignalColor(project.aiInsight.signal)}`}>
                  {project.aiInsight.signal}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Confidence</span>
                  <span className="font-bold">{project.aiInsight.confidence}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${project.aiInsight.confidence}%` }}
                  />
                </div>
                <div className="text-sm text-gray-300 mt-3">
                  <strong>Reason:</strong> {project.aiInsight.reason}
                </div>
                <div className="text-xs text-gray-500">
                  Timeframe: {project.aiInsight.timeframe}
                </div>
              </div>
            </div>
          )}

          {/* Momentum Signals */}
          {project.momentumSignals && project.momentumSignals.length > 0 && (
            <div className={`${darkMode ? 'bg-gradient-to-r from-cyan-900/20 to-blue-900/20' : 'bg-cyan-50'} border ${darkMode ? 'border-cyan-500/30' : 'border-cyan-200'} rounded-xl p-6`}>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={20} className="text-cyan-400" />
                <span className="font-bold">Momentum Signals</span>
              </div>
              <div className="space-y-3">
                {project.momentumSignals.map((signal, index) => (
                  <div key={index} className="bg-black/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold ${
                        signal.type === 'BREAKOUT' ? 'text-green-400' :
                        signal.type === 'REVERSAL' ? 'text-yellow-400' :
                        signal.type === 'TRENDING' ? 'text-cyan-400' :
                        'text-gray-400'
                      }`}>
                        {signal.type}
                      </span>
                      <span className="text-sm text-gray-400">{signal.strength}% strength</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{signal.description}</p>
                    {(signal.priceTarget || signal.stopLoss) && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {signal.priceTarget && (
                          <div>
                            <span className="text-gray-400">Target: </span>
                            <span className="text-green-400 font-bold">{formatPrice(signal.priceTarget)}</span>
                          </div>
                        )}
                        {signal.stopLoss && (
                          <div>
                            <span className="text-gray-400">Stop: </span>
                            <span className="text-red-400 font-bold">{formatPrice(signal.stopLoss)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Analysis */}
          {project.securityScore && (
            <div className={`${darkMode ? 'bg-black/40' : 'bg-gray-100'} rounded-xl p-6`}>
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-blue-400" />
                <span className="font-bold">Security Analysis</span>
                <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${
                  project.securityScore.risk === 'LOW' ? 'bg-green-500/20 text-green-400' :
                  project.securityScore.risk === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {project.securityScore.risk} RISK
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Overall Score</div>
                  <div className="text-2xl font-bold">{project.securityScore.overall}/100</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Liquidity Score</div>
                  <div className="text-2xl font-bold">{project.securityScore.liquidity}/100</div>
                </div>
              </div>
              {project.securityScore.flags.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Security Flags:</div>
                  {project.securityScore.flags.map((flag, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-yellow-400">
                      <AlertTriangle size={14} />
                      {flag}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contract Address */}
          <div className={`${darkMode ? 'bg-black/40' : 'bg-gray-100'} rounded-xl p-4`}>
            <div className="text-xs text-gray-400 mb-2">Contract Address</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono">{project.contractAddress}</code>
              <button 
                onClick={() => copyAddress(project.contractAddress)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Copy size={16} />
              </button>
              <a 
                href={`https://solscan.io/token/${project.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => toggleWatchlist(project.id)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                isInWatchlist(project.id)
                  ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Star size={18} className="inline-block mr-2" fill={isInWatchlist(project.id) ? 'currentColor' : 'none'} />
              {isInWatchlist(project.id) ? 'In Watchlist' : 'Add to Watchlist'}
            </button>
            <button
              onClick={() => toggleCompare(project.id)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                compareProjects.includes(project.id)
                  ? 'bg-cyan-500 text-black hover:bg-cyan-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <BarChart2 size={18} className="inline-block mr-2" />
              {compareProjects.includes(project.id) ? 'Remove from Compare' : 'Compare'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Comparison Modal
  const ComparisonModal = ({ projectIds, onClose }: { projectIds: number[]; onClose: () => void }) => {
    const compareProjs = projects.filter(p => projectIds.includes(p.id));
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div 
          className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 backdrop-blur-sm border-b border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 size={24} className="text-cyan-400" />
                <h2 className="text-2xl font-bold">Project Comparison</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {compareProjs.map(project => (
                <div key={project.id} className={`${darkMode ? 'bg-black/40' : 'bg-gray-100'} rounded-xl p-6 space-y-4`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{project.icon}</div>
                    <div>
                      <div className="font-bold text-lg">{project.tick}</div>
                      <div className="text-sm text-gray-500">{project.name}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-400">Price</div>
                      <div className="text-xl font-bold">{formatPrice(project.price)}</div>
                      <div className={`text-sm ${project.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {project.change24h >= 0 ? '+' : ''}{project.change24h.toFixed(2)}%
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400">Momentum Score</div>
                      <div className="flex items-center gap-2">
                        <div className={`text-xl font-bold ${getMomentumColor(project.momentum24h)}`}>
                          {project.momentum24h?.toFixed(0)}
                        </div>
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              (project.momentum24h || 0) >= 70 ? 'bg-green-500' :
                              (project.momentum24h || 0) >= 50 ? 'bg-cyan-500' :
                              (project.momentum24h || 0) >= 30 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${project.momentum24h}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400">Security Score</div>
                      <div className="flex items-center gap-2">
                        <div className={`text-xl font-bold ${getSecurityColor(project.securityScore)}`}>
                          {project.securityScore?.overall.toFixed(0)}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${
                          project.securityScore?.risk === 'LOW' ? 'bg-green-500/20 text-green-400' :
                          project.securityScore?.risk === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {project.securityScore?.risk}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400">AI Signal</div>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getSignalColor(project.aiInsight?.signal)}`}>
                        {project.aiInsight?.signal}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400">Market Cap</div>
                      <div className="text-lg font-bold">{formatNumber(project.marketCap)}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400">Volume 24h</div>
                      <div className="text-lg font-bold">{formatNumber(project.volume24h)}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400">Holders</div>
                      <div className="text-lg font-bold">{project.holders.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Modals */}
      {selectedProject && <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      {showCompare && compareProjects.length > 0 && (
        <ComparisonModal projectIds={compareProjects} onClose={() => setShowCompare(false)} />
      )}

      {/* Header */}
      <header className="border-b border-gray-800 p-4 sticky top-0 bg-black/80 backdrop-blur-sm z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <div className="text-2xl">🌀</div>
            </div>
            <h1 className="text-2xl font-bold">Signiq Market</h1>
            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full border border-cyan-500/30">
              LIVE INTELLIGENCE
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {watchlist.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <Star size={16} className="text-yellow-500" fill="currentColor" />
                <span className="text-sm font-semibold">{watchlist.length} Watching</span>
              </div>
            )}
            {compareProjects.length > 0 && (
              <button
                onClick={() => setShowCompare(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
              >
                <BarChart2 size={16} />
                Compare ({compareProjects.length})
              </button>
            )}
            <button 
              onClick={fetchAllProjectsData}
              disabled={loading}
              className="p-2 rounded-full border-2 border-gray-700 hover:bg-gray-800 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            {/* <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              CONNECT WALLET
            </button> */}
            {/* <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full border-2 border-gray-700 hover:bg-gray-800 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button> */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Live Alerts Banner */}
        {showAlerts && allAlerts.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="text-cyan-400" size={20} />
                <span className="font-bold text-cyan-400">LIVE MOMENTUM ALERTS</span>
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">
                  LIVE
                </span>
              </div>
              <button onClick={() => setShowAlerts(false)} className="text-gray-500 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {allAlerts.map((alert, i) => (
                <div key={i} className={`flex items-center gap-3 text-sm p-2 rounded ${
                  alert.severity === 'CRITICAL' ? 'bg-red-500/10' : 
                  alert.severity === 'WARNING' ? 'bg-yellow-500/10' : 
                  'bg-blue-500/10'
                }`}>
                  {alert.type === 'SPIKE' && <TrendingUp size={16} className="text-green-500" />}
                  {alert.type === 'DUMP' && <TrendingDown size={16} className="text-red-500" />}
                  {alert.type === 'VOLUME_SURGE' && <Zap size={16} className="text-yellow-500" />}
                  <span className="font-mono text-cyan-400">[{alert.project}]</span>
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Intelligence & Trading Panels */}
        <EnhancedAIIntelligencePanel />
        <TradingIntelligencePanel />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-2xl p-6`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-5xl font-bold mb-2">
                  {loading ? '...' : formatNumber(marketData.totalMarketCap)}
                </h2>
                <p className="text-gray-400 text-lg">Market Capitalization</p>
              </div>
              <div className="text-green-500">
                <svg className="w-20 h-12" viewBox="0 0 80 48">
                  <path d="M 0,40 Q 20,30 40,20 T 80,10" fill="none" stroke="currentColor" strokeWidth="3"/>
                </svg>
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-2xl p-6`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-5xl font-bold mb-2">
                  {loading ? '...' : formatNumber(marketData.volume24h)}
                </h2>
                <p className="text-gray-400 text-lg">24H Volume</p>
              </div>
              <div className="text-green-500">
                <svg className="w-20 h-12" viewBox="0 0 80 48">
                  <path d="M 0,30 Q 20,35 40,25 T 80,15" fill="none" stroke="currentColor" strokeWidth="3"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filters, and Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 px-6 py-3 rounded-xl ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'} border-2 focus:outline-none focus:border-cyan-400`}
          />
          
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-cyan-400 text-black'
                  : darkMode 
                    ? 'bg-gray-900 hover:bg-gray-800'
                    : 'bg-white hover:bg-gray-100'
              }`}
            >
              ALL
            </button>
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeFilter === filter
                    ? 'bg-cyan-400 text-black'
                    : darkMode 
                      ? 'bg-gray-900 hover:bg-gray-800'
                      : 'bg-white hover:bg-gray-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Sort & View Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('momentum')}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                sortBy === 'momentum'
                  ? 'bg-green-500 text-white'
                  : darkMode ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-100'
              }`}
            >
              🚀 Momentum
            </button>
            <button
              onClick={() => setSortBy('security')}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                sortBy === 'security'
                  ? 'bg-blue-500 text-white'
                  : darkMode ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-100'
              }`}
            >
              🛡️ Security
            </button>
            <button
              onClick={() => setSortBy('marketCap')}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                sortBy === 'marketCap'
                  ? 'bg-purple-500 text-white'
                  : darkMode ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-100'
              }`}
            >
              💰 Market Cap
            </button>
          </div>
        </div>

        {/* Projects Table */}
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${darkMode ? 'bg-black' : 'bg-gray-100'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                  <th className="text-left p-4 font-semibold">#</th>
                  <th className="text-left p-4 font-semibold">Project</th>
                  <th className="text-left p-4 font-semibold">Price</th>
                  <th className="text-left p-4 font-semibold">24h</th>
                  <th className="text-left p-4 font-semibold">Chart</th>
                  <th className="text-left p-4 font-semibold">Volume</th>
                  <th className="text-left p-4 font-semibold">Market Cap</th>
                  <th className="text-left p-4 font-semibold">
                    <div className="flex items-center gap-1">
                      <Zap size={14} className="text-yellow-500" />
                      Momentum
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold">
                    <div className="flex items-center gap-1">
                      <Shield size={14} className="text-blue-500" />
                      Security
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold">
                    <div className="flex items-center gap-1">
                      <Brain size={14} className="text-purple-500" />
                      AI Signal
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && projects.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center p-8 text-gray-400">
                      <RefreshCw className="animate-spin inline-block mr-2" size={20} />
                      Loading market intelligence...
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center p-8 text-gray-400">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project, index) => (
                    <tr 
                      key={project.id}
                      className={`border-b ${darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors cursor-pointer ${project.error ? 'opacity-50' : ''}`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <td className="p-4 font-semibold text-gray-500">{index + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{project.icon}</div>
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              {project.tick}
                              {isInWatchlist(project.id) && (
                                <Star size={14} className="text-yellow-500" fill="currentColor" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{project.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm">{formatPrice(project.price)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {project.change24h >= 0 ? (
                            <ArrowUpRight size={16} className="text-green-500" />
                          ) : (
                            <ArrowDownRight size={16} className="text-red-500" />
                          )}
                          <span className={`font-semibold ${project.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {project.change24h >= 0 ? '+' : ''}{project.change24h.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <MiniSparkline change={project.change24h} />
                      </td>
                      <td className="p-4 text-sm">{formatNumber(project.volume24h)}</td>
                      <td className="p-4 text-sm">{formatNumber(project.marketCap)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`font-bold text-lg ${getMomentumColor(project.momentum24h)}`}>
                            {project.momentum24h?.toFixed(0)}
                          </div>
                          <div className="w-12 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                (project.momentum24h || 0) >= 70 ? 'bg-green-500' :
                                (project.momentum24h || 0) >= 50 ? 'bg-cyan-500' :
                                (project.momentum24h || 0) >= 30 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${project.momentum24h}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={getSecurityColor(project.securityScore)}>
                            {getSecurityIcon(project.securityScore)}
                          </span>
                          <div>
                            <div className={`font-bold text-sm ${getSecurityColor(project.securityScore)}`}>
                              {project.securityScore?.overall.toFixed(0) || 'N/A'}
                            </div>
                            {project.securityScore && (
                              <div className={`text-xs ${
                                project.securityScore.risk === 'LOW' ? 'text-green-500' :
                                project.securityScore.risk === 'MEDIUM' ? 'text-yellow-500' :
                                'text-red-500'
                              }`}>
                                {project.securityScore.risk}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {project.aiInsight && (
                          <div className="flex flex-col gap-1">
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-center ${getSignalColor(project.aiInsight.signal)}`}>
                              {project.aiInsight.signal}
                            </div>
                            {project.momentumSignals && project.momentumSignals.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {project.momentumSignals.slice(0, 2).map((signal, idx) => (
                                  <div
                                    key={idx}
                                    className={`text-xs px-2 py-1 rounded ${
                                      signal.type === 'BREAKOUT' ? 'bg-green-500/20 text-green-400' :
                                      signal.type === 'REVERSAL' ? 'bg-yellow-500/20 text-yellow-400' :
                                      signal.type === 'TRENDING' ? 'bg-cyan-500/20 text-cyan-400' :
                                      'bg-gray-500/20 text-gray-400'
                                    }`}
                                    title={signal.description}
                                  >
                                    {signal.type.slice(0, 3)}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 text-center">
                              {project.aiInsight.confidence}% conf.
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleWatchlist(project.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isInWatchlist(project.id)
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                            title={isInWatchlist(project.id) ? 'Remove from watchlist' : 'Add to watchlist'}
                          >
                            <Star size={16} fill={isInWatchlist(project.id) ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => toggleCompare(project.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              compareProjects.includes(project.id)
                                ? 'bg-cyan-500/20 text-cyan-500'
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                            title={compareProjects.includes(project.id) ? 'Remove from compare' : 'Add to compare'}
                            disabled={!compareProjects.includes(project.id) && compareProjects.length >= 3}
                          >
                            <BarChart2 size={16} />
                          </button>
                          <button
                            onClick={() => setSelectedProject(project)}
                            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm space-y-2">
          <p>
            🧠 AI-Powered Intelligence • Real-time Momentum Tracking • Security Scoring • Advanced Trading Signals
            {lastUpdate && ` • Last updated: ${lastUpdate.toLocaleTimeString()}`}
          </p>
          <p className="text-xs">
            Price data from DexScreener & Jupiter • On-chain data from Solana RPC • AI signals by Signiq Intelligence Engine
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Documentation</a>
            <span className="text-gray-700">•</span>
            <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">API Access</a>
            <span className="text-gray-700">•</span>
            <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Discord</a>
            <span className="text-gray-700">•</span>
            <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Twitter</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigniqMarket;