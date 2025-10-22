"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Github,
  Twitter,
  Activity,
  Users,
  AlertTriangle,
  Cpu,
  Wifi,
  Shield,
  Target,
  Layers,
  Brain,
  MessageSquare,
  Zap,
  TrendingUp,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HolographicDataCube } from "./DataCube"
import { AudioVisualizer } from "./AudiVisualizer"
import type {
  MomentumScore,
  AnomalyAlert as AlertType,
  ProjectConfig,
  TimeSeriesAllPoint,
  AIinsights,
} from "@/types/agent"
import { MomentumTimeSeries } from "./MomentumTimeSeries"
import { AIInsightsDisplay } from "./AIInsightsDisplay"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState<MomentumScore | null>(null)
  const [alerts, setAlerts] = useState<AlertType[]>([])
  const [breakDown, setBreakDown] = useState<TimeSeriesAllPoint[]>([])
  const [githubWeight, setGithubWeight] = useState(0.25)
  const [twitterWeight, setTwitterWeight] = useState(0.35)
  const [onchainWeight, setOnchainWeight] = useState(0.1)
  const [communityWeight, setCommunityWeight] = useState(0.15)
  const [previousScore, setPreviousScore] = useState<MomentumScore | null>(null)
  const [scoreDelta, setScoreDelta] = useState<number | null>(null)
  const [insights, setInsights] = useState<AIinsights>({
    summary: "",
    outlook: "neutral",
    keySignals: [],
    riskLevel: "medium",
    confidence: 0,
    reason: "",
    review: "",
    narrative: "",
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
  })
  const [aiProcessing, setAiProcessing] = useState(false)
  const [, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    name: "Lens Protocol",
    githubRepo: "",
    twitterHandle: "",
    contractAddress: "",
    tokenSymbol: "LENS",
    discord: {
      serverId: "",
      channelId: "",
    },
  })

  const totalWeight = githubWeight + twitterWeight + onchainWeight + communityWeight

  const normalizeWeights = () => {
    const total = totalWeight > 0 ? totalWeight : 1
    setGithubWeight((v) => v / total)
    setTwitterWeight((v) => v / total)
    setOnchainWeight((v) => v / total)
    setCommunityWeight((v) => v / total)
  }

  const resetWeights = () => {
    setGithubWeight(0.25)
    setTwitterWeight(0.35)
    setOnchainWeight(0.1)
    setCommunityWeight(0.15)
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 1000)
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(timeInterval)
    }
  }, [])

  const handleRunAgent = async () => {
    setLoading(true)
    setError(null)
    try {
      setAiProcessing(true)
      setPreviousScore(score)
      const normalizedWeights = {
        github: githubWeight,
        twitter: twitterWeight,
        onchain: onchainWeight,
        community: communityWeight,
      }

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: projectConfig,
          timeWindow: 48,
          updateInterval: 60,
          anomalyThreshold: 2.5,
          weights: normalizedWeights,
        }),
      })

      const json = await res.json()
      if (json.status === "ok") {
        console.log(json)
        setAiProcessing(false)
        setBreakDown(json.breakdown)
        setScore(json.score)
        setAlerts(json.alerts)
        setInsights(json.aiInput)
        if (previousScore && json.score) {
          const delta = json.score.overall - previousScore.overall
          setScoreDelta(delta)
        } else {
          setScoreDelta(null)
        }
        console.log("AI INSIGHTS", insights)
      } else {
        setError("Neural network synchronization failed.")
      }
    } catch (err) {
      console.error(err)
      setError("Quantum entanglement disrupted. Recalibrating...")
    } finally {
      setLoading(false)
      setAiProcessing(false)
    }
  }

  const handleViewGitHubAnalytics = () => {
    const encodedUrl = encodeURIComponent(projectConfig.githubRepo || "")
    router.push(`/github?url=${encodedUrl}`)
  }

  const handleViewOnchainAnalytics = () => {
    const encodedUrl = encodeURIComponent(projectConfig.contractAddress || "")
    router.push(`/onchain?address=${encodedUrl}`)
  }

  const handleDiscordAnalytics = () => {
    router.push(`/discord?server=${projectConfig.discord?.serverId}&channel=${projectConfig.discord?.channelId}`)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Futuristic Grid Background with Gradients - exactly like landing page */}
      <div className="absolute inset-0">
        {/* Radial gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-emerald-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(6,182,212,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(34,197,94,0.12),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(59,130,246,0.08),transparent_30%)]" />
        {/* New purple/violet accents */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(168,85,247,0.12),transparent_40%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-fuchsia-900/5 to-transparent" />

        {/* Main grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Subtle overlay grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px",
          }}
        />

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

        {/* Circular geometric patterns with subtle glow */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 border border-cyan-500/10 rounded-full animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-64 h-64 border border-emerald-500/10 rounded-full animate-pulse"
          style={{ animationDuration: "6s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-80 h-80 border border-fuchsia-500/10 rounded-full animate-pulse"
          style={{ animationDuration: "8s" }}
        />

        {/* Additional subtle gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-900/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/5 via-transparent to-fuchsia-900/5" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
        {/* Futuristic Header */}
        <AnimatePresence>
          {isInitialized && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center mb-20"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mb-8"
              >
                <Badge className="bg-white/10 text-white border-white/20 px-6 py-2 text-sm font-mono uppercase tracking-wider">
                  ⚡ DECENTRALIZED MOMENTUM INTELLIGENCE
                </Badge>
              </motion.div>

              <motion.h1
                className="text-7xl md:text-8xl font-light text-white mb-8 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                SIGNIQ
                <span className="block text-4xl md:text-5xl text-cyan-400 font-mono mt-4">DASHBOARD</span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                Real-time Web3 intelligence • Multi-modal signal processing • Predictive momentum analysis
              </motion.p>

              {/* Clean Status Bar */}
              <motion.div
                className="flex items-center justify-center space-x-8 text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <div className="flex items-center space-x-2 text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="font-mono">SYSTEM ONLINE</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-400">
                  <Wifi className="h-4 w-4" />
                  <span className="font-mono">CONNECTED</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <span className="font-mono">{currentTime.toLocaleTimeString()}</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-16"
        >
          <Card className="!bg-black/40 backdrop-blur-sm border border-white/10">
            <CardHeader className="border-b border-white/10 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <Target className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white font-light">{projectConfig.name}</CardTitle>
                    <p className="text-gray-400 font-mono text-sm">PROJECT CONFIGURATION</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono">
                    <Shield className="h-3 w-3 mr-1" />
                    SECURE
                  </Badge>
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-mono">
                    <Activity className="h-3 w-3 mr-1" />
                    ACTIVE
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: Github,
                    label: "GitHub Repository",
                    field: "githubRepo",
                    value: projectConfig.githubRepo,
                    placeholder: "GitHub repository URL",
                  },
                  {
                    icon: Twitter,
                    label: "Twitter Handle",
                    field: "twitterHandle",
                    value: projectConfig.twitterHandle,
                    placeholder: "Twitter username",
                  },
                  {
                    icon: Layers,
                    label: "Contract Address",
                    field: "contractAddress",
                    value: projectConfig.contractAddress,
                    placeholder: "Smart contract address",
                  },
                  {
                    icon: Cpu,
                    label: "Token Symbol",
                    field: "tokenSymbol",
                    value: projectConfig.tokenSymbol,
                    placeholder: "Token symbol",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index + 0.5, duration: 0.6 }}
                  >
                    <label className="flex items-center space-x-2 text-sm font-mono text-gray-300 uppercase tracking-wide">
                      <item.icon className="h-4 w-4 text-cyan-400" />
                      <span>{item.label}</span>
                    </label>
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) =>
                        setProjectConfig((prev) => ({
                          ...prev,
                          [item.field]: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 font-mono"
                      placeholder={item.placeholder}
                    />
                  </motion.div>
                ))}

                {/* Discord Configuration */}
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                >
                  <label className="flex items-center space-x-2 text-sm font-mono text-gray-300 uppercase tracking-wide">
                    <MessageSquare className="h-4 w-4 text-cyan-400" />
                    <span>Discord Channel</span>
                    <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20">
                      BOT REQUIRED
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Discord channel URL"
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 font-mono"
                    onChange={(e) => {
                      const input = e.target.value
                      const match = input.match(/channels\/(\d+)\/(\d+)/)
                      if (match) {
                        const [_, serverId, channelId] = match
                        setProjectConfig((prev) => ({
                          ...prev,
                          discord: { serverId, channelId },
                        }))
                      } else {
                        setProjectConfig((prev) => ({
                          ...prev,
                          discord: undefined,
                        }))
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 font-mono">
                    <a
                      href="https://discord.com/oauth2/authorize?client_id=1381346538961506524&permissions=274877987840&integration_type=0&scope=bot+applications.commands"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 underline"
                    >
                      INVITE BOT
                    </a>{" "}
                    TO YOUR DISCORD SERVER FIRST
                  </p>
                </motion.div>

                {/* Coming Soon */}
                <motion.div
                  className="space-y-3 opacity-50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.5, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                >
                  <label className="flex items-center space-x-2 text-sm font-mono text-gray-300 uppercase tracking-wide">
                    <Zap className="h-4 w-4 text-cyan-400" />
                    <span>Additional Sources</span>
                  </label>
                  <input
                    type="text"
                    value="REDDIT • MEDIUM • TELEGRAM"
                    disabled
                    className="w-full px-4 py-3 bg-black/10 border border-white/5 rounded-lg text-gray-400 cursor-not-allowed font-mono"
                  />
                  <p className="text-xs text-gray-500 font-mono">COMING SOON</p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Signal Weights - Fixed Alignment */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Card className="!bg-black/40 backdrop-blur-sm border border-white/10">
            <CardHeader className="pb-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl text-white font-light">SIGNAL WEIGHTS</CardTitle>
                  <p className="text-gray-400 font-mono text-sm">CONFIGURE DATA SOURCE IMPORTANCE</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-mono border ${
                      Math.abs(totalWeight - 1) < 0.001
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                    }`}
                    aria-live="polite"
                  >
                    TOTAL: {totalWeight.toFixed(2)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={normalizeWeights}
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent font-mono text-xs"
                  >
                    Normalize
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetWeights}
                    className="text-gray-400 hover:text-white font-mono text-xs"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    label: "GITHUB",
                    value: githubWeight,
                    setter: setGithubWeight,
                    color: "cyan",
                  },
                  {
                    label: "TWITTER",
                    value: twitterWeight,
                    setter: setTwitterWeight,
                    color: "blue",
                  },
                  {
                    label: "ONCHAIN",
                    value: onchainWeight,
                    setter: setOnchainWeight,
                    color: "emerald",
                  },
                  {
                    label: "COMMUNITY",
                    value: communityWeight,
                    setter: setCommunityWeight,
                    color: "purple",
                  },
                ].map(({ label, value, setter, color }, index) => {
                  const gradientClass =
                    color === "cyan"
                      ? "bg-gradient-to-r from-cyan-500 via-cyan-400 to-fuchsia-500/60"
                      : color === "blue"
                        ? "bg-gradient-to-r from-blue-500 via-blue-400 to-fuchsia-500/50"
                        : color === "emerald"
                          ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-fuchsia-500/50"
                          : "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400/60"

                  const thumbClass =
                    color === "cyan"
                      ? "bg-cyan-400"
                      : color === "blue"
                        ? "bg-blue-400"
                        : color === "emerald"
                          ? "bg-emerald-400"
                          : "bg-fuchsia-400"

                  return (
                    <motion.div
                      key={index}
                      className="space-y-4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index + 0.7, duration: 0.6 }}
                    >
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-mono text-gray-300 tracking-wide">{label}</label>
                        <span className="text-lg text-white font-mono bg-black/30 px-3 py-1 rounded border border-white/10">
                          {value.toFixed(2)}
                        </span>
                      </div>

                      <div className="group relative">
                        <div className="relative h-3 bg-white/10 rounded-lg overflow-hidden">
                          {/* Interactive range input */}
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={value}
                            aria-label={`${label} weight`}
                            onChange={(e) => setter(Number.parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                          />
                          {/* Progress bar */}
                          <div
                            className={`absolute top-0 left-0 h-full transition-all duration-300 rounded-lg ${gradientClass}`}
                            style={{ width: `${value * 100}%` }}
                          />
                          {/* Tick marks */}
                          <div className="pointer-events-none absolute inset-x-1 top-1/2 -translate-y-1/2">
                            <div className="flex justify-between">
                              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                                <div key={t} className="w-px h-3 bg-white/20" />
                              ))}
                            </div>
                          </div>
                          {/* Thumb */}
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm border-2 border-white shadow-lg transition-all duration-300 ${thumbClass} group-hover:scale-110 group-focus-within:ring-2 group-focus-within:ring-fuchsia-400/40`}
                            style={{ left: `calc(${value * 100}% - 8px)` }}
                          />
                        </div>

                        {/* Value tooltip */}
                        <div
                          className="pointer-events-none absolute -top-8 transition-opacity duration-200 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                          style={{ left: `calc(${value * 100}% - 18px)` }}
                        >
                          <div className="slider-tooltip relative">
                            {value.toFixed(2)}
                            <span className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white/10" />
                          </div>
                        </div>

                        {/* Min/Max labels */}
                        <div className="flex justify-between text-xs text-gray-500 mt-1 font-mono">
                          <span>0</span>
                          <span>1</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Button */}
        <motion.div
          className="flex justify-center mb-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Button
            onClick={handleRunAgent}
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-black px-12 py-6 rounded-lg font-mono text-lg tracking-wide uppercase transition-all duration-300 border border-cyan-400/20"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Brain className="h-5 w-5 mr-3" />
                </motion.div>
                PROCESSING ANALYSIS...
              </>
            ) : (
              <>
                <BarChart3 className="h-5 w-5 mr-3" />
                RUN INTELLIGENCE ANALYSIS
              </>
            )}
          </Button>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <Card className="!bg-black/40 backdrop-blur-sm border border-cyan-500/20">
                <CardContent className="p-16">
                  <div className="flex flex-col items-center justify-center space-y-8">
                    <motion.div
                      className="relative"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <div className="w-20 h-20 border-2 border-white/10 rounded-full">
                        <div className="absolute top-0 left-0 w-20 h-20 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="h-8 w-8 text-cyan-400" />
                      </div>
                    </motion.div>
                    <div className="text-center">
                      <h3 className="text-2xl font-light text-white mb-4 tracking-wide">PROCESSING SIGNALS</h3>
                      <p className="text-gray-400 font-mono text-sm">
                        ANALYZING GITHUB • TWITTER • ONCHAIN • COMMUNITY DATA
                      </p>
                    </div>
                    <AudioVisualizer />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Insights */}
        <AnimatePresence>
          {(score || aiProcessing) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <AIInsightsDisplay insights={insights} isProcessing={aiProcessing} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Dashboard */}
        <AnimatePresence>
          {score && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-12"
            >
              {/* Main Score Display */}
              <Card className="!bg-black/40 backdrop-blur-sm border border-white/10">
                <CardContent className="p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left">
                      <h2 className="text-2xl font-mono text-gray-400 mb-4 uppercase tracking-wider">FINAL SCORE</h2>
                      <div className="text-8xl font-light text-white mb-8 tracking-tight">
                        {score.overall.toFixed(1)}
                        <span className="text-2xl text-gray-400 font-mono">/100</span>
                      </div>
                      <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        <Badge
                          className={`px-4 py-2 font-mono ${
                            score.trend === "rising"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : score.trend === "falling"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                          }`}
                        >
                          TREND: {score.trend.toUpperCase()}
                        </Badge>
                        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-2 font-mono">
                          CONFIDENCE: {(score.confidence * 100).toFixed(0)}%
                        </Badge>
                        {scoreDelta !== null && (
                          <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 font-mono">
                            DELTA: {scoreDelta >= 0 ? "+" : ""}
                            {scoreDelta.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <HolographicDataCube data={score} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "GITHUB VELOCITY",
                    value: score.github,
                    icon: <Github className="h-6 w-6" />,
                    color: "cyan",
                    action: () => handleViewGitHubAnalytics(),
                    actionLabel: "VIEW ANALYTICS",
                  },
                  {
                    title: "TWITTER MENTIONS",
                    value: score.social,
                    icon: <Twitter className="h-6 w-6" />,
                    color: "blue",
                    action: null,
                    actionLabel: "COMING SOON",
                  },
                  {
                    title: "ONCHAIN GROWTH",
                    value: score.onchain,
                    icon: <Activity className="h-6 w-6" />,
                    color: "emerald",
                    action: () => handleViewOnchainAnalytics(),
                    actionLabel: "VIEW ANALYTICS",
                  },
                  {
                    title: "COMMUNITY",
                    value: score.community,
                    icon: <Users className="h-6 w-6" />,
                    color: "purple",
                    action: () => handleDiscordAnalytics(),
                    actionLabel: "VIEW ANALYTICS",
                  },
                ].map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.8 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="!bg-black/40 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`p-2 rounded ${
                              metric.color === "cyan"
                                ? "bg-cyan-500/10 text-cyan-400"
                                : metric.color === "blue"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : metric.color === "emerald"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-purple-500/10 text-purple-400"
                            }`}
                          >
                            {metric.icon}
                          </div>
                          <div className="text-2xl font-light text-white">{metric.value.toFixed(1)}</div>
                        </div>
                        <h3 className="text-sm font-mono text-gray-300 mb-4 uppercase tracking-wide">{metric.title}</h3>
                        {metric.action ? (
                          <Button
                            onClick={metric.action}
                            variant="outline"
                            size="sm"
                            className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent font-mono text-xs"
                          >
                            {metric.actionLabel}
                          </Button>
                        ) : (
                          <Button
                            disabled
                            variant="outline"
                            size="sm"
                            className="w-full border-white/10 text-gray-500 cursor-not-allowed bg-transparent font-mono text-xs"
                          >
                            {metric.actionLabel}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Time Series Chart */}
              <Card className="!bg-black/40 backdrop-blur-sm border border-white/10">
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-4">
                    <TrendingUp className="h-5 w-5 mr-3 text-cyan-400" />
                    <CardTitle className="text-xl text-white font-mono uppercase tracking-wide flex items-center">
                      HISTORICAL ANALYSIS
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <MomentumTimeSeries data={breakDown} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alerts */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-12"
            >
              <Card className="bg-red-500/5 backdrop-blur-sm border border-red-500/20">
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-4">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                    <CardTitle className="text-xl text-white font-mono uppercase tracking-wide">
                      ANOMALIES DETECTED
                    </CardTitle>
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20 font-mono">
                      {alerts.length} ALERTS
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {alerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.6 }}
                      className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                    >
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-mono text-white uppercase tracking-wide">{alert.metric}</span>
                            <Badge
                              className={`text-xs font-mono ${
                                alert.severity === "high"
                                  ? "bg-red-500/20 text-red-300 border-red-500/30"
                                  : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                              }`}
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-sm font-mono">{alert.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
