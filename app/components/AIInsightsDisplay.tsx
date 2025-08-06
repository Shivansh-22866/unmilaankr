"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Brain, TrendingUp, TrendingDown, Zap, Target, AlertTriangle, Award, BarChart3, Gauge } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AIBrainScan } from "./AIBrainScan"
import { SignalAlignmentViz } from "./SignalAlignmentViz"
import { TrendVelocityGauge } from "./TrendVelocityGauge"
import type { AIinsights } from "@/types/agent"

interface EnhancedAIInsightsDisplayProps {
  insights: AIinsights
  isProcessing: boolean
}

export function AIInsightsDisplay({ insights, isProcessing }: EnhancedAIInsightsDisplayProps) {
  const getOutlookIcon = () => {
    switch (insights.outlook) {
      case "bullish":
        return <TrendingUp className="h-5 w-5 text-green-400" />
      case "bearish":
        return <TrendingDown className="h-5 w-5 text-red-400" />
      default:
        return <Zap className="h-5 w-5 text-yellow-400" />
    }
  }

  const getOutlookColor = () => {
    switch (insights.outlook) {
      case "bullish":
        return "from-green-500 to-emerald-600"
      case "bearish":
        return "from-red-500 to-pink-600"
      default:
        return "from-yellow-500 to-orange-600"
    }
  }

  const getRiskColor = () => {
    switch (insights.riskLevel) {
      case "low":
        return "text-green-400 border-green-500/50 bg-green-500/10"
      case "medium":
        return "text-yellow-400 border-yellow-500/50 bg-yellow-500/10"
      case "high":
        return "text-red-400 border-red-500/50 bg-red-500/10"
      default:
        return "text-gray-400 border-gray-500/50 bg-gray-500/10"
    }
  }

  const getPerformanceColor = (percentile: number) => {
    if (percentile >= 80) return "text-green-400"
    if (percentile >= 60) return "text-blue-400"
    if (percentile >= 40) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="space-y-8">
      {/* AI Processing Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="flex items-center justify-center mb-4">
          <motion.div
            className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30"
            animate={{
              scale: isProcessing ? [1, 1.1, 1] : 1,
              rotate: isProcessing ? [0, 360] : 0,
            }}
            transition={{
              scale: { duration: 2, repeat: isProcessing ? Number.POSITIVE_INFINITY : 0 },
              rotate: { duration: 10, repeat: isProcessing ? Number.POSITIVE_INFINITY : 0, ease: "linear" },
            }}
          >
            <Brain className="h-8 w-8 text-purple-400" />
          </motion.div>
        </div>
        <h2 className="text-3xl font-bold text-white font-mono mb-2">GROQ AI NEURAL ANALYSIS</h2>
        <p className="text-gray-400">Advanced LLaMA-3 powered Web3 intelligence with cross-domain signal processing</p>
      </motion.div>

      {/* Neural Network Visualization */}
      {/* <Card className="bg-black/60 backdrop-blur-md border border-purple-500/30 shadow-2xl">
        <CardHeader className="border-b border-purple-500/20">
          <CardTitle className="text-xl text-white font-mono flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-400" />
            NEURAL NETWORK PROCESSING
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-96">
            <NeuralNetworkViz isProcessing={isProcessing} />
          </div>
        </CardContent>
      </Card> */}

      {/* Enhanced AI Insights Grid */}
      <AnimatePresence>
        {insights.summary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Top Row - Main Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Narrative & Summary */}
              <div className="lg:col-span-2 space-y-6">
                {/* Narrative Card */}
                <Card className="bg-black/60 backdrop-blur-md border border-cyan-500/30 shadow-2xl">
                  <CardHeader className="border-b border-cyan-500/20">
                    <CardTitle className="text-xl text-white font-mono flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-cyan-400" />
                      PROJECT NARRATIVE
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <motion.p
                      className="text-gray-300 text-lg leading-relaxed mb-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {insights.narrative}
                    </motion.p>
                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="text-sm font-medium text-cyan-400 uppercase tracking-wider mb-2">
                        Executive Summary
                      </h4>
                      <p className="text-gray-300">{insights.summary}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Signals */}
                <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 shadow-2xl">
                  <CardHeader className="border-b border-green-500/20">
                    <CardTitle className="text-xl text-white font-mono flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-green-400" />
                      KEY SIGNALS DETECTED
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {insights.keySignals.map((signal, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center space-x-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-gray-300 flex-1 text-sm">{signal}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side Panel - Quick Stats */}
              <div className="space-y-6">
                {/* Brain Scan */}
                <Card className="bg-black/60 backdrop-blur-md border border-cyan-500/30 shadow-2xl">
                  <CardHeader className="border-b border-cyan-500/20">
                    <CardTitle className="text-lg text-white font-mono flex items-center">
                      <Brain className="h-4 w-4 mr-2 text-cyan-400" />
                      AI CONFIDENCE SCAN
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-48">
                      <AIBrainScan confidence={insights.confidence} />
                    </div>
                  </CardContent>
                </Card>

                {/* Outlook & Risk */}
                <Card className="bg-black/60 backdrop-blur-md border border-yellow-500/30 shadow-2xl">
                  <CardHeader className="border-b border-yellow-500/20">
                    <CardTitle className="text-lg text-white font-mono flex items-center">
                      {getOutlookIcon()}
                      <span className="ml-2">MARKET OUTLOOK</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <motion.div
                        className={`text-4xl font-bold bg-gradient-to-r ${getOutlookColor()} bg-clip-text text-transparent font-mono`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        {insights.outlook.toUpperCase()}
                      </motion.div>
                      <Badge variant="outline" className={`${getRiskColor()} px-4 py-2 font-mono`}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {insights.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Second Row - Advanced Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Signal Alignment */}
              <Card className="bg-black/60 backdrop-blur-md border border-purple-500/30 shadow-2xl">
                <CardHeader className="border-b border-purple-500/20">
                  <CardTitle className="text-xl text-white font-mono flex items-center">
                    <Target className="h-5 w-5 mr-2 text-purple-400" />
                    SIGNAL ALIGNMENT MATRIX
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-72 mb-4">
                    <SignalAlignmentViz
                      githubVsTwitter={insights.signalAlignment.githubVsTwitter}
                      communityVsOnchain={insights.signalAlignment.communityVsOnchain}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">GitHub ↔ Twitter</p>
                      <Badge
                        variant={insights.signalAlignment.githubVsTwitter === "aligned" ? "default" : "destructive"}
                        className="font-mono"
                      >
                        {insights.signalAlignment.githubVsTwitter.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">Community ↔ Onchain</p>
                      <Badge
                        variant={insights.signalAlignment.communityVsOnchain === "aligned" ? "default" : "destructive"}
                        className="font-mono"
                      >
                        {insights.signalAlignment.communityVsOnchain.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trend Velocity */}
              <Card className="bg-black/60 backdrop-blur-md border border-orange-500/30 shadow-2xl">
                <CardHeader className="border-b border-orange-500/20">
                  <CardTitle className="text-xl text-white font-mono flex items-center">
                    <Gauge className="h-5 w-5 mr-2 text-orange-400" />
                    TREND VELOCITY GAUGE
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-72">
                    <TrendVelocityGauge
                      velocity={insights.trendDelta.velocity}
                      shortTerm={insights.trendDelta.shortTerm}
                      longTerm={insights.trendDelta.longTerm}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Third Row - Performance & Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Relative Performance */}
              <Card className="bg-black/60 backdrop-blur-md border border-blue-500/30 shadow-2xl">
                <CardHeader className="border-b border-blue-500/20">
                  <CardTitle className="text-lg text-white font-mono flex items-center">
                    <Award className="h-4 w-4 mr-2 text-blue-400" />
                    RELATIVE PERFORMANCE
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">Category: {insights.relativePerformance.category}</p>
                      <motion.div
                        className={`text-3xl font-bold font-mono ${getPerformanceColor(insights.relativePerformance.rankPercentile)}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {insights.relativePerformance.rankPercentile.toFixed(0)}%
                      </motion.div>
                      <p className="text-gray-400 text-xs">Percentile Rank</p>
                    </div>
                    <Progress value={insights.relativePerformance.rankPercentile} className="h-2 bg-gray-800" />
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Outperforming Signals:</p>
                      {insights.relativePerformance.outperformingSignals.map((signal, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full" />
                          <span className="text-xs text-gray-300">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Reasoning */}
              <Card className="lg:col-span-2 bg-black/60 backdrop-blur-md border border-purple-500/30 shadow-2xl">
                <CardHeader className="border-b border-purple-500/20">
                  <CardTitle className="text-xl text-white font-mono flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-400" />
                    AI REASONING & ANALYSIS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-purple-400 uppercase tracking-wider mb-3">
                        Primary Analysis
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{insights.reason}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-purple-400 uppercase tracking-wider mb-3">
                        Critical Review
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{insights.review}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-purple-400 uppercase tracking-wider mb-3">
                      Anomaly Trend Analysis
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{insights.anomalyTrend}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
