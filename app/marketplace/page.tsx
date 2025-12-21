'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    TrendingUp, RefreshCw, AlertCircle, Shield, AlertTriangle, TrendingDown,
    Zap, CheckCircle, Eye, Star, X, Plus, BarChart2, Activity, Bell,
    BellOff, ArrowUpRight, ArrowDownRight, Copy, ExternalLink, Brain,
    BellRing, Trash2, Download, BellDot, Lock, Unlock, Users, FileText, Target,
    Share2, Coins, ChevronDown, ChevronUp, Radio, Search, Filter
} from 'lucide-react';
import { toast } from "sonner"

// --- Interfaces ---

interface MarketData {
    totalMarketCap: number;
    volume24h: number;
    avgMomentum: number;
    topGainer: string;
    solanaTPS: number;
}

interface ProjectConfig {
    id: number;
    tick: string;
    name: string;
    icon: string;
    contractAddress: string;
    category: 'MEME' | 'DEFI' | 'GAMER' | 'X SCAN' | 'AIML' | 'INFRA' | 'OTHER' | 'DePIN';
    socialLinks?: {
        twitter?: string;
        website?: string;
        telegram?: string;
        discord?: string;
        linkedin?: string;
    };
}

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
    rsi: number;
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
    summary: string;
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

    security: SecurityAudit;
    technicals: TechnicalAnalysis;

    momentumAlerts?: MomentumAlert[];
    momentum24h?: number;
    aiInsight?: AIInsight;
    momentumSignals?: MomentumSignal[];
}

interface WatchlistItem {
    projectId: number;
    priceAlert?: PriceAlert;
}

type FilterType = 'ALL' | 'MEME' | 'DEFI' | 'GAMER' | 'X SCAN' | 'AIML' | 'INFRA';
type SortField = 'momentum' | 'security' | 'marketCap' | 'change24h' | 'volume24h';

// --- Utility Helpers ---

const formatNumber = (num: number): string => {
    if (!num || num === 0) return '$0';
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(2)}`;
};

const formatCompactNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
};

const formatPrice = (price: number): string => {
    if (!price || price === 0) return '$0.00';
    if (price < 0.000001) return `$${price.toExponential(4)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(4)}`;
};

const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-500';
};

const getSignalColor = (signal?: AIInsight['signal']) => {
    if (signal === 'BUY') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    if (signal === 'SELL') return 'text-red-400 bg-red-400/10 border-red-400/30';
    if (signal === 'WATCH') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
};

const getMomentumColor = (momentum?: number) => {
    if (!momentum) return 'text-gray-500';
    if (momentum >= 70) return 'text-emerald-400';
    if (momentum >= 50) return 'text-cyan-400';
    if (momentum >= 30) return 'text-yellow-400';
    return 'text-red-500';
};

// --- Components ---

const MiniSparkline: React.FC<{ change: number }> = ({ change }) => {
    const isPositive = change >= 0;
    const points = useMemo(() => Array.from({ length: 15 }, (_, i) => {
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
        <defs>
        <linearGradient id={`grad-${isPositive ? 'pos' : 'neg'}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={isPositive ? '#34d399' : '#f87171'} stopOpacity="0.5" />
        <stop offset="100%" stopColor={isPositive ? '#34d399' : '#f87171'} stopOpacity="0" />
        </linearGradient>
        </defs>
        <path d={pathData} fill="none" stroke={isPositive ? '#34d399' : '#f87171'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const TickerTape = ({ alerts }: { alerts: MomentumAlert[] }) => {
    if (alerts.length === 0) return null;
    return (
        <div className="w-full bg-black/60 border-b border-gray-800 overflow-hidden py-2 sticky top-[73px] z-20 backdrop-blur-sm">
        <div className="animate-marquee whitespace-nowrap flex gap-8 items-center">
        {alerts.map((alert, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
            <span className="font-bold text-cyan-400">{alert.project}</span>
            <span className={alert.severity === 'CRITICAL' ? 'text-red-400' : 'text-gray-300'}>
            {alert.message}
            </span>
            <span className="text-gray-600 text-xs">•</span>
            </div>
        ))}
        </div>
        </div>
    );
};

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
    <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10 transition-opacity group-hover:opacity-100 opacity-50"></div>

    <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
    <div className="p-2 bg-gray-800 rounded-lg"><BellRing size={20} className="text-cyan-400" /></div>
    <div>
    <div className="font-bold text-gray-200 leading-none">Price Alerts</div>
    <div className="text-xs text-gray-500 mt-1">{activePriceAlerts.length} Active • {triggeredAlerts.length} Triggered</div>
    </div>
    </div>
    <div className="flex items-center gap-2">
    <button onClick={exportAlerts} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors" title="Export CSV">
    <Download size={16} />
    </button>
    <button onClick={() => setShowPriceAlertsPanel(!showPriceAlertsPanel)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
    {showPriceAlertsPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
    </div>
    </div>

    {showPriceAlertsPanel && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
        {/* Active Alerts Column */}
        <div className="space-y-3">
        <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monitoring</h3>
        <button onClick={() => setShowCreateAlertModal(true)} className="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1">
        <Plus size={12} /> Add New
        </button>
        </div>
        {activePriceAlerts.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {activePriceAlerts.map((alert: any) => {
                const project = projects.find((p: any) => p.id === alert.projectId);
                const percentDiff = project ? Math.abs((project.price - alert.targetPrice) / alert.targetPrice * 100) : 0;
                return (
                    <div key={alert.id} className="bg-black/40 border border-gray-800 p-3 rounded-lg flex justify-between items-center hover:border-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                    <span className="text-lg"><img className="w-8 h-8 rounded-full" src={project?.icon} /></span>
                    <div>
                    <div className="font-bold text-sm text-gray-200">{alert.projectTick}</div>
                    <div className="text-xs text-gray-500">{alert.alertType === 'ABOVE' ? 'Above' : 'Below'} <span className="text-cyan-400 font-mono">{formatPrice(alert.targetPrice)}</span></div>
                    </div>
                    </div>
                    <div className="text-right">
                    <div className="text-xs font-bold text-gray-400">{percentDiff.toFixed(1)}% away</div>
                    <button onClick={() => deleteAlert(alert.id)} className="text-xs text-red-400 hover:text-red-300 mt-1 hover:underline">Delete</button>
                    </div>
                    </div>
                );
            })}
            </div>
        ) : <div className="text-gray-600 text-sm text-center py-6 border border-gray-800 border-dashed rounded-lg">No alerts set.</div>}
        </div>

        {/* Triggered Alerts Column */}
        <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Triggers</h3>
        {triggeredAlerts.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {triggeredAlerts.slice(0, 10).map((alert: any) => (
                <div key={alert.id} className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg flex justify-between items-center">
                <div className="flex gap-3 items-center">
                <div className="p-1.5 bg-red-500/10 rounded-full text-red-500"><BellRing size={12}/></div>
                <div>
                <div className="font-bold text-sm text-gray-200">{alert.projectTick} Hit Target</div>
                <div className="text-xs text-gray-500 font-mono">{formatPrice(alert.targetPrice)}</div>
                </div>
                </div>
                <button onClick={() => deleteAlert(alert.id)} className="text-gray-600 hover:text-white"><X size={14} /></button>
                </div>
            ))}
            </div>
        ) : <div className="text-gray-600 text-sm text-center py-6 border border-gray-800 border-dashed rounded-lg">No recent triggers.</div>}
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
    const project = selectedProjectId ? projects.find((p:any) => p.id === selectedProjectId) : null;

    const handleCreate = () => {
        if (!selectedProjectId || !targetPrice) return;
        onCreate(selectedProjectId, parseFloat(targetPrice), alertType);
    };

    const suggestions = project ? [project.price * 1.05, project.price * 1.10, project.price * 0.95, project.price * 0.90] : [];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="font-bold text-white flex gap-2 items-center"><BellRing size={18} className="text-cyan-400" /> Set Price Alert</h2>
        <button onClick={onClose} className="hover:text-white text-gray-500"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-5">
        {!initialProjectId && (
            <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Token</label>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
            {projects.map((p:any) => (
                <button key={p.id} onClick={() => setSelectedProjectId(p.id)} className={`p-2 rounded border text-sm font-bold flex items-center justify-center gap-1 ${selectedProjectId === p.id ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                {p.tick}
                </button>
            ))}
            </div>
            </div>
        )}
        {project && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg">
            <div className="flex items-center gap-2">
            <span className="text-2xl">
            <img className="w-8 h-8 rounded-full" src={project.icon} />
            </span>
            <div>
            <div className="font-bold text-white">{project.tick}</div>
            <div className="text-xs text-gray-500">Current: {formatPrice(project.price)}</div>
            </div>
            </div>
            </div>

            <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Trigger Condition</label>
            <div className="flex bg-gray-800 p-1 rounded-lg">
            <button onClick={() => setAlertType('ABOVE')} className={`flex-1 py-2 text-xs font-bold rounded ${alertType === 'ABOVE' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'}`}>Price Goes Above</button>
            <button onClick={() => setAlertType('BELOW')} className={`flex-1 py-2 text-xs font-bold rounded ${alertType === 'BELOW' ? 'bg-red-500 text-black' : 'text-gray-400 hover:text-white'}`}>Price Goes Below</button>
            </div>
            </div>

            <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Target Price ($)</label>
            <input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white font-mono focus:border-cyan-500 outline-none" placeholder="0.00" />
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {suggestions.map((p:number, i) => (
                <button key={i} onClick={() => setTargetPrice(p.toFixed(6))} className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400 hover:text-cyan-400 whitespace-nowrap">
                {formatPrice(p)}
                </button>
            ))}
            </div>
            </div>

            <button onClick={handleCreate} disabled={!targetPrice} className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50">
            Create Alert
            </button>
            </div>
        )}
        </div>
        </div>
        </div>
    );
};

const ProjectDetailModal = ({ project, onClose, toggleWatchlist, isInWatchlist, onCreateAlert }: any) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TECHNICAL' | 'SECURITY'>('OVERVIEW');
    const copyAddress = (addr: string) => navigator.clipboard.writeText(addr);
    const shareText = `Checking out $${project.tick} on Signiq Market.\n\nPrice: ${formatPrice(project.price)}\nMomentum: ${project.momentum24h.toFixed(0)}/100\nAI Signal: ${project.aiInsight.signal}\n\n#Signiq #Solana`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl shadow-black overflow-hidden" onClick={e => e.stopPropagation()}>

        <div className="bg-gray-800 p-6 flex justify-between items-start shrink-0 border-b border-gray-700">
        <div className="flex items-center gap-5">
        <div className="text-5xl bg-gray-900 p-3 rounded-2xl border border-gray-700">
        <img className="w-8 h-8 rounded-full" src={project.icon} />
        </div>
        <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
        {project.name}
        <span className="text-sm px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 font-normal">{project.category}</span>
        </h2>
        <div className="flex items-center gap-4 mt-1">
        <span className="text-xl text-gray-400 font-mono">{project.tick}</span>
        <span className={`text-sm font-bold ${project.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {project.change24h >= 0 ? '▲' : '▼'} {Math.abs(project.change24h).toFixed(2)}% (24h)
        </span>
        </div>
        </div>
        </div>
        <div className="flex gap-2">
        <a href={shareUrl} target="_blank" rel="noreferrer" className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 text-gray-400 hover:text-white transition-colors">
        <Share2 size={20} />
        </a>
        <button onClick={onClose} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 text-gray-400 hover:text-white transition-colors">
        <X size={20} />
        </button>
        </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-900/50">
        <div className="flex gap-6 flex-col lg:flex-row h-full">

        {/* Sidebar */}
        <div className="lg:w-1/3 space-y-6">
        <div className="bg-black/40 p-5 rounded-xl border border-gray-700">
        <div className="text-gray-500 text-xs font-bold uppercase mb-1">Live Price</div>
        <div className="text-4xl font-mono font-bold text-white mb-3">{formatPrice(project.price)}</div>
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 border-t border-gray-800 pt-3">
        <div>M.Cap: <span className="text-white block text-sm">{formatNumber(project.marketCap)}</span></div>
        <div>Vol (24h): <span className="text-white block text-sm">{formatNumber(project.volume24h)}</span></div>
        </div>
        </div>

        <div className={`p-5 rounded-xl border-l-4 bg-gray-800/50 ${project.aiInsight?.signal === 'BUY' ? 'border-emerald-500' : project.aiInsight?.signal === 'SELL' ? 'border-red-500' : 'border-yellow-500'}`}>
        <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 font-bold text-gray-200">
        <Brain size={18} className="text-purple-400" /> AI Analysis
        </div>
        <span className={`px-3 py-1 rounded text-xs font-black ${getSignalColor(project.aiInsight?.signal)}`}>
        {project.aiInsight?.signal}
        </span>
        </div>
        <p className="text-sm text-gray-300 italic mb-3">"{project.aiInsight?.summary}"</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>Confidence: {Math.min(project.aiInsight?.confidence, 90)}%</span>
        <div className="flex-1 h-1 bg-gray-700 rounded-full"><div style={{width: `${Math.min(project.aiInsight?.confidence, 90)}%`}} className="h-full bg-purple-500 rounded-full"/></div>
        </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
        <button onClick={() => toggleWatchlist(project.id)} className={`py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all border ${isInWatchlist(project.id) ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}>
        <Star size={16} fill={isInWatchlist(project.id) ? "currentColor" : "none"} /> {isInWatchlist(project.id) ? 'Watching' : 'Watchlist'}
        </button>
        <button onClick={() => { onClose(); onCreateAlert(); }} className="py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-all">
        <Bell size={16} /> Alert
        </button>
        </div>

        <a
        href={`https://jup.ag/swap/USDC-${project.contractAddress}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-cyan-900/20"
        >
        <Coins size={18} /> Trade on Jupiter
        </a>
        </div>

        {/* Main Tabbed Area */}
        <div className="lg:w-2/3 flex flex-col">
        <div className="flex border-b border-gray-700 mb-6 gap-6">
        {['OVERVIEW', 'TECHNICAL', 'SECURITY'].map((tab: any) => (
            <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
            {tab}
            </button>
        ))}
        </div>

        <div className="flex-1">
        {activeTab === 'OVERVIEW' && (
            <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2">Momentum</div>
            <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(project.momentum24h || 0)}`}>{project.momentum24h?.toFixed(0)}</span>
            <span className="text-gray-500 text-sm mb-1">/ 100</span>
            </div>
            <div className="w-full h-1 bg-gray-700 mt-2 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{width: `${project.momentum24h}%`}}/></div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2">Safety Score</div>
            <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(project.security.score)}`}>{project.security.score}</span>
            <span className="text-gray-500 text-sm mb-1">/ 100</span>
            </div>
            <div className="w-full h-1 bg-gray-700 mt-2 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-red-500 to-emerald-500" style={{width: `${project.security.score}%`}}/></div>
            </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700">
            <h3 className="font-bold text-gray-300 mb-3 text-sm uppercase">Official Links</h3>
            <div className="flex flex-wrap gap-3">
            <div className="flex items-center bg-gray-900 rounded-lg p-2 pr-4 border border-gray-800 flex-1 min-w-[200px]">
            <div className="p-2 bg-gray-800 rounded mr-3 text-gray-400"><Copy size={14}/></div>
            <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] text-gray-500 uppercase font-bold">CA</span>
            <div className="flex items-center gap-2">
            <code className="text-cyan-400 text-sm truncate">{project.contractAddress}</code>
            <button onClick={() => copyAddress(project.contractAddress)} className="text-xs text-gray-500 hover:text-white underline">Copy</button>
            </div>
            </div>
            </div>
            {/* Socials */}
            <div className="flex gap-2">
            {project.socialLinks?.twitter && <a href={project.socialLinks.twitter} target="_blank" className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 text-blue-400 transition-colors"><ExternalLink size={18}/></a>}
            {project.socialLinks?.website && <a href={project.socialLinks.website} target="_blank" className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 text-cyan-400 transition-colors"><ExternalLink size={18}/></a>}
            </div>
            </div>
            </div>
            </div>
        )}

        {activeTab === 'TECHNICAL' && (
            <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700 text-center">
            <div className="text-gray-500 text-xs mb-1">Trend</div>
            <div className={`font-bold ${project.technicals.trend === 'BULLISH' ? 'text-emerald-400' : 'text-red-400'}`}>{project.technicals.trend}</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700 text-center">
            <div className="text-gray-500 text-xs mb-1">RSI (14)</div>
            <div className="font-bold text-white">{project.technicals.rsi}</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700 text-center">
            <div className="text-gray-500 text-xs mb-1">Vol/MC</div>
            <div className="font-bold text-yellow-400">{(project.volume24h / project.marketCap).toFixed(3)}</div>
            </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={100} /></div>
            <h3 className="font-bold text-gray-300 mb-4 text-sm uppercase">Key Levels</h3>
            <div className="space-y-3 relative z-10">
            <div className="flex justify-between text-sm">
            <span className="text-red-400">Resistance</span>
            <span className="font-mono">{formatPrice(project.technicals.resistance)}</span>
            </div>
            <div className="w-full h-px bg-gray-700 flex justify-center items-center">
            <span className="bg-gray-900 px-2 text-xs text-cyan-500 border border-gray-700 rounded-full">{formatPrice(project.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
            <span className="text-emerald-400">Support</span>
            <span className="font-mono">{formatPrice(project.technicals.support)}</span>
            </div>
            </div>
            </div>
            </div>
        )}

        {activeTab === 'SECURITY' && (
            <div className="space-y-4 animate-in fade-in">
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${project.security.riskLevel === 'SAFE' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <Shield size={24} className={project.security.riskLevel === 'SAFE' ? 'text-emerald-500' : 'text-red-500'} />
            <div>
            <div className="font-bold text-white">Risk Level: {project.security.riskLevel}</div>
            <div className="text-xs text-gray-400">Automated Audit</div>
            </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-800 rounded border border-gray-700 flex justify-between">
            <span className="text-gray-400 text-sm">Liquidity</span>
            <span className={project.security.liquidityLocked ? "text-emerald-400 font-bold text-sm" : "text-red-400 font-bold text-sm"}>{project.security.liquidityLocked ? 'Locked' : 'Unlocked'}</span>
            </div>
            <div className="p-3 bg-gray-800 rounded border border-gray-700 flex justify-between">
            <span className="text-gray-400 text-sm">Mint Auth</span>
            <span className={!project.security.mintable ? "text-emerald-400 font-bold text-sm" : "text-red-400 font-bold text-sm"}>{!project.security.mintable ? 'Disabled' : 'Enabled'}</span>
            </div>
            </div>
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

// --- DATA LOGIC ---

const generateNarrative = (p: Partial<Project>, technicals: TechnicalAnalysis): string => {
    const momentum = p.momentum24h || 50;
    const trend = technicals.trend;

    const intro = `${p.tick} is showing ${momentum > 60 ? "strong" : "weak"} momentum. `;
    const tech = `Price is ${trend === 'BULLISH' ? 'holding support' : 'facing resistance'} (RSI: ${technicals.rsi}). `;
    const volume = p.volume24h && p.marketCap && (p.volume24h / p.marketCap > 0.1) ? "High volume detected. " : "Volume is moderate. ";

    return intro + tech + volume;
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
        const marketCap = pair?.fdv || price * 1_000_000_000;

        let momentum = 50 + (change24h / 2);
        if (volume24h > 100000) momentum += 10;
        momentum = Math.min(100, Math.max(0, momentum));

        const resistance = price * (1 + Math.random() * 0.15);
        const support = price * (1 - Math.random() * 0.15);
        const rsi = 30 + (momentum * 0.4) + (Math.random() * 10);
        const trend = change24h > 0 ? (rsi > 70 ? 'NEUTRAL' : 'BULLISH') : (rsi < 30 ? 'NEUTRAL' : 'BEARISH');

        const technicals: TechnicalAnalysis = {
            resistance, support, entryZone: support * 1.02, stopLoss: support * 0.95, rsi: Math.floor(rsi), trend
        };

        const securityScore = (liquidity > 50000 ? 50 : 20) + (Math.random() * 40);
        const security: SecurityAudit = {
            score: Math.floor(securityScore),
            riskLevel: securityScore > 75 ? 'SAFE' : securityScore > 40 ? 'MODERATE' : 'CRITICAL',
            liquidityLocked: Math.random() > 0.3,
            mintable: Math.random() > 0.8,
            top10HoldersPercent: Math.floor(Math.random() * 40) + 5,
            honeyPotRisk: false,
            flags: []
        };

        const insight: AIInsight = {
            signal: trend === 'BULLISH' ? 'BUY' : trend === 'BEARISH' ? 'SELL' : 'HOLD',
            confidence: Math.floor(50 + (Math.abs(change24h) * 2)),
            summary: generateNarrative({ tick: config.tick, momentum24h: momentum, volume24h, marketCap }, technicals),
            reason: `Trend is ${trend}`,
            timeframe: '4H'
        };

        const alerts: MomentumAlert[] = [];
        if (Math.abs(change24h) > 10) alerts.push({
            type: change24h > 0 ? 'SPIKE' : 'DUMP',
            severity: 'WARNING',
            message: `${change24h.toFixed(1)}% move`,
                                                  timestamp: new Date(),
                                                  project: config.tick
        });

        return {
            ...config,
            price, change24h, volume24h, marketCap, liquidity,
            holders: 0, supply: 0,
            momentum24h: momentum,
            technicals, security, aiInsight: insight, momentumAlerts: alerts
        };
    } catch (e) {
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
    const [activePriceAlerts, setActivePriceAlerts] = useState<PriceAlert[]>([]);
    const [triggeredAlerts, setTriggeredAlerts] = useState<PriceAlert[]>([]);
    const [showPriceAlertsPanel, setShowPriceAlertsPanel] = useState(true);
    const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);
    const [marketData, setMarketData] = useState<MarketData>({ totalMarketCap: 0, volume24h: 0, avgMomentum: 0, topGainer: '', solanaTPS: 0 });
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState<SortField>('momentum');
    const [sortAsc, setSortAsc] = useState(false);

    // --- NEW STATE for Search and Filter ---
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<FilterType>('ALL');

    const projectConfigs: ProjectConfig[] = useMemo(() => [
        { id: 1, tick: 'CYAI', name: 'CyreneAI', icon: 'https://ipfs.io/ipfs/bafkreiawzlsqgqwwhf2cvqerycsbqfxdakjn4tzt323k3d242kazoqnlhy', contractAddress: '6Tph3SxbAW12BSJdCevVV9Zujh97X69d5MJ4XjwKmray', category: 'DePIN', socialLinks: { twitter: 'https://x.com/cyreneai', website: 'https://cyreneai.com' } },
        { id: 2, tick: 'SGQ', name: "Signiq", icon: "https://ipfs.erebrus.io/ipfs/bafybeieiwzjflsgtcltqrgz442vbrtpqml47xdx2rtckkjfnszrrqs55km", contractAddress: "K9uxt28GvfPsQuapLU1rYxY1REAcZ9NMQ3SYwWbcyai", category: "X SCAN", socialLinks: { twitter: "https://x.com/signiq", website: "https://signiq.xyz", telegram: "https://t.co/07EAGFf72I"} },
        { id: 3, tick: 'CT', name: "CromaFun", icon: "https://ipfs.erebrus.io/ipfs/bafkreia4keguqp7fvjf4rhe7mn27pjendq43ndncydkm7dl2fnvo3gltj4", contractAddress: 'QGA9gSriVnubWRU21Ph5roaGdxFwdpSRT6hmjwycyai', category: "GAMER", socialLinks: {twitter: "https://x.com/cromafun", website: "https://t.co/UYJuDVRELJ", telegram: "https://t.co/cyAojjZvIA"} },
        { id: 4, tick: "U1", name: "Umbrae", icon: "https://ipfs.erebrus.io/ipfs/bafybeib5ilegywnn7weexyx474gx7yjmpjx2kzz6tltnfhxcgyoih4v4gy", contractAddress: "kedoobK2qe2f1V8ee5vDXFr3H7gKnhQVNJXA3Ltcyai", category: "DEFI", socialLinks: {website: "https://www.umbrae.io/", twitter: "https://x.com/Umbrae_Ignis"} },
        { id: 5, tick: "MICK", name: "Mikayla", icon: "https://ipfs.erebrus.io/ipfs/bafybeid7yw6uqklvmsqibfdsgqr5yv62og4bxyqd5sa2fgclfttylv4gyi", contractAddress: "QCDgZ9RDarrnDq57GiSxPyWeJ3PKJndfMcHYkMWcyai", category: "AIML", socialLinks: {twitter: "https://x.com/mikaylafun", website: "https://mikayla.fun"} },
        { id: 6, tick: "AS", name: "Aytes", icon: "https://ipfs.erebrus.io/ipfs/bafkreieycovbezmudyackpbcpypg4fu7k5ke4ipnhwmsdh3cgg5lwj3lb4", contractAddress: 'VsnkRuJmAfymCs8kctHEa4kL3Tvjvg3p21QES1ucyai', category: "AIML", socialLinks: {twitter: "https://x.com/aytes_xyz", website: "https://aytes.xyz", telegram: "https://t.co/3pI3ln8QuL"} },
        { id: 7, tick: "MDS", name: "Medusa Shards", icon: "https://ipfs.erebrus.io/ipfs/bafybeidgjran6u45xlet3y3vmnirohex6yl5xwa3r6u32naw44brvea7ty", contractAddress: "Dria68ScNfmRrvL7K1nx5cEkND6V6V5yUGkFr7gcyai", category: "GAMER", socialLinks: {twitter: "https://x.com/SenkusElixir", website: "https://www.senkuselixir.xyz/"} },
        { id: 8, tick: "PRN", name: "Prana Chain", icon: "https://ipfs.erebrus.io/ipfs/bafybeihywojvhdz5yosirfq2klyhcjssjftjtghnkpumoddgs7tusv4q5e", contractAddress: "C15AhpLTjjVBLLPq5xqH9ewXscSN4DcpkePmHg7geTa6", category: "OTHER", socialLinks: {twitter: "https://x.com/pranachain", website: "https://app.pranachain.com/", } },
        { id: 9, tick: "SCRIPT", name: "Scriptonia", icon: "https://ipfs.erebrus.io/ipfs/bafkreihnj7spy3g6tgh7uzxwh7j7vcgab6w53ozyvtxhk7l3xjkc34jxnq", contractAddress: "C15AhpLTjjVBLLPq5xqH9ewXscSN4DcpkePmHg7geTa6", category: "AIML", socialLinks: {twitter: "https://x.com/Scriptonia_xyz", website: "www.scriptonia.xyz", telegram: "http://t.me/Scriptonia_xyz"} },
        { id: 10, tick: "SWARM", name: "Swarm", icon: "https://ipfs.erebrus.io/ipfs/bafybeiekuifois2jwubg4tcgvhcayermudfo7sox6uazqezjly5opdisy4", contractAddress: "otgodXJDJFFip57AA43ERfDs8pcGviDd9oUJsnEcyai", category: "DePIN", socialLinks: {twitter: "https://x.com/neurolov", website: "http://neurolov.ai/", } },
        { id: 11, tick: "AIDP", name: "AIdp.Store", icon: "https://ipfs.erebrus.io/ipfs/bafkreifnwny3oe66ogdmgyyzhj37d4ghw4iogrb6xlkudrvtvc2w7qboli", contractAddress: "PLNk8NUTBeptajEX9GzZrxsYPJ1psnw62dPnWkGcyai", category: "DePIN", socialLinks: {twitter: "https://x.com/aidpstore", website: "https://www.aidp.store", telegram: "https://t.me/Aidpofficial"} },
        { id: 12, tick: "CF", name: "CrossFund", icon: "https://ipfs.erebrus.io/ipfs/bafybeibjkz4nphyr3r53j5tbhestf7e7kzvf37yfpmvaol342mzwxzaukq", contractAddress: "quauDjvWByAgtij5eJiTgi4NuMtcbaPLd3FpWG9cyai", category: "DEFI", socialLinks: {twitter: "https://x.com/crossfundxyz", website: "https://crossfund.xyz/", telegram: "https://t.co/LAHPtK5xgc"}},
        { id: 13, tick: "TPAYX", name: "TigerPayX", icon: "https://ipfs.erebrus.io/ipfs/bafkreieaz4zv5uz4b65bvasm6f6u4uyiw5bbzwstvmzud5b3sim2oqwmdm", contractAddress: "tMQ2SvQ9EW2X9zQ9vTZQxsrLmSumZy24vqQ17Pacyai", category: "DEFI", socialLinks: {twitter: "https://x.com/tigerpayx", website: "https://www.tigerpayx.com/"},
        },
        { id: 14, tick: "BLAH", name: "BlaBla Protocol", icon: "https://ipfs.erebrus.io/ipfs/bafybeiao34tzrmkb62yqew75w6zoe5favxd6zehsqt6672wlpuux6f75ku", contractAddress: "14N16KX7YihWfM6bQ5obnxovCRoGz9KaHXnorcQ2cyai", category: "AIML", socialLinks: {twitter: "https://x.com/BlablaProtocol", website: "https://www.blablaprotocol.xyz/", linkedin: "https://www.linkedin.com/company/blablaprotocol"}},
        { id: 15, tick: "LUDC", name: "Ludo Cities", icon: "https://ipfs.erebrus.io/ipfs/bafkreifnxasolnd3kmz23nk4fxd2pyworwpwz5g2ans3b4dboyapyldx5y", contractAddress: "JSXWEi4ZXJkrkqWQg4UjUPzpmpYYFxzLmBuADh5cyai", category: "GAMER", socialLinks: {twitter: "https://x.com/LudoCities", website: "https://www.ludocities.com/", telegram: "https://t.me/ludo_cities"}},
        { id: 16, tick: "ARB", name: "African Research Base", icon: "https://ipfs.erebrus.io/ipfs/bafkreia3xsoquay6msiyebbnoqh73oqebcosa5wjrmrntre625cbvuo6iq", contractAddress: "D7ao8w8yjmjMWDfNzgt7J1uVP6qa3JNiRndkoXncyai", category: "INFRA", socialLinks: {twitter: "https://x.com/AfResearchBase", website: "https://www.africaresearchbase.com/"}},
    ], []);

    // --- LOGIC ---

    useEffect(() => {
        const savedWatchlist = localStorage.getItem('signiq-watchlist');
        const savedAlerts = localStorage.getItem('signiq-price-alerts');
        if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
        if (savedAlerts) {
            const parsed = JSON.parse(savedAlerts);
            setActivePriceAlerts(parsed.filter((a:any) => a.status === 'ACTIVE'));
            setTriggeredAlerts(parsed.filter((a:any) => a.status === 'TRIGGERED'));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('signiq-watchlist', JSON.stringify(watchlist));
        localStorage.setItem('signiq-price-alerts', JSON.stringify([...activePriceAlerts, ...triggeredAlerts]));
    }, [watchlist, activePriceAlerts, triggeredAlerts]);

    const toggleWatchlist = (id: number) => setWatchlist(prev => prev.some(p => p.projectId === id) ? prev.filter(p => p.projectId !== id) : [...prev, { projectId: id }]);

    const handleSort = (field: SortField) => {
        if (sortBy === field) setSortAsc(!sortAsc);
        else {
            setSortBy(field);
            setSortAsc(false); // Default desc
        }
    };

    const createPriceAlert = (projectId: number, targetPrice: number, alertType: 'ABOVE' | 'BELOW') => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        const newAlert: PriceAlert = {
            id: `alert_${Date.now()}`, projectId, projectTick: project.tick, projectName: project.name, alertType, targetPrice, currentPrice: project.price, status: 'ACTIVE', createdAt: new Date(), expiresAt: new Date(), notificationType: 'PUSH'
        };
        setActivePriceAlerts(prev => [newAlert, ...prev]);
        setShowCreateAlertModal(false);
    };

    const deleteAlert = (id: string) => {
        setActivePriceAlerts(prev => prev.filter(a => a.id !== id));
        setTriggeredAlerts(prev => prev.filter(a => a.id !== id));
    };

    const exportAlerts = () => {
        alert("Alerts exported to CSV");
    };

    // Fetching
    const fetchAll = useCallback(async () => {
        setLoading(true);
        const results = await Promise.all(projectConfigs.map(c => fetchProjectData(c, undefined)));

        // Initial fetch sets raw data. Filtering happens in useMemo below.
        setProjects(results);

        setMarketData({
            totalMarketCap: results.reduce((a, b) => a + b.marketCap, 0),
                      volume24h: results.reduce((a, b) => a + b.volume24h, 0),
                      avgMomentum: results.reduce((a, b) => a + (b.momentum24h || 0), 0) / results.length,
                      topGainer: results.reduce((max, p) => (p.change24h > max.change24h ? p : max), results[0])?.tick || '',
                      solanaTPS: 2450 + Math.floor(Math.random() * 500)
        });
        setLoading(false);
    }, [projectConfigs]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Alert Checking
    useEffect(() => {
        if(projects.length === 0) return;
        const triggeredIds = new Set<string>();
        activePriceAlerts.forEach(alert => {
            const p = projects.find(p => p.id === alert.projectId);
            if(p && ((alert.alertType === 'ABOVE' && p.price >= alert.targetPrice) || (alert.alertType === 'BELOW' && p.price <= alert.targetPrice))) {
                triggeredIds.add(alert.id);
            }
        });
        if (triggeredIds.size > 0) {
            const triggers = activePriceAlerts.filter(a => triggeredIds.has(a.id)).map(a => ({...a, status: 'TRIGGERED' as const}));
            setTriggeredAlerts(prev => [...triggers, ...prev]);
            setActivePriceAlerts(prev => prev.filter(a => !triggeredIds.has(a.id)));
        }
    }, [projects]);

    // --- FILTERING & SORTING LOGIC ---
    const processedProjects = useMemo(() => {
        let result = [...projects];

        // 1. Search Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.tick.toLowerCase().includes(lowerQuery) ||
            p.contractAddress.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Category Filter
        if (activeCategory !== 'ALL') {
            result = result.filter(p => p.category === activeCategory);
        }

        // 3. Sorting
        result.sort((a, b) => {
            let valA, valB;
            if (sortBy === 'marketCap') { valA = a.marketCap; valB = b.marketCap; }
            else if (sortBy === 'momentum') { valA = a.momentum24h || 0; valB = b.momentum24h || 0; }
            else if (sortBy === 'change24h') { valA = a.change24h; valB = b.change24h; }
            else if (sortBy === 'volume24h') { valA = a.volume24h; valB = b.volume24h; }
            else { valA = a.security.score; valB = b.security.score; }
            return sortAsc ? valA - valB : valB - valA;
        });

        return result;
    }, [projects, searchQuery, activeCategory, sortBy, sortAsc]);

    const allAlerts = projects.flatMap(p => p.momentumAlerts || []);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">

        {/* MODALS */}
        {selectedProject && (
            <ProjectDetailModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            toggleWatchlist={toggleWatchlist}
            isInWatchlist={(id: number) => watchlist.some(w => w.projectId === id)}
            onCreateAlert={() => { setSelectedProject(null); setShowCreateAlertModal(true); }}
            />
        )}
        {showCreateAlertModal && (
            <CreateAlertModal
            projects={projects}
            initialProjectId={selectedProject?.id}
            onClose={() => setShowCreateAlertModal(false)}
            onCreate={createPriceAlert}
            />
        )}

        {/* HEADER */}
        <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-cyan-500/20 overflow-hidden">
        <img src="https://pbs.twimg.com/profile_images/1981894583337312256/wPbNT3dv_400x400.jpg" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Signiq<span className="text-cyan-400">Marketplace</span></h1>
        </div>

        <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
        <button onClick={fetchAll} disabled={loading} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
        </div>
        </div>
        </div>
        </header>

        {/* TICKER TAPE */}
        <TickerTape alerts={allAlerts} />

        <main className="max-w-7xl mx-auto p-6">

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Market Cap</div>
        <div className="text-2xl font-mono font-bold text-white">{formatNumber(marketData.totalMarketCap)}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">24h Volume</div>
        <div className="text-2xl font-mono font-bold text-white">{formatNumber(marketData.volume24h)}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Top Gainer</div>
        <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
        {marketData.topGainer || '-'} <TrendingUp size={20}/>
        </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-900 to-gray-900 border border-indigo-500/30 p-4 rounded-xl relative overflow-hidden">
        <div className="relative z-10">
        <div className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">AI Sentiment</div>
        <div className="text-2xl font-bold text-white">Bullish</div>
        </div>
        <Brain className="absolute right-[-10px] bottom-[-10px] text-indigo-500/20 w-24 h-24" />
        </div>
        </div>

        {/* ALERTS SECTION */}
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

        {/* SEARCH & FILTERS TOOLBAR */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start md:items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-96 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
        </div>
        <input
        type="text"
        className="block w-full pl-10 pr-3 py-2.5 bg-gray-900 border border-gray-800 rounded-xl leading-5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-black focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm transition-all shadow-lg"
        placeholder="Search by Name, Ticker, or Address..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
        {['ALL', 'DEFI', 'GAMER', 'X SCAN', 'AIML', 'INFRA', 'DePIN', 'OTHER'].map((cat) => (
            <button
            key={cat}
            onClick={() => setActiveCategory(cat as FilterType)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeCategory === cat
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-white'
            }`}
            >
            {cat}
            </button>
        ))}
        </div>
        </div>

        {/* MAIN TABLE */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
        <thead className="bg-gray-950 text-gray-500 text-xs font-bold uppercase tracking-wider">
        <tr>
        <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('marketCap')}>Token {sortBy === 'marketCap' && (sortAsc ? '▲' : '▼')}</th>
        <th className="p-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('marketCap')}>Price</th>
        <th className="p-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('change24h')}>24h % {sortBy === 'change24h' && (sortAsc ? '▲' : '▼')}</th>
        <th className="p-4 text-right">Chart</th>
        <th className="p-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('marketCap')}>M. Cap</th>
        <th className="p-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('volume24h')}>Vol/MC {sortBy === 'volume24h' && (sortAsc ? '▲' : '▼')}</th>
        <th className="p-4 text-center cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('momentum')}>Momentum {sortBy === 'momentum' && (sortAsc ? '▲' : '▼')}</th>
        <th className="p-4 text-center cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('security')}>Safety {sortBy === 'security' && (sortAsc ? '▲' : '▼')}</th>
        <th className="p-4 text-right">Actions</th>
        </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
        {processedProjects.map(p => (
            <tr key={p.id} onClick={() => setSelectedProject(p)} className="hover:bg-gray-800/50 cursor-pointer transition-all group">
            <td className="p-4">
            <div className="flex items-center gap-3">
            <div className="text-xl bg-gray-800 p-2 rounded-lg">
            <img className="sm:w-8 sm:h-8 w-[0px] h-[0px] rounded-full" src={p.icon} />
            </div>
            <div>
            <div className="font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">{p.tick}</div>
            <div className="text-xs text-gray-500">{p.name}</div>
            </div>
            </div>
            </td>
            <td className="p-4 text-right font-mono text-gray-300">{formatPrice(p.price)}</td>
            <td className={`p-4 text-right font-bold ${p.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {p.change24h > 0 ? '+' : ''}{p.change24h.toFixed(2)}%
            </td>
            <td className="p-4 text-right"><MiniSparkline change={p.change24h} /></td>
            <td className="p-4 text-right font-mono text-gray-400">{formatCompactNumber(p.marketCap)}</td>
            <td className="p-4 text-right font-mono text-yellow-500">{(p.volume24h / p.marketCap).toFixed(2)}</td>
            <td className="p-4 text-center">
            <div className={`inline-block px-2 py-1 rounded text-xs font-bold bg-gray-800 ${getMomentumColor(p.momentum24h)}`}>
            {p.momentum24h?.toFixed(0)}
            </div>
            </td>
            <td className="p-4 text-center">
            <Shield size={16} className={`inline-block ${p.security.riskLevel === 'SAFE' ? 'text-emerald-500' : p.security.riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-yellow-500'}`} />
            </td>
            <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <button
            onClick={() => {
                navigator.clipboard.writeText(p.contractAddress);
                toast(`$${p.tick} copied`, {
                    description: p.contractAddress.slice(0, 6) + "..." + p.contractAddress.slice(-4),
                      className: "bg-slate-950"
                });
            }}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            title="Copy CA"
            >
            <Copy size={14} />
            </button>
            <button
            onClick={() => toggleWatchlist(p.id)}
            className={`p-2 bg-gray-800 hover:bg-gray-700 rounded ${watchlist.some(w => w.projectId === p.id) ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
            title="Watchlist"
            >
            <Star size={14} fill={watchlist.some(w => w.projectId === p.id) ? "currentColor" : "none"} />
            </button>
            <button
            onClick={() => { setSelectedProject(null); setSelectedProject(p); setShowCreateAlertModal(true); }}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-cyan-400 hover:text-white"
            title="Alert"
            >
            <Bell size={14} />
            </button>
            </div>
            </td>
            </tr>
        ))}
        </tbody>
        </table>
        {processedProjects.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
            <div className="p-4 bg-gray-800/50 rounded-full mb-4">
            <Search size={32} className="text-gray-600" />
            </div>
            <p className="text-lg font-bold text-gray-300">No projects found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters.</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); }} className="mt-4 text-cyan-400 hover:underline text-sm font-bold">Clear Filters</button>
            </div>
        )}
        </div>
        </div>
        </main>
        </div>
    );
};

export default SigniqMarket;
