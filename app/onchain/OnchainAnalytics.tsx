"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Coins,
  Search,
  TrendingUp,
  Users,
  Activity,
  Droplets,
  BarChart3,
  Wallet,
  ArrowUpDown,
  DollarSign,
  Target,
  Zap,
  Brain,
  Eye,
  Clock,
  AlertTriangle,
  TrendingDown,
  Shield,
  Flame,
  Award,
  User,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ============================================================================
// BUBBLE HOLDER CHART - Interactive holder distribution visualization
// ============================================================================

const BubbleHolderChart = ({ holders, totalSupply }) => {
  const [selectedBubble, setSelectedBubble] = useState(null)
  const [hoveredBubble, setHoveredBubble] = useState(null)

  const bubbles = useMemo(() => {
    if (!holders || holders.length === 0) return []
    
    return holders.slice(0, 50).map((holder, index) => {
      const percentage = holder.percentage || 0
      const size = Math.sqrt(percentage) * 15 + 20
      const angle = (index / holders.length) * Math.PI * 2
      const radius = 150 + (index % 3) * 80
      const x = 300 + Math.cos(angle) * radius
      const y = 300 + Math.sin(angle) * radius
      
      // Categorize holder type
      let type = 'trader'
      let color = 'rgb(59, 130, 246)' // blue
      
      if (percentage > 10) {
        type = 'whale'
        color = 'rgb(239, 68, 68)' // red
      } else if (percentage > 5) {
        type = 'large'
        color = 'rgb(249, 115, 22)' // orange
      } else if (percentage > 1) {
        type = 'medium'
        color = 'rgb(234, 179, 8)' // yellow
      } else {
        type = 'small'
        color = 'rgb(34, 197, 94)' // green
      }
      
      return {
        id: holder.address,
        address: holder.address,
        balance: holder.balance,
        percentage,
        size,
        x,
        y,
        type,
        color,
        label: holder.label
      }
    })
  }, [holders])

  const formatAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  
  const selected: any = selectedBubble || hoveredBubble
  
  return (
    <div className="relative w-full h-[600px] bg-black/40 rounded-xl overflow-hidden">
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/80 rounded-lg p-4 space-y-2 z-10">
        <div className="text-xs text-gray-400 uppercase font-mono mb-2">Holder Types</div>
        {[
          { type: 'Whale', color: 'rgb(239, 68, 68)', range: '>10%' },
          { type: 'Large', color: 'rgb(249, 115, 22)', range: '5-10%' },
          { type: 'Medium', color: 'rgb(234, 179, 8)', range: '1-5%' },
          { type: 'Small', color: 'rgb(34, 197, 94)', range: '<1%' }
        ].map(item => (
          <div key={item.type} className="flex items-center space-x-2 text-xs">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-300">{item.type}</span>
            <span className="text-gray-500">{item.range}</span>
          </div>
        ))}
      </div>

      {/* Info Panel */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-4 bg-black/90 rounded-lg p-4 z-10 max-w-xs"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Wallet className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-mono text-white">
              {formatAddress(selected.address)}
            </span>
          </div>
          {selected.label && (
            <Badge className="mb-2 bg-purple-500/20 text-purple-400 border-purple-500/50">
              {selected.label}
            </Badge>
          )}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Holdings:</span>
              <span className="text-white font-mono">{selected.percentage.toFixed(3)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white capitalize">{selected.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Balance:</span>
              <span className="text-white font-mono">
                {parseFloat(selected.balance).toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* SVG Visualization */}
      <svg width="100%" height="100%" viewBox="0 0 600 600">
        {/* Center circle */}
        <circle cx="300" cy="300" r="80" fill="rgba(16, 185, 129, 0.1)" stroke="rgb(16, 185, 129)" strokeWidth="2" />
        <text x="300" y="295" textAnchor="middle" fill="rgb(16, 185, 129)" fontSize="14" fontFamily="monospace">
          Token
        </text>
        <text x="300" y="315" textAnchor="middle" fill="rgb(16, 185, 129)" fontSize="12" fontFamily="monospace">
          Supply
        </text>

        {/* Connection lines */}
        {bubbles.map(bubble => (
          <line
            key={`line-${bubble.id}`}
            x1="300"
            y1="300"
            x2={bubble.x}
            y2={bubble.y}
            stroke={bubble.color}
            strokeWidth={hoveredBubble?.id === bubble.id ? 2 : 1}
            opacity={hoveredBubble?.id === bubble.id ? 0.6 : 0.2}
          />
        ))}

        {/* Holder bubbles */}
        {bubbles.map(bubble => (
          <g key={bubble.id}>
            <motion.circle
              cx={bubble.x}
              cy={bubble.y}
              r={bubble.size}
              fill={bubble.color}
              opacity={hoveredBubble?.id === bubble.id || selectedBubble?.id === bubble.id ? 0.8 : 0.6}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredBubble(bubble)}
              onMouseLeave={() => setHoveredBubble(null)}
              onClick={() => setSelectedBubble(selectedBubble?.id === bubble.id ? null : bubble)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ delay: Math.random() * 0.5 }}
            />
            {(hoveredBubble?.id === bubble.id || selectedBubble?.id === bubble.id) && (
              <motion.circle
                cx={bubble.x}
                cy={bubble.y}
                r={bubble.size + 5}
                fill="none"
                stroke={bubble.color}
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

// ============================================================================
// HOLDER BEHAVIOR ANALYSIS
// ============================================================================

const HolderBehaviorAnalysis = ({ behaviors }) => {
  if (!behaviors || behaviors.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Analyzing holder behaviors...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {behaviors.map((holder, index) => {
        const isLongTermHolder = holder.holdingDays > 30
        const isActiveTrader = holder.transactions > 10
        const isProfitable = holder.unrealizedPnL > 0
        
        return (
          <motion.div
            key={holder.address}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="!bg-gray-900/50 border-gray-800 hover:border-blue-500/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isProfitable ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      <User className={`h-5 w-5 ${isProfitable ? 'text-green-400' : 'text-red-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm text-white">
                          {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
                        </span>
                        <Badge variant="outline" className={`text-xs ${
                          isLongTermHolder 
                            ? 'border-purple-500/50 text-purple-400 bg-purple-500/10'
                            : 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
                        }`}>
                          {isLongTermHolder ? 'HOLDER' : 'TRADER'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Rank #{index + 1} • {holder.percentage.toFixed(2)}% of supply
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold font-mono ${
                      isProfitable ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isProfitable ? '+' : ''}{holder.unrealizedPnL.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">Unrealized P/L</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Avg Entry</div>
                    <div className="text-sm text-white font-mono">${holder.avgEntryPrice.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Holdings</div>
                    <div className="text-sm text-white font-mono">{holder.holdingDays}d</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Trades</div>
                    <div className="text-sm text-white font-mono">{holder.transactions}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Activity</div>
                    <div className="text-sm text-white font-mono">{holder.lastActivity}h</div>
                  </div>
                </div>

                {/* Behavior Pattern */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Buy Tendency</span>
                    <span className="text-green-400 font-mono">{holder.buyTendency}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 to-green-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${holder.buyTendency}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  
                  {/* Behavior Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {holder.patterns.map((pattern, i) => (
                      <Badge 
                        key={i}
                        variant="outline" 
                        className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/5"
                      >
                        {pattern}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Risk Alert */}
                {holder.riskLevel === 'high' && (
                  <Alert className="mt-3 border-red-500/50 bg-red-500/10">
                    <AlertTriangle className="h-3 w-3 text-red-400" />
                    <AlertDescription className="text-xs text-red-300">
                      {holder.riskReason}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

// ============================================================================
// SMART MONEY TRACKER
// ============================================================================

const SmartMoneyTracker = ({ smartWallets }) => {
  const [selectedWallet, setSelectedWallet] = useState(null)

  if (!smartWallets || smartWallets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No smart money detected yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {smartWallets.map((wallet, index) => (
        <motion.div
          key={wallet.address}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="!bg-black/40 border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-black">#{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-white">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </span>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                        Smart Money
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Success Rate: {wallet.successRate}% • Win Streak: {wallet.winStreak}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400 font-mono">
                    +{wallet.totalReturn.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">Total Return</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center p-2 bg-black/30 rounded">
                  <div className="text-xs text-gray-400 mb-1">Trades</div>
                  <div className="text-sm text-white font-mono">{wallet.totalTrades}</div>
                </div>
                <div className="text-center p-2 bg-black/30 rounded">
                  <div className="text-xs text-gray-400 mb-1">Wins</div>
                  <div className="text-sm text-green-400 font-mono">{wallet.wins}</div>
                </div>
                <div className="text-center p-2 bg-black/30 rounded">
                  <div className="text-xs text-gray-400 mb-1">Avg Hold</div>
                  <div className="text-sm text-white font-mono">{wallet.avgHoldTime}d</div>
                </div>
                <div className="text-center p-2 bg-black/30 rounded">
                  <div className="text-xs text-gray-400 mb-1">Volume</div>
                  <div className="text-sm text-white font-mono">${(wallet.volumeTraded / 1000).toFixed(0)}K</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-2">
                <div className="text-xs text-gray-400 uppercase font-mono">Recent Moves</div>
                {wallet.recentMoves.slice(0, 3).map((move, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-black/20 rounded text-xs">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${move.type === 'buy' ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="text-gray-300">{move.type === 'buy' ? 'Bought' : 'Sold'}</span>
                      <span className="text-gray-500">{move.timeAgo}</span>
                    </div>
                    <span className={`font-mono ${move.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {move.pnl >= 0 ? '+' : ''}{move.pnl.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Copy Trade Alert */}
              {wallet.isActive && (
                <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-blue-300">
                    Active trader • Last seen {wallet.lastSeen}h ago
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================================================
// TRADING HEATMAP
// ============================================================================

const TradingHeatmap = ({ hourlyData }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  // Generate realistic heatmap data
  const heatmapData = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) {
      // Generate sample data
      return days.map(() => 
        hours.map(() => Math.random() * 100)
      )
    }
    
    // Use actual hourly data, repeated for days
    return days.map(() => 
      hours.map(hour => {
        const hourData = hourlyData.find(h => h.hour === hour)
        return hourData ? (hourData.count / Math.max(...hourlyData.map(h => h.count))) * 100 : 0
      })
    )
  }, [hourlyData])

  const getColor = (value) => {
    if (value > 80) return 'rgb(239, 68, 68)'
    if (value > 60) return 'rgb(249, 115, 22)'
    if (value > 40) return 'rgb(234, 179, 8)'
    if (value > 20) return 'rgb(34, 197, 94)'
    return 'rgb(59, 130, 246)'
  }

  const maxValue = Math.max(...heatmapData.flat())
  const peakHour = hours[heatmapData[0].indexOf(Math.max(...heatmapData[0]))]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-mono text-white">Trading Activity Heatmap</h3>
          <p className="text-sm text-gray-400">Darker colors = higher activity</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Peak Trading Hour</div>
          <div className="text-2xl font-bold text-orange-400 font-mono">
            {peakHour.toString().padStart(2, '0')}:00 UTC
          </div>
        </div>
      </div>

      <div className="bg-black/40 rounded-xl p-4 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-12" />
            {hours.map(hour => (
              <div key={hour} className="flex-1 text-center">
                <span className="text-xs text-gray-500 font-mono">
                  {hour.toString().padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>

          {/* Heatmap cells */}
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-12 text-xs text-gray-400 font-mono">{day}</div>
              {hours.map((hour, hourIndex) => {
                const value = heatmapData[dayIndex][hourIndex]
                const intensity = value / maxValue
                
                return (
                  <div key={hour} className="flex-1 px-0.5">
                    <motion.div
                      className="h-8 rounded cursor-pointer"
                      style={{ backgroundColor: getColor(value) }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 0.3 + intensity * 0.7, scale: 1 }}
                      whileHover={{ opacity: 1, scale: 1.1 }}
                      transition={{ delay: (dayIndex * hours.length + hourIndex) * 0.01 }}
                    />
                  </div>
                )
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            <span className="text-xs text-gray-500">Low</span>
            <div className="flex space-x-1">
              {[20, 40, 60, 80, 100].map(val => (
                <div 
                  key={val}
                  className="w-8 h-4 rounded"
                  style={{ backgroundColor: getColor(val), opacity: 0.3 + (val / 100) * 0.7 }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">High</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EnhancedOnchainAnalytics() {
  const [contractAddress, setContractAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data generator for demo
  const generateMockData = () => {
    const holders = Array.from({ length: 50 }, (_, i) => ({
      address: `0x${Math.random().toString(16).slice(2, 42)}`,
      balance: (Math.random() * 1000000).toFixed(2),
      percentage: Math.random() * (i === 0 ? 15 : i < 5 ? 5 : 1),
      label: i < 3 ? ['Raydium Pool', 'Team Wallet', 'Marketing'][i] : undefined
    }))

    const behaviors = holders.slice(0, 20).map((holder, i) => ({
      ...holder,
      avgEntryPrice: Math.random() * 0.1,
      unrealizedPnL: (Math.random() - 0.3) * 200,
      holdingDays: Math.floor(Math.random() * 90),
      transactions: Math.floor(Math.random() * 50),
      lastActivity: Math.floor(Math.random() * 72),
      buyTendency: 40 + Math.random() * 40,
      patterns: [
        Math.random() > 0.5 ? 'Accumulating' : 'Distributing',
        Math.random() > 0.7 ? 'Day Trader' : 'Swing Trader'
      ].filter(Boolean),
      riskLevel: i < 5 ? 'high' : 'low',
      riskReason: i < 5 ? 'Large holder with recent selling activity' : undefined
    }))

    const smartWallets = Array.from({ length: 10 }, (_, i) => ({
      address: `0x${Math.random().toString(16).slice(2, 42)}`,
      successRate: 60 + Math.random() * 35,
      totalReturn: 100 + Math.random() * 500,
      totalTrades: Math.floor(20 + Math.random() * 100),
      wins: Math.floor(15 + Math.random() * 80),
      avgHoldTime: Math.floor(2 + Math.random() * 20),
      volumeTraded: Math.floor(50000 + Math.random() * 500000),
      winStreak: Math.floor(Math.random() * 10),
      recentMoves: Array.from({ length: 5 }, (_, j) => ({
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        timeAgo: `${Math.floor(Math.random() * 48)}h ago`,
        pnl: (Math.random() - 0.3) * 100
      })),
      isActive: Math.random() > 0.3,
      lastSeen: Math.floor(Math.random() * 24)
    })).sort((a, b) => b.totalReturn - a.totalReturn)

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: Math.floor(100 + Math.random() * 900),
      volume: Math.random() * 100000
    }))

    return {
      holders,
      behaviors,
      smartWallets,
      hourlyData,
      metrics: {
        totalHolders: holders.length,
        whaleCount: holders.filter(h => h.percentage > 10).length,
        mediumHolders: holders.filter(h => h.percentage > 1 && h.percentage <= 10).length,
        avgHoldTime: 45,
        holderGrowth24h: Math.floor(Math.random() * 100),
        smartMoneyPresence: smartWallets.length,
        averageProfit: behaviors.reduce((sum, b) => sum + b.unrealizedPnL, 0) / behaviors.length
      }
    }
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 2000))
      setData(generateMockData())
    } catch (err) {
      setError("Failed to analyze token")
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
    return num.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Coins className="h-12 w-12 text-blue-400" />
            </motion.div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 font-mono">
            ONCHAIN INTELLIGENCE
          </h1>
          <p className="text-gray-400 text-lg">
            Advanced holder analytics, smart money tracking & behavioral insights
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <Card className="!bg-gray-900/60 border-gray-800">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Enter token address..."
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="flex-1 bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-mono flex items-center space-x-2 transition-all"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>ANALYZING...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      <span>ANALYZE</span>
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-8 border-red-500/50 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Users, label: 'Total Holders', value: data.metrics.totalHolders, color: 'blue' },
                  { icon: Flame, label: 'Whale Count', value: data.metrics.whaleCount, color: 'red' },
                  { icon: Clock, label: 'Avg Hold Time', value: `${data.metrics.avgHoldTime}d`, color: 'purple' },
                  { icon: TrendingUp, label: 'Avg Profit', value: `${data.metrics.averageProfit.toFixed(1)}%`, color: 'green' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className={`!bg-gray-900/60 border-${stat.color}-500/30 hover:border-${stat.color}-500/50 transition-colors`}>
                      <CardContent className="p-4">
                        <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center mb-3`}>
                          <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{stat.label}</div>
                        <div className={`text-2xl font-bold text-${stat.color}-400 font-mono`}>{stat.value}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-gray-900/60 border border-gray-800 p-1">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="holders"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Holder Map
                  </TabsTrigger>
                  <TabsTrigger 
                    value="behavior"
                    className="data-[state=active]:bg-pink-600 data-[state=active]:text-white"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Behavior
                  </TabsTrigger>
                  <TabsTrigger 
                    value="smart"
                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Smart Money
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity"
                    className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Activity
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Card className="!bg-gray-900/60 border-gray-800">
                    <CardHeader className="border-b border-gray-800">
                      <CardTitle className="text-xl text-white font-mono flex items-center">
                        <Eye className="h-5 w-5 mr-2 text-blue-400" />
                        Token Overview & Key Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-mono text-white mb-4">Distribution Analysis</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Top 10 Holdings</span>
                              <span className="text-white font-mono">
                                {data.holders.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0).toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Concentration Risk</span>
                              <Badge className={`${
                                data.holders[0].percentage > 10 ? 'bg-red-500/20 text-red-400' :
                                data.holders[0].percentage > 5 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {data.holders[0].percentage > 10 ? 'HIGH' :
                                 data.holders[0].percentage > 5 ? 'MEDIUM' : 'LOW'}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">New Holders (24h)</span>
                              <span className="text-green-400 font-mono">+{data.metrics.holderGrowth24h}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-mono text-white mb-4">Market Sentiment</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Smart Money Active</span>
                              <span className="text-purple-400 font-mono">{data.metrics.smartMoneyPresence} wallets</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Holder Sentiment</span>
                              <Badge className="bg-green-500/20 text-green-400">BULLISH</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Accumulation Phase</span>
                              <span className="text-blue-400 font-mono">Active</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Key Insights */}
                      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Brain className="h-5 w-5 text-blue-400 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-mono text-blue-300 mb-2">AI Analysis</h4>
                            <ul className="space-y-1 text-sm text-gray-300">
                              <li>• Strong holder base with {data.holders.filter(h => h.percentage < 1).length} small holders providing stability</li>
                              <li>• {data.smartWallets.filter(w => w.isActive).length} smart money wallets currently active</li>
                              <li>• Average holding period of {data.metrics.avgHoldTime} days indicates long-term confidence</li>
                              <li>• Recent holder growth of +{data.metrics.holderGrowth24h} suggests increasing interest</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Holder Map Tab */}
                <TabsContent value="holders">
                  <Card className="!bg-gray-900/60 border-gray-800">
                    <CardHeader className="border-b border-gray-800">
                      <CardTitle className="text-xl text-white font-mono flex items-center">
                        <Users className="h-5 w-5 mr-2 text-purple-400" />
                        Interactive Holder Distribution Map
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <BubbleHolderChart holders={data.holders} totalSupply={1000000000} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Behavior Tab */}
                <TabsContent value="behavior">
                  <Card className="!bg-gray-900/60 border-gray-800">
                    <CardHeader className="border-b border-gray-800">
                      <CardTitle className="text-xl text-white font-mono flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-pink-400" />
                        Top Holder Behavior Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <HolderBehaviorAnalysis behaviors={data.behaviors} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Smart Money Tab */}
                <TabsContent value="smart">
                  <Card className="!bg-gray-900/60 border-gray-800">
                    <CardHeader className="border-b border-gray-800">
                      <CardTitle className="text-xl text-white font-mono flex items-center">
                        <Award className="h-5 w-5 mr-2 text-green-400" />
                        Smart Money Tracker
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Shield className="h-5 w-5 text-purple-400 mt-0.5" />
                          <div className="text-sm text-gray-300">
                            <p className="font-mono text-purple-300 mb-1">What is Smart Money?</p>
                            <p>These wallets have demonstrated consistent profitability and strategic trading patterns. 
                            Following their moves can provide valuable insights into market sentiment and potential opportunities.</p>
                          </div>
                        </div>
                      </div>
                      <SmartMoneyTracker smartWallets={data.smartWallets} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity">
                  <Card className="!bg-gray-900/60 border-gray-800">
                    <CardHeader className="border-b border-gray-800">
                      <CardTitle className="text-xl text-white font-mono flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-orange-400" />
                        Trading Activity Patterns
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <TradingHeatmap hourlyData={data.hourlyData} />
                      
                      <div className="mt-6 grid md:grid-cols-3 gap-4">
                        <Card className="!bg-black/40 border-gray-800">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-green-400" />
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">Peak Volume Hour</div>
                                <div className="text-lg font-bold text-white font-mono">15:00 UTC</div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">Highest trading activity detected</p>
                          </CardContent>
                        </Card>

                        <Card className="!bg-black/40 border-gray-800">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">Most Active Day</div>
                                <div className="text-lg font-bold text-white font-mono">Tuesday</div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">Consistent high volume pattern</p>
                          </CardContent>
                        </Card>

                        <Card className="!bg-black/40 border-gray-800">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Zap className="h-5 w-5 text-purple-400" />
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">Volatility Window</div>
                                <div className="text-lg font-bold text-white font-mono">18-22 UTC</div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">Highest price movements</p>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Trading Recommendation */}
              <Card className="!bg-black/40 border-blue-500/30">
                <CardHeader className="border-b border-blue-500/20">
                  <CardTitle className="text-xl text-white font-mono flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-400" />
                    AI Trading Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Overall Score</div>
                      <div className="text-5xl font-bold text-blue-400 font-mono mb-4">78/100</div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                          <span className="text-sm text-gray-300">Strong holder distribution</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                          <span className="text-sm text-gray-300">Smart money accumulating</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                          <span className="text-sm text-gray-300">Medium concentration risk</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Risk Assessment</div>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 mb-4">
                        MEDIUM RISK
                      </Badge>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Token shows healthy holder distribution with active smart money participation. 
                        Trading patterns indicate accumulation phase. Consider entering with proper risk management 
                        during low volatility hours (08:00-14:00 UTC).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}