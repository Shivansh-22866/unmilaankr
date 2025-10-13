"use client"

import { motion } from "framer-motion"
import { Brain, TrendingUp, TrendingDown, Zap, AlertTriangle, CheckCircle2, GitMerge } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { AIinsights } from "@/types/agent"
import { RadialMeter } from "./RadialMeter"
import { MicroSparkline } from "./MicroSparkle"

interface AIInsightsDisplayProps {
  insights: AIinsights
  isProcessing: boolean
}

function outlookIcon(outlook: AIinsights["outlook"]) {
  switch (outlook) {
    case "bullish":
      return <TrendingUp className="h-4 w-4 text-emerald-400" aria-hidden="true" />
    case "bearish":
      return <TrendingDown className="h-4 w-4 text-rose-400" aria-hidden="true" />
    default:
      return <Zap className="h-4 w-4 text-amber-400" aria-hidden="true" />
  }
}

function outlookGradient(outlook: AIinsights["outlook"]) {
  switch (outlook) {
    case "bullish":
      return "from-emerald-400 to-cyan-400"
    case "bearish":
      return "from-rose-400 to-purple-400"
    default:
      return "from-amber-400 to-fuchsia-400"
  }
}

function riskStyles(risk: AIinsights["riskLevel"]) {
  switch (risk) {
    case "low":
      return "!text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
    case "medium":
      return "!text-amber-400 border-amber-500/40 bg-amber-500/10"
    case "high":
      return "!text-rose-400 border-rose-500/40 bg-rose-500/10"
    default:
      return "!text-slate-300 border-slate-500/40 bg-slate-500/10"
  }
}

export function AIInsightsDisplay({ insights, isProcessing }: AIInsightsDisplayProps) {
  // Build a small synthetic sparkline from velocity for visual context (no canvas).
  const velocity = Math.max(0, Math.min(1, Math.abs(insights.trendDelta.velocity || 0)))
  const n = 20
  const spark = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    // base trend + slight curvature influenced by velocity
    return 0.3 + 0.6 * t ** (0.5 + velocity) + 0.04 * Math.sin(t * Math.PI * (2 + velocity * 4))
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg border border-white/10 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10">
            <Brain className="h-4 w-4 text-cyan-300" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white">AI Insights</h2>
            <p className="text-xs text-slate-400">Concise, executive-ready signal synthesis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isProcessing ? (
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-20" />
                <span className="relative inline-flex size-2 rounded-full bg-cyan-400" />
              </span>
              Processing…
            </div>
          ) : (
            <Badge variant="outline" className="text-xs text-slate-300 border-white/15">
              Up to date
            </Badge>
          )}
        </div>
      </div>

      {/* Top stats strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="!bg-black/50 backdrop-blur-md border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Confidence</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <RadialMeter
              value={insights.confidence}
              size={90}
              thickness={10}
              gradientA="#06b6d4"
              gradientB="#a855f7"
              label="AI confidence"
            />
            <div className="ml-4 space-y-2">
              <div className="text-xs text-slate-400">Model certainty</div>
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                {(insights.confidence * 100).toFixed(1)}%
              </div>
              <Progress value={insights.confidence * 100} className="h-1.5 bg-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="!bg-black/50 backdrop-blur-md border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Outlook</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {outlookIcon(insights.outlook)}
              <div
                className={`text-lg font-semibold bg-gradient-to-r ${outlookGradient(
                  insights.outlook,
                )} bg-clip-text text-transparent`}
              >
                {insights.outlook.toUpperCase()}
              </div>
            </div>
            <div className="text-xs text-right text-slate-400">
              <div>Short: {insights.trendDelta.shortTerm}</div>
              <div>Long: {insights.trendDelta.longTerm}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="!bg-black/50 backdrop-blur-md border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Risk</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Badge variant="outline" className={`${riskStyles(insights.riskLevel)} text-xs`}>
              <AlertTriangle className="mr-1 h-3 w-3" aria-hidden="true" />
              {insights.riskLevel.toUpperCase()}
            </Badge>
            <div className="w-40">
              <Progress
                value={insights.riskLevel === "low" ? 25 : insights.riskLevel === "medium" ? 60 : 85}
                className="h-1.5 bg-slate-500"
              />
              <div className="mt-1 text-[10px] text-right text-slate-400">Relative Risk</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary / Narrative */}
      <Card className="!bg-black/50 backdrop-blur-md border-white/10">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-sm font-medium text-slate-300">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <motion.p
            className="text-slate-200/90 leading-relaxed"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {insights.summary}
          </motion.p>
        </CardContent>
      </Card>

      {/* Key signals and micro trend */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 !bg-black/50 backdrop-blur-md border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Key Signals</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {insights.keySignals.map((signal, i) => (
                <div key={i} className="flex items-start gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <span className="mt-1 size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <span className="text-sm text-slate-200">{signal}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="!bg-black/50 backdrop-blur-md border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Trend Velocity</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <MicroSparkline
              data={spark}
              width={220}
              height={56}
              strokeColorA="#06b6d4"
              strokeColorB="#a855f7"
              label="Trend velocity sparkline"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Velocity</span>
              <span className="text-slate-300">{(Math.abs(insights.trendDelta.velocity) * 100).toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alignment and reasoning */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="!bg-black/50 backdrop-blur-md border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Signal Alignment</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 space-y-3">
            <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-slate-200">
                <GitMerge className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                GitHub ↔ Twitter
              </div>
              <Badge
                variant={insights.signalAlignment.githubVsTwitter === "aligned" ? "default" : "destructive"}
                className="text-xs"
              >
                {insights.signalAlignment.githubVsTwitter.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-slate-200">
                <GitMerge className="h-4 w-4 text-fuchsia-300" aria-hidden="true" />
                Community ↔ Onchain
              </div>
              <Badge
                variant={insights.signalAlignment.communityVsOnchain === "aligned" ? "default" : "destructive"}
                className="text-xs"
              >
                {insights.signalAlignment.communityVsOnchain.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 !bg-black/50 backdrop-blur-md border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Reasoning</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-4">
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-fuchsia-300">Primary Analysis</h4>
              <p className="text-sm text-slate-200/90">{insights.reason}</p>
            </div>
            <div className="border-t border-white/10 pt-3">
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">Critical Review</h4>
              <p className="text-sm text-slate-200/90">{insights.review}</p>
            </div>
            <div className="border-t border-white/10 pt-3">
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-300">Anomaly Trend</h4>
              <p className="text-sm text-slate-200/90">{insights.anomalyTrend}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
