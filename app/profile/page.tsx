'use client'

import React, { useState, useEffect } from 'react';
import { TrendingUp, Moon, Sun, RefreshCw, AlertCircle, Shield, AlertTriangle, TrendingDown, Zap, Lock, CheckCircle } from 'lucide-react';

interface MarketData {
  totalMarketCap: number;
  volume24h: number;
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
  overall: number; // 0-100
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
  momentum24h?: number; // Combined momentum score
}

interface TokenMetadata {
  symbol?: string;
  name?: string;
  decimals?: number;
}

interface PriceData {
  price: number;
}

interface DexData {
  price: number;
  volume24h: number;
  priceChange24h: number;
  liquidity: number;
}

type FilterType = 'ALL' | 'MEME' | 'DEFI' | 'GAMER' | 'X SCAN';

const SigniqMarket: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showAlerts, setShowAlerts] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'momentum' | 'security' | 'marketCap'>('momentum');
  
  const [marketData, setMarketData] = useState<MarketData>({
    totalMarketCap: 0,
    volume24h: 0
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
    }
  ];

  const [projects, setProjects] = useState<Project[]>([]);
  const [previousProjects, setPreviousProjects] = useState<Project[]>([]);

  // Calculate Security Score
  const calculateSecurityScore = (project: Partial<Project>): SecurityScore => {
    const flags: string[] = [];
    let liquidityScore = 0;
    let distributionScore = 0;

    // Liquidity score (out of 50)
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

    // Holder distribution score (out of 50)
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

    // Check for suspicious patterns
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
      liquidity: liquidityScore * 2, // Convert to 0-100
      holderDistribution: distributionScore * 2,
      contractVerified: true, // Would check on-chain in production
      risk,
      flags
    };
  };

  // Calculate Momentum Score (0-100)
  const calculateMomentum = (project: Project, previous?: Project): number => {
    let score = 50; // Base score

    // Price momentum (±20 points)
    if (project.change24h > 20) score += 20;
    else if (project.change24h > 10) score += 15;
    else if (project.change24h > 5) score += 10;
    else if (project.change24h < -20) score -= 20;
    else if (project.change24h < -10) score -= 15;

    // Volume momentum (±15 points)
    if (previous?.volume24h) {
      const volumeChange = ((project.volume24h - previous.volume24h) / previous.volume24h) * 100;
      if (volumeChange > 50) score += 15;
      else if (volumeChange > 25) score += 10;
      else if (volumeChange < -25) score -= 10;
    }

    // Holder growth (±15 points)
    if (previous?.holders) {
      const holderGrowth = ((project.holders - previous.holders) / previous.holders) * 100;
      if (holderGrowth > 10) score += 15;
      else if (holderGrowth > 5) score += 10;
      else if (holderGrowth < -5) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  };

  // Generate Momentum Alerts
  const generateAlerts = (project: Project, previous?: Project): MomentumAlert[] => {
    const alerts: MomentumAlert[] = [];

    // Price spike alert
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

    // Volume surge alert
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

    // Dump alert
    if (project.change24h < -30) {
      alerts.push({
        type: 'DUMP',
        severity: 'CRITICAL',
        message: `${project.tick} down ${Math.abs(project.change24h).toFixed(1)}% - High risk`,
        timestamp: new Date()
      });
    }

    // Holder growth
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

  // Fetch functions (keep existing)
  const fetchTokenMetadata = async (mintAddress: string) => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "fetch-token-metadata",
          method: "getAsset",
          params: { id: mintAddress },
        }),
      });
      const { result, error } = await response.json();
      if (error) throw new Error(error.message);
      return result;
    } catch (err) {
      console.error("Error fetching metadata:", err);
      return null;
    }
  };

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

  const fetchPriceData = async (mintAddress: string): Promise<PriceData | null> => {
    try {
      const response = await fetch(`https://api.jup.ag/price/v2?ids=${mintAddress}`, {
        headers: { "User-Agent": "MyApp/1.0" },
      });
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

  const fetchDexData = async (mintAddress: string): Promise<DexData | null> => {
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
          
          return {
            ...baseProject,
            securityScore: calculateSecurityScore(baseProject),
            momentum24h: 50 // Default momentum
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

      return {
        ...baseProject,
        securityScore: calculateSecurityScore(baseProject),
        momentum24h: calculateMomentum(baseProject)
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
      setPreviousProjects(projects); // Store previous state
      
      const projectsData = await Promise.all(
        projectConfigs.map(config => fetchProjectData(config))
      );
      
      // Add momentum alerts based on previous data
      const projectsWithAlerts = projectsData.map((project, index) => {
        const previous = previousProjects.find(p => p.id === project.id);
        return {
          ...project,
          momentumAlerts: generateAlerts(project, previous),
          momentum24h: calculateMomentum(project, previous)
        };
      });
      
      const totalMarketCap = projectsData.reduce((sum, p) => sum + (p.marketCap || 0), 0);
      const totalVolume = projectsData.reduce((sum, p) => sum + (p.volume24h || 0), 0);
      
      setProjects(projectsWithAlerts);
      setMarketData({
        totalMarketCap,
        volume24h: totalVolume
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

  // Sort and filter projects
  let filteredProjects = projects.filter(project => {
    const matchesSearch = project.tick.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'ALL' || project.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Sort by selected criteria
  filteredProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'momentum') {
      return (b.momentum24h || 0) - (a.momentum24h || 0);
    } else if (sortBy === 'security') {
      return (b.securityScore?.overall || 0) - (a.securityScore?.overall || 0);
    } else {
      return (b.marketCap || 0) - (a.marketCap || 0);
    }
  });

  // Get all alerts across projects
  const allAlerts = projects.flatMap(p => 
    (p.momentumAlerts || []).map(alert => ({ ...alert, project: p.tick }))
  ).slice(0, 5); // Show top 5 alerts

  const filters: FilterType[] = ['MEME', 'DEFI', 'GAMER', 'X SCAN'];

  // Mini Sparkline Component
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

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
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
            <button 
              onClick={fetchAllProjectsData}
              disabled={loading}
              className="p-2 rounded-full border-2 border-gray-700 hover:bg-gray-800 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              CONNECT WALLET
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full border-2 border-gray-700 hover:bg-gray-800 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
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
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 px-6 py-3 rounded-xl ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'} border-2 focus:outline-none focus:border-cyan-400`}
          />
          
          <div className="flex gap-3 flex-wrap">
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

          {/* Sort Buttons */}
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
                  <th className="text-left p-4 font-semibold">Tick</th>
                  <th className="text-left p-4 font-semibold">Price</th>
                  <th className="text-left p-4 font-semibold">24h Chart</th>
                  <th className="text-left p-4 font-semibold">24h%</th>
                  <th className="text-left p-4 font-semibold">Volume (24h)</th>
                  <th className="text-left p-4 font-semibold">Market Cap</th>
                  <th className="text-left p-4 font-semibold">Holders</th>
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
                </tr>
              </thead>
              <tbody>
                {loading && projects.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center p-8 text-gray-400">
                      <RefreshCw className="animate-spin inline-block mr-2" size={20} />
                      Loading market intelligence...
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center p-8 text-gray-400">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project, index) => (
                    <tr 
                      key={project.id}
                      className={`border-b ${darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors ${project.error ? 'opacity-50' : ''}`}
                    >
                      <td className="p-4 font-semibold">{index + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{project.icon}</div>
                          <div>
                            <div className="font-bold">{project.tick}</div>
                            <div className="text-xs text-gray-500">{project.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm">{formatPrice(project.price)}</td>
                      <td className="p-4">
                        <MiniSparkline change={project.change24h} />
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold ${project.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {project.change24h >= 0 ? '+' : ''}{project.change24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="p-4">{formatNumber(project.volume24h)}</td>
                      <td className="p-4">{formatNumber(project.marketCap)}</td>
                      <td className="p-4">{project.holders.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`font-bold ${getMomentumColor(project.momentum24h)}`}>
                            {project.momentum24h?.toFixed(0)}
                          </div>
                          <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
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
                              <div className="text-xs text-gray-500">
                                {project.securityScore.risk}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            🧠 AI-Powered Intelligence • Real-time Momentum Tracking • Security Scoring
            {lastUpdate && ` • Last updated: ${lastUpdate.toLocaleTimeString()}`}
          </p>
          <p className="mt-2 text-xs">
            Price data from DexScreener & Jupiter • On-chain data from Solana RPC • Momentum & Security scores by Signiq AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default SigniqMarket;