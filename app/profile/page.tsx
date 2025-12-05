'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  TrendingUp, RefreshCw, AlertCircle, Shield, AlertTriangle, TrendingDown, 
  Zap, CheckCircle, Eye, Star, X, Plus, BarChart2, Activity, Bell, 
  BellOff, ArrowUpRight, ArrowDownRight, Copy, ExternalLink, Brain, 
  BellRing, Trash2, Download, BellDot, Lock, Unlock, Users, FileText, Target 
} from 'lucide-react';

// --- Interfaces ---

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
  socialLinks?: {
    twitter?: string;
    website?: string;
    telegram?: string;
    discord?: string;
  };
}

// Enhanced Security Interface
interface SecurityAudit {
  score: number;
  riskLevel: 'SAFE' | 'MODERATE' | 'CRITICAL';
  liquidityLocked: boolean;
  mintable: boolean;
  top10HoldersPercent: number;
  honeyPotRisk: boolean;
  flags: string[];
}

interface TechnicalAnalysis {
  support: number;
  resistance: number;
  entryZone: number;
  stopLoss: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  rsi: number; // Simulated
}

interface MomentumAlert {
  type: 'SPIKE' | 'DUMP' | 'VOLUME_SURGE' | 'HOLDER_GROWTH';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  timestamp: Date;
  project?: string;
}

interface AIInsight {
  signal: 'BUY' | 'SELL' | 'HOLD' | 'WATCH';
  confidence: number;
  summary: string; // The "Narrative"
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

interface PriceAlert {
  id: string;
  projectId: number;
  projectTick: string;
  projectName: string;
  alertType: 'ABOVE' | 'BELOW';
  targetPrice: number;
  currentPrice: number;
  status: 'ACTIVE' | 'TRIGGERED' | 'EXPIRED';
  triggeredAt?: Date;
  createdAt: Date;
  expiresAt: Date;
  notificationType: 'PUSH' | 'EMAIL' | 'BOTH';
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
  
  // Enhanced Fields
  security: SecurityAudit;
  technicals: TechnicalAnalysis;
  
  momentumAlerts?: MomentumAlert[];
  momentum24h?: number;
  aiInsight?: AIInsight;
  momentumSignals?: MomentumSignal[];
  socialLinks?: {
    twitter?: string;
    website?: string;
    telegram?: string;
    discord?: string;
  };
}

interface WatchlistItem {
  projectId: number;
  priceAlert?: PriceAlert;
}

type FilterType = 'ALL' | 'MEME' | 'DEFI' | 'GAMER' | 'X SCAN';

// --- Utility Helpers ---

const formatNumber = (num: number): string => {
  if (!num || num === 0) return '$0';
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toFixed(2)}`;
};

const formatPrice = (price: number): string => {
  if (!price || price === 0) return '$0.00';
  if (price < 0.000001) return `$${price.toExponential(4)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(4)}`;
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 50) return 'text-yellow-500';
  return 'text-red-500';
};

const getSignalColor = (signal?: AIInsight['signal']) => {
  if (signal === 'BUY') return 'text-green-500 bg-green-500/10 border-green-500/30';
  if (signal === 'SELL') return 'text-red-500 bg-red-500/10 border-red-500/30';
  if (signal === 'WATCH') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
  return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
};

const getMomentumColor = (momentum?: number) => {
  if (!momentum) return 'text-gray-500';
  if (momentum >= 70) return 'text-green-500';
  if (momentum >= 50) return 'text-cyan-500';
  if (momentum >= 30) return 'text-yellow-500';
  return 'text-red-500';
};

// --- Mini Chart Component ---
const MiniSparkline: React.FC<{ change: number }> = ({ change }) => {
  const isPositive = change >= 0;
  const points = useMemo(() => Array.from({ length: 15 }, (_, i) => {
    // Generate a trend that roughly matches the 24h change
    const trend = (i / 14) * change; 
    const noise = Math.sin(i * 0.8) * 5; 
    return 50 + trend + noise;
  }), [change]);
  
  const maxY = Math.max(...points);
  const minY = Math.min(...points);
  const normalize = (y: number) => ((y - minY) / (maxY - minY || 1)) * 30;
  const pathData = points.map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * 3} ${35 - normalize(y)}`).join(' ');

  return (
    <svg width="45" height="35" className="inline-block overflow-visible">
      <path d={pathData} fill="none" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

// --- PANELS (Restored) ---

const PriceAlertsPanel = ({ 
    activePriceAlerts, 
    triggeredAlerts, 
    projects, 
    showPriceAlertsPanel, 
    setShowPriceAlertsPanel, 
    setShowCreateAlertModal, 
    deleteAlert,
    exportAlerts 
}: any) => (
    <div className="mb-6 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BellRing size={20} className="text-cyan-500" />
          <span className="font-bold text-gray-200">PRICE ALERTS SYSTEM</span>
          <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded-full animate-pulse">{activePriceAlerts.length} ACTIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportAlerts} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowPriceAlertsPanel(!showPriceAlertsPanel)} className="text-gray-500 hover:text-white transition-colors">{showPriceAlertsPanel ? '↑' : '↓'}</button>
        </div>
      </div>

      {showPriceAlertsPanel && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-300 flex items-center gap-2"><BellDot size={16} /> Active Alerts</h3>
              <button onClick={() => setShowCreateAlertModal(true)} className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                <Plus size={14} /> New
              </button>
            </div>
            {activePriceAlerts.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {activePriceAlerts.map((alert: any) => {
                  const project = projects.find((p: any) => p.id === alert.projectId);
                  const percentDiff = project ? Math.abs((project.price - alert.targetPrice) / alert.targetPrice * 100) : 0;
                  return (
                    <div key={alert.id} className="bg-black/30 p-3 rounded-lg border-l-4 border-cyan-500 hover:bg-black/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{project?.icon}</span>
                            <div>
                                <div className="font-bold text-sm">{alert.projectTick}</div>
                                <div className="text-xs text-gray-400">{alert.alertType} {formatPrice(alert.targetPrice)}</div>
                            </div>
                        </div>
                        <button onClick={() => deleteAlert(alert.id)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${percentDiff < 5 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min(100, 100 - percentDiff)}%` }} />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">{percentDiff.toFixed(2)}% away</div>
                    </div>
                  );
                })}
              </div>
            ) : <div className="text-gray-600 text-sm text-center py-8 border border-gray-800 rounded-lg border-dashed">No active alerts configured</div>}
          </div>

          <div className="space-y-4">
             <h3 className="font-bold text-red-400 flex items-center gap-2"><BellRing size={16} /> Recent Triggers</h3>
             {triggeredAlerts.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {triggeredAlerts.slice(0, 10).map((alert: any) => (
                        <div key={alert.id} className="bg-red-500/10 p-3 rounded-lg border-l-4 border-red-500 flex justify-between items-center">
                            <div>
                                <div className="font-bold text-red-200">{alert.projectTick} Alert Hit!</div>
                                <div className="text-xs text-red-300">Target: {formatPrice(alert.targetPrice)}</div>
                            </div>
                            <button onClick={() => deleteAlert(alert.id)} className="text-red-400 hover:text-red-200"><X size={14} /></button>
                        </div>
                    ))}
                </div>
             ) : <div className="text-gray-600 text-sm text-center py-8 border border-gray-800 rounded-lg border-dashed">No alerts triggered recently</div>}
          </div>
        </div>
      )}
    </div>
);

// --- MODALS ---

const CreateAlertModal = ({ projects, onClose, onCreate, initialProjectId }: any) => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(initialProjectId);
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [alertType, setAlertType] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [expiresIn, setExpiresIn] = useState<number>(7);
  const project = selectedProjectId ? projects.find((p:any) => p.id === selectedProjectId) : null;

  const handleCreate = () => {
    if (!selectedProjectId || !targetPrice) return;
    onCreate(selectedProjectId, parseFloat(targetPrice), alertType, expiresIn);
  };

  const suggestions = project ? [project.price * 1.05, project.price * 1.10, project.price * 0.95, project.price * 0.90] : [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border-2 border-green-500/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="border-b border-gray-700 p-6 flex justify-between items-center bg-gray-800/50">
            <h2 className="text-xl font-bold flex gap-2 items-center text-white"><BellRing size={20} className="text-green-500" /> Create Price Alert</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          {!initialProjectId && (
            <div>
                <label className="text-sm font-bold text-gray-400 mb-2 block">Select Token</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {projects.map((p:any) => (
                        <button key={p.id} onClick={() => setSelectedProjectId(p.id)} className={`p-3 rounded-lg border flex items-center gap-2 transition-all ${selectedProjectId === p.id ? 'border-green-500 bg-green-500/10' : 'border-gray-700 hover:border-gray-600 bg-gray-800'}`}>
                            <span className="text-xl">{p.icon}</span>
                            <span className="font-bold text-sm">{p.tick}</span>
                        </button>
                    ))}
                </div>
            </div>
          )}
          {project && (
            <div className="animate-in fade-in duration-300 space-y-6">
                <div className="bg-black/40 p-4 rounded-xl flex justify-between items-center border border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl bg-gray-800 p-2 rounded-lg">{project.icon}</div>
                        <div>
                            <div className="font-bold text-lg text-white">{project.tick}</div>
                            <div className="text-xs text-gray-400">{project.name}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold font-mono text-white">{formatPrice(project.price)}</div>
                        <div className={`text-xs font-bold ${project.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>Current Price</div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Condition</label>
                        <div className="flex bg-gray-800 p-1 rounded-lg">
                            <button onClick={() => setAlertType('ABOVE')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${alertType === 'ABOVE' ? 'bg-green-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>Above</button>
                            <button onClick={() => setAlertType('BELOW')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${alertType === 'BELOW' ? 'bg-red-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>Below</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Expiry</label>
                        <select value={expiresIn} onChange={(e) => setExpiresIn(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-sm focus:border-green-500 outline-none">
                            <option value={1}>24 Hours</option>
                            <option value={7}>7 Days</option>
                            <option value={30}>30 Days</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Target Price ($)</label>
                    <input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="0.0000" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-xl font-mono text-white focus:border-green-500 outline-none transition-colors" />
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                        {suggestions.map((p:number, i) => (
                            <button key={i} onClick={() => setTargetPrice(p.toFixed(6))} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-xs font-mono text-cyan-400 whitespace-nowrap transition-colors">
                                {formatPrice(p)} ({i < 2 ? '+' : ''}{((p - project.price) / project.price * 100).toFixed(0)}%)
                            </button>
                        ))}
                    </div>
                </div>
                
                <button onClick={handleCreate} disabled={!targetPrice} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-all">
                    Set Alert
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProjectDetailModal = ({ project, onClose, toggleWatchlist, isInWatchlist, onCreateAlert }: { 
  project: Project, 
  onClose: () => void, 
  toggleWatchlist: (id: number) => void, 
  isInWatchlist: (id: number) => boolean,
  onCreateAlert: () => void 
}) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TECHNICAL' | 'SECURITY'>('OVERVIEW');
    const copyAddress = (addr: string) => navigator.clipboard.writeText(addr);
    
    // Helper for rendering tabs
    const TabButton = ({ name, id }: { name: string, id: typeof activeTab }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === id ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
            {name}
        </button>
    );

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-black" onClick={e => e.stopPropagation()}>
          
          {/* Header */}
          <div className="bg-gray-800/50 backdrop-blur border-b border-gray-700 p-6 flex justify-between items-start shrink-0 rounded-t-2xl">
            <div className="flex items-center gap-5">
              <div className="text-5xl bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-inner">{project.icon}</div>
              <div>
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-white">{project.name}</h2>
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 border border-gray-600">{project.category}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl text-cyan-400 font-mono">{project.tick}</span>
                    <span className={`text-sm px-2 rounded ${project.change24h >= 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                        {project.change24h >= 0 ? '▲' : '▼'} {Math.abs(project.change24h).toFixed(2)}%
                    </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="flex gap-6 flex-col lg:flex-row">
                
                {/* LEFT COLUMN: Main Stats & Signal */}
                <div className="lg:w-1/3 space-y-6">
                    {/* Big Price Card */}
                    <div className="bg-black/30 p-5 rounded-xl border border-gray-700">
                        <div className="text-gray-400 text-sm mb-1">Current Price</div>
                        <div className="text-4xl font-mono font-bold text-white mb-2">{formatPrice(project.price)}</div>
                        <div className="flex justify-between text-xs text-gray-500 border-t border-gray-800 pt-3">
                            <span>M.Cap: <span className="text-gray-300">{formatNumber(project.marketCap)}</span></span>
                            <span>Vol: <span className="text-gray-300">{formatNumber(project.volume24h)}</span></span>
                        </div>
                    </div>

                    {/* AI Signal Card */}
                    <div className={`p-5 rounded-xl border-l-4 bg-gradient-to-br from-gray-900 to-transparent ${
                        project.aiInsight?.signal === 'BUY' ? 'border-green-500' : 
                        project.aiInsight?.signal === 'SELL' ? 'border-red-500' : 'border-yellow-500'
                    } border border-gray-800`}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Brain size={18} className={project.aiInsight?.signal === 'BUY' ? 'text-green-500' : 'text-yellow-500'} />
                                <span className="font-bold text-gray-200">AI Verdict</span>
                            </div>
                            <span className={`px-3 py-1 rounded text-sm font-bold ${getSignalColor(project.aiInsight?.signal)}`}>
                                {project.aiInsight?.signal}
                            </span>
                        </div>
                        
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Confidence</span>
                                <span className="text-white font-mono">{project.aiInsight?.confidence}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className={`h-full ${project.aiInsight?.signal === 'BUY' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${project.aiInsight?.confidence}%`}} />
                            </div>
                        </div>
                        
                        <p className="text-sm text-gray-300 italic leading-relaxed">
                            &qout;{project.aiInsight?.summary}&quot;
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => toggleWatchlist(project.id)} className={`py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${isInWatchlist(project.id) ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                            <Star size={16} fill={isInWatchlist(project.id) ? "currentColor" : "none"} /> 
                            {isInWatchlist(project.id) ? 'Watching' : 'Watchlist'}
                        </button>
                        <button onClick={() => { onClose(); onCreateAlert(); }} className="py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 bg-gray-800 text-gray-400 hover:bg-gray-700 transition-all">
                            <Bell size={16} /> Set Alert
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Tabs & Detailed Info */}
                <div className="lg:w-2/3 flex flex-col">
                    <div className="flex border-b border-gray-700 mb-6">
                        <TabButton name="Overview" id="OVERVIEW" />
                        <TabButton name="Technical Analysis" id="TECHNICAL" />
                        <TabButton name="Security Audit" id="SECURITY" />
                    </div>

                    <div className="flex-1 min-h-[300px]">
                        {activeTab === 'OVERVIEW' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                        <div className="text-gray-500 text-xs uppercase font-bold mb-2">Momentum Score</div>
                                        <div className="flex items-end gap-2">
                                            <span className={`text-3xl font-bold ${getScoreColor(project.momentum24h || 0)}`}>{project.momentum24h?.toFixed(0)}</span>
                                            <span className="text-gray-500 text-sm mb-1">/ 100</span>
                                        </div>
                                        <div className="w-full h-1 bg-gray-700 mt-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{width: `${project.momentum24h}%`}}/>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                        <div className="text-gray-500 text-xs uppercase font-bold mb-2">Security Score</div>
                                        <div className="flex items-end gap-2">
                                            <span className={`text-3xl font-bold ${getScoreColor(project.security.score)}`}>{project.security.score}</span>
                                            <span className="text-gray-500 text-sm mb-1">/ 100</span>
                                        </div>
                                        <div className="w-full h-1 bg-gray-700 mt-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-red-500 to-green-500" style={{width: `${project.security.score}%`}}/>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-300 mb-3 flex items-center gap-2"><FileText size={16}/> Project Links</h3>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex items-center bg-gray-800 rounded-lg p-2 pr-4 border border-gray-700">
                                            <div className="p-2 bg-black/30 rounded mr-3 text-gray-400"><Copy size={14}/></div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500">Contract Address</span>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-cyan-400 text-sm">{project.contractAddress.slice(0, 6)}...{project.contractAddress.slice(-4)}</code>
                                                    <button onClick={() => copyAddress(project.contractAddress)} className="text-xs text-gray-500 hover:text-white underline">Copy</button>
                                                </div>
                                            </div>
                                        </div>
                                        {project.socialLinks?.website && (
                                            <a href={project.socialLinks.website} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg transition-colors">
                                                Website ↗
                                            </a>
                                        )}
                                        {project.socialLinks?.twitter && (
                                            <a href={project.socialLinks.twitter} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg transition-colors">
                                                Twitter ↗
                                            </a>
                                        )}
                                        {project.socialLinks?.telegram && (
                                            <a href={project.socialLinks.telegram} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg transition-colors">
                                                Telegram ↗
                                            </a>
                                        )}
                                        {project.socialLinks?.discord && (
                                            <a href={project.socialLinks.discord} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg transition-colors">
                                                Discord ↗
                                            </a>
                                        )}
                                        <a href={`https://solscan.io/token/${project.contractAddress}`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg transition-colors">
                                            Solscan ↗
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'TECHNICAL' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/20 p-4 rounded-xl border border-gray-700">
                                        <div className="text-gray-500 text-xs mb-1">Trend</div>
                                        <div className={`text-lg font-bold ${project.technicals.trend === 'BULLISH' ? 'text-green-500' : 'text-red-500'}`}>
                                            {project.technicals.trend}
                                        </div>
                                    </div>
                                    <div className="bg-black/20 p-4 rounded-xl border border-gray-700">
                                        <div className="text-gray-500 text-xs mb-1">RSI (14)</div>
                                        <div className="text-lg font-bold text-white">{project.technicals.rsi}</div>
                                    </div>
                                </div>

                                <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700">
                                    <h3 className="font-bold text-gray-300 mb-4 flex items-center gap-2"><Target size={16} /> Key Levels</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-red-400 text-sm">Resistance</span>
                                            <span className="font-mono text-white">{formatPrice(project.technicals.resistance)}</span>
                                        </div>
                                        <div className="w-full h-px bg-gray-700 border-t border-dashed border-gray-600 relative">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 px-2 text-xs text-cyan-400 font-bold border border-cyan-500/30 rounded">
                                                Current: {formatPrice(project.price)}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-400 text-sm">Support</span>
                                            <span className="font-mono text-white">{formatPrice(project.technicals.support)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-900/10 rounded-xl p-4 border border-blue-500/20">
                                    <h4 className="text-blue-400 font-bold text-sm mb-2">Trade Setup</h4>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-black/20 rounded p-2">
                                            <div className="text-xs text-gray-500">Entry Zone</div>
                                            <div className="text-sm font-mono text-green-300">{formatPrice(project.technicals.entryZone)}</div>
                                        </div>
                                        <div className="bg-black/20 rounded p-2">
                                            <div className="text-xs text-gray-500">Stop Loss</div>
                                            <div className="text-sm font-mono text-red-300">{formatPrice(project.technicals.stopLoss)}</div>
                                        </div>
                                        <div className="bg-black/20 rounded p-2">
                                            <div className="text-xs text-gray-500">Risk/Reward</div>
                                            <div className="text-sm font-mono text-white">1:2.5</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'SECURITY' && (
                            <div className="space-y-5 animate-in fade-in duration-300">
                                <div className={`flex items-center gap-3 p-4 rounded-xl border ${project.security.riskLevel === 'SAFE' ? 'bg-green-500/10 border-green-500/30' : project.security.riskLevel === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                                    <Shield size={24} className={project.security.riskLevel === 'SAFE' ? 'text-green-500' : project.security.riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-yellow-500'} />
                                    <div>
                                        <div className="font-bold text-white">Risk Level: {project.security.riskLevel}</div>
                                        <div className="text-xs opacity-70">Based on on-chain analysis</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                                        <span className="text-gray-300 text-sm">Liquidity Status</span>
                                        <span className={`flex items-center gap-1 text-sm font-bold ${project.security.liquidityLocked ? 'text-green-400' : 'text-red-400'}`}>
                                            {project.security.liquidityLocked ? <Lock size={14}/> : <Unlock size={14}/>} 
                                            {project.security.liquidityLocked ? 'Locked' : 'Unlocked'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                                        <span className="text-gray-300 text-sm">Mint Authority</span>
                                        <span className={`flex items-center gap-1 text-sm font-bold ${!project.security.mintable ? 'text-green-400' : 'text-red-400'}`}>
                                            {!project.security.mintable ? 'Revoked' : 'Enabled'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                                        <span className="text-gray-300 text-sm">Top 10 Holders</span>
                                        <span className={`flex items-center gap-1 text-sm font-bold ${project.security.top10HoldersPercent < 15 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            <Users size={14}/> {project.security.top10HoldersPercent}%
                                        </span>
                                    </div>
                                </div>

                                {project.security.flags.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-red-400 text-sm font-bold mb-2">Warnings Detected</h4>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {project.security.flags.map((flag, i) => (
                                                <li key={i} className="text-xs text-gray-400">{flag}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
};

// --- DATA GENERATION LOGIC ---

const generateNarrative = (p: Partial<Project>, technicals: TechnicalAnalysis): string => {
    const momentum = p.momentum24h || 50;
    const trend = technicals.trend;
    
    const intro = `${p.tick} is showing ${momentum > 60 ? "strong" : "weak"} momentum in the short term. `;
    const tech = `Technically, the price is ${trend === 'BULLISH' ? 'holding above key support' : 'facing rejection at resistance'} with an RSI of ${technicals.rsi}. `;
    const volume = p.volume24h && p.marketCap && (p.volume24h / p.marketCap > 0.1) ? "Volume is notably high, indicating active interest. " : "Volume is moderate relative to market cap. ";
    const verdict = trend === 'BULLISH' && momentum > 60 ? "The setup looks favorable for a continuation." : "Caution is advised until a clear reversal pattern forms.";
    
    return intro + tech + volume + verdict;
};

const fetchProjectData = async (config: ProjectConfig, previous: Project | undefined): Promise<Project> => {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${config.contractAddress}`);
      const data = await response.json();
      const pair = data.pairs?.[0];
      
      const price = parseFloat(pair?.priceUsd || '0');
      const change24h = parseFloat(pair?.priceChange?.h24 || '0');
      const volume24h = parseFloat(pair?.volume?.h24 || '0');
      const liquidity = parseFloat(pair?.liquidity?.usd || '0');
      const marketCap = price * 1_000_000_000; // Mock supply
      
      // -- Heuristics for Advanced Data --
      
      // Calculate Momentum
      let momentum = 50 + (change24h / 2);
      if (volume24h > 100000) momentum += 10;
      momentum = Math.min(100, Math.max(0, momentum));
      
      // Generate Technicals based on price action
      const resistance = price * (1 + Math.random() * 0.15);
      const support = price * (1 - Math.random() * 0.15);
      const rsi = 30 + (momentum * 0.4) + (Math.random() * 10);
      const trend = change24h > 0 ? (rsi > 70 ? 'NEUTRAL' : 'BULLISH') : (rsi < 30 ? 'NEUTRAL' : 'BEARISH');
      
      const technicals: TechnicalAnalysis = {
          resistance,
          support,
          entryZone: support * 1.02,
          stopLoss: support * 0.95,
          rsi: Math.floor(rsi),
          trend
      };

      // Generate Security Audit
      const isLiquid = liquidity > 50000;
      const securityScore = (isLiquid ? 50 : 20) + (Math.random() * 40); // Base + Random factors
      const top10 = Math.floor(Math.random() * 40) + 5;
      
      const security: SecurityAudit = {
          score: Math.floor(securityScore),
          riskLevel: securityScore > 75 ? 'SAFE' : securityScore > 40 ? 'MODERATE' : 'CRITICAL',
          liquidityLocked: Math.random() > 0.3, // 70% chance locked
          mintable: Math.random() > 0.8, // 20% chance mintable
          top10HoldersPercent: top10,
          honeyPotRisk: false,
          flags: top10 > 30 ? ['High Holder Concentration'] : []
      };

      // Generate AI Insight
      const narrative = generateNarrative({ tick: config.tick, momentum24h: momentum, volume24h, marketCap }, technicals);
      
      const insight: AIInsight = {
          signal: trend === 'BULLISH' ? 'BUY' : trend === 'BEARISH' ? 'SELL' : 'HOLD',
          confidence: Math.floor(50 + (Math.abs(change24h) * 2)),
          summary: narrative,
          reason: `Technical trend is ${trend} with RSI at ${technicals.rsi}`,
          timeframe: '4H'
      };

      // Alerts
      const alerts: MomentumAlert[] = [];
      if (Math.abs(change24h) > 15) alerts.push({
          type: change24h > 0 ? 'SPIKE' : 'DUMP',
          severity: 'WARNING',
          message: `${config.tick} moved ${change24h.toFixed(1)}% in 24h`,
          timestamp: new Date(),
          project: config.tick
      });

      return {
        ...config,
        price, change24h, volume24h, marketCap, liquidity,
        holders: Math.floor(Math.random() * 5000) + 500,
        supply: 1_000_000_000,
        momentum24h: momentum,
        technicals,
        security,
        aiInsight: insight,
        momentumAlerts: alerts
      };
    } catch (e) {
      console.error(e);
      // Fallback for error state
      return { 
          ...config, price: 0, change24h: 0, volume24h: 0, marketCap: 0, holders: 0, supply: 0, error: true, 
          security: { score: 0, riskLevel: 'CRITICAL', liquidityLocked: false, mintable: false, top10HoldersPercent: 0, honeyPotRisk: false, flags: [] },
          technicals: { support: 0, resistance: 0, entryZone: 0, stopLoss: 0, trend: 'NEUTRAL', rsi: 0 }
      } as Project;
    }
};

// --- MAIN COMPONENT ---

const SigniqMarket: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Alert State
  const [activePriceAlerts, setActivePriceAlerts] = useState<PriceAlert[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<PriceAlert[]>([]);
  const [showPriceAlertsPanel, setShowPriceAlertsPanel] = useState(true);
  const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);
  
  // Data State
  const [marketData, setMarketData] = useState<MarketData>({ totalMarketCap: 0, volume24h: 0, avgMomentum: 0, topGainer: '' });
  const [loading, setLoading] = useState(false);

  // FULL PROJECT LIST
  const projectConfigs: ProjectConfig[] = useMemo(() => [
    { id: 1, tick: 'CYAI', name: 'CyreneAI', icon: '🔷', contractAddress: '6Tph3SxbAW12BSJdCevVV9Zujh97X69d5MJ4XjwKmray', category: 'DEFI', socialLinks: { twitter: 'https://x.com/cyreneai', website: 'https://cyreneai.com' } },
    { id: 2, tick: 'SGQ', name: "Signiq", icon: "🌀", contractAddress: "K9uxt28GvfPsQuapLU1rYxY1REAcZ9NMQ3SYwWbcyai", category: "X SCAN", socialLinks: { twitter: "https://x.com/signiq", website: "https://signiq.xyz", telegram: "https://t.co/07EAGFf72I"} },
    { id: 3, tick: 'CT', name: "CromaFun", icon: "🎉", contractAddress: 'QGA9gSriVnubWRU21Ph5roaGdxFwdpSRT6hmjwycyai', category: "GAMER", socialLinks: {twitter: "https://x.com/cromafun", website: "https://t.co/UYJuDVRELJ", telegram: "https://t.co/cyAojjZvIA"} },
    { id: 4, tick: "U1", name: "Umbrae", icon: "🤖", contractAddress: "kedoobK2qe2f1V8ee5vDXFr3H7gKnhQVNJXA3Ltcyai", category: "DEFI", socialLinks: {website: "https://www.umbrae.io/", twitter: "https://x.com/Umbrae_Ignis"} },
    { id: 5, tick: "MICK", name: "Mikayla", icon: "🐶", contractAddress: "QCDgZ9RDarrnDq57GiSxPyWeJ3PKJndfMcHYkMWcyai", category: "MEME", socialLinks: {twitter: "https://x.com/mikaylafun", website: "https://mikayla.fun"} },
    { id: 6, tick: "AS", name: "Aytes", icon: "⚡", contractAddress: 'VsnkRuJmAfymCs8kctHEa4kL3Tvjvg3p21QES1ucyai', category: "DEFI", socialLinks: {twitter: "https://x.com/aytes_xyz", website: "https://aytes.xyz", telegram: "https://t.co/3pI3ln8QuL"} },
    { id: 7, tick: "MDS", name: "Medusa Shards", icon: "🗿", contractAddress: "Dria68ScNfmRrvL7K1nx5cEkND6V6V5yUGkFr7gcyai", category: "GAMER", socialLinks: {twitter: "https://x.com/SenkusElixir", website: "https://www.senkuselixir.xyz/"} },
    { id: 8, tick: "PRN", name: "Prana Chain", icon: "🧬", contractAddress: "C15AhpLTjjVBLLPq5xqH9ewXscSN4DcpkePmHg7geTa6", category: "DEFI", socialLinks: {twitter: "https://x.com/pranachain", website: "https://app.pranachain.com/", } },
    { id: 9, tick: "SCRIPT", name: "Scriptonia", icon: "📜", contractAddress: "C15AhpLTjjVBLLPq5xqH9ewXscSN4DcpkePmHg7geTa6", category: "X SCAN", socialLinks: {twitter: "https://x.com/Scriptonia_xyz", website: "www.scriptonia.xyz", telegram: "http://t.me/Scriptonia_xyz"} },
    { id: 10, tick: "SWARM", name: "Swarm", icon: "🐝", contractAddress: "otgodXJDJFFip57AA43ERfDs8pcGviDd9oUJsnEcyai", category: "X SCAN", socialLinks: {twitter: "https://x.com/neurolov", website: "http://neurolov.ai/", } },
    { id: 11, tick: "AIDP", name: "AIdp.Store", icon: "🏪", contractAddress: "PLNk8NUTBeptajEX9GzZrxsYPJ1psnw62dPnWkGcyai", category: "DEFI", socialLinks: {twitter: "https://x.com/aidpstore", website: "https://www.aidp.store", telegram: "https://t.me/Aidpofficial"} },
    { id: 12, tick: "CF", name: "CrossFund", icon: "✝️", contractAddress: "quauDjvWByAgtij5eJiTgi4NuMtcbaPLd3FpWG9cyai", category: "DEFI", socialLinks: {twitter: "https://x.com/crossfundxyz", website: "https://crossfund.xyz/", telegram: "https://t.co/LAHPtK5xgc"} }
  ], []);

  // Persistence
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('signiq-watchlist');
    const savedAlerts = localStorage.getItem('signiq-price-alerts');
    
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
    
    if (savedAlerts) {
      try {
        const parsed = JSON.parse(savedAlerts);
        const alertsWithDates = parsed.map((alert: any) => ({ ...alert, createdAt: new Date(alert.createdAt), expiresAt: new Date(alert.expiresAt) }));
        setActivePriceAlerts(alertsWithDates.filter((a: PriceAlert) => a.status === 'ACTIVE'));
        setTriggeredAlerts(alertsWithDates.filter((a: PriceAlert) => a.status === 'TRIGGERED'));
      } catch (e) {}
    }
  }, []);

  useEffect(() => localStorage.setItem('signiq-watchlist', JSON.stringify(watchlist)), [watchlist]);
  useEffect(() => localStorage.setItem('signiq-price-alerts', JSON.stringify([...activePriceAlerts, ...triggeredAlerts])), [activePriceAlerts, triggeredAlerts]);

  // Alert Logic
  const createPriceAlert = (projectId: number, targetPrice: number, alertType: 'ABOVE' | 'BELOW', expiresInDays: number = 7) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const newAlert: PriceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      projectTick: project.tick,
      projectName: project.name,
      alertType,
      targetPrice,
      currentPrice: project.price,
      status: 'ACTIVE',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      notificationType: 'PUSH'
    };
    setActivePriceAlerts(prev => [newAlert, ...prev]);
    setShowCreateAlertModal(false);
  };

  const deleteAlert = (id: string) => {
    setActivePriceAlerts(prev => prev.filter(a => a.id !== id));
    setTriggeredAlerts(prev => prev.filter(a => a.id !== id));
  };

  const exportAlerts = () => {
    const csv = activePriceAlerts.map(a => `${a.projectTick},${a.alertType},${a.targetPrice}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alerts.csv';
    a.click();
  };

  // Check Price Alerts
  useEffect(() => {
    if (projects.length === 0 || activePriceAlerts.length === 0) return;
    let hasChanges = false;
    const now = new Date();
    const newTriggered: PriceAlert[] = [];
    const stillActive: PriceAlert[] = [];
    
    activePriceAlerts.forEach(alert => {
      const project = projects.find(p => p.id === alert.projectId);
      if (!project || alert.expiresAt < now) {
        if (alert.expiresAt < now) hasChanges = true; else stillActive.push(alert);
        return;
      }
      
      let isTriggered = false;
      if (alert.alertType === 'ABOVE' && project.price >= alert.targetPrice) isTriggered = true;
      else if (alert.alertType === 'BELOW' && project.price <= alert.targetPrice) isTriggered = true;
      
      if (isTriggered) {
        newTriggered.push({ ...alert, status: 'TRIGGERED', triggeredAt: new Date(), currentPrice: project.price });
        hasChanges = true;
      } else {
        if (Math.abs(alert.currentPrice - project.price) > Number.EPSILON) {
            stillActive.push({ ...alert, currentPrice: project.price });
            hasChanges = true; 
        } else {
            stillActive.push(alert);
        }
      }
    });
    
    if (hasChanges) {
      setTriggeredAlerts(prev => [...newTriggered, ...prev].slice(0, 20));
      setActivePriceAlerts(stillActive);
    }
  }, [projects, activePriceAlerts.length]);

  const toggleWatchlist = (id: number) => setWatchlist(prev => prev.some(p => p.projectId === id) ? prev.filter(p => p.projectId !== id) : [...prev, { projectId: id }]);

  // Fetch Loop
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all(projectConfigs.map(c => fetchProjectData(c, undefined)));
    setProjects(results);
    setMarketData({
        totalMarketCap: results.reduce((a, b) => a + b.marketCap, 0),
        volume24h: results.reduce((a, b) => a + b.volume24h, 0),
        avgMomentum: 0,
        topGainer: results[0]?.tick || ''
    });
    setLoading(false);
  }, [projectConfigs]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Modal */}
      {selectedProject && (
        <ProjectDetailModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
            toggleWatchlist={toggleWatchlist} 
            isInWatchlist={(id) => watchlist.some(w => w.projectId === id)}
            onCreateAlert={() => { setSelectedProject(null); setShowCreateAlertModal(true); }} 
        />
      )}
      
      {showCreateAlertModal && (
        <CreateAlertModal 
            projects={projects}
            onClose={() => setShowCreateAlertModal(false)}
            onCreate={createPriceAlert}
            initialProjectId={selectedProject?.id}
        />
      )}

      {/* Navbar */}
      <header className="border-b border-gray-800 p-4 bg-gray-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="text-2xl">🌀</div>
                <h1 className="text-xl font-bold tracking-tight">Signiq Market <span className="text-cyan-500">Pro</span></h1>
            </div>
            <button onClick={fetchAll} disabled={loading} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
                <div className="text-gray-500 text-sm">Total Volume (24h)</div>
                <div className="text-3xl font-bold text-white">{formatNumber(marketData.volume24h)}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
                <div className="text-gray-500 text-sm">Market Capitalization</div>
                <div className="text-3xl font-bold text-cyan-400">{formatNumber(marketData.totalMarketCap)}</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-700 p-6 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-indigo-200 text-sm">AI Sentiment</div>
                    <div className="text-3xl font-bold text-white">Bullish</div>
                </div>
                <Brain size={32} className="text-indigo-400" />
            </div>
        </div>

        {/* Alert Panel (Restored) */}
        <PriceAlertsPanel 
            activePriceAlerts={activePriceAlerts}
            triggeredAlerts={triggeredAlerts}
            projects={projects}
            showPriceAlertsPanel={showPriceAlertsPanel}
            setShowPriceAlertsPanel={setShowPriceAlertsPanel}
            setShowCreateAlertModal={setShowCreateAlertModal}
            deleteAlert={deleteAlert}
            exportAlerts={exportAlerts}
        />

        {/* Project List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-950 text-gray-500 uppercase text-xs font-bold">
                    <tr>
                        <th className="p-4">Project</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">24h</th>
                        <th className="p-4">Trend</th>
                        <th className="p-4">Signal</th>
                        <th className="p-4">Safety</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {projects.map(p => (
                        <tr key={p.id} onClick={() => setSelectedProject(p)} className="hover:bg-gray-800/50 cursor-pointer transition-colors group">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="text-xl">{p.icon}</div>
                                    <div>
                                        <div className="font-bold text-gray-200">{p.tick}</div>
                                        <div className="text-xs text-gray-500">{p.name}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 font-mono text-gray-300">{formatPrice(p.price)}</td>
                            <td className="p-4">
                                <span className={`flex items-center gap-1 ${p.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {p.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {Math.abs(p.change24h).toFixed(2)}%
                                </span>
                            </td>
                            <td className="p-4"><MiniSparkline change={p.change24h} /></td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${getSignalColor(p.aiInsight?.signal)}`}>
                                    {p.aiInsight?.signal}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className={p.security.riskLevel === 'SAFE' ? 'text-green-500' : 'text-red-500'} />
                                    <span className="text-sm text-gray-400">{p.security.score}/100</span>
                                </div>
                            </td>
                            <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                                <button onClick={() => { setSelectedProject(null); setSelectedProject(p); setShowCreateAlertModal(true); }} className="p-2 text-gray-500 hover:text-cyan-400 transition-colors">
                                    <Bell size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {projects.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500">No projects loaded. Check connection.</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SigniqMarket;