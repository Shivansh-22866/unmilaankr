"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import type { OnchainMetrics } from "@/types/agent"

interface TokenHealthScoreProps {
  metrics: OnchainMetrics
  tokenInfo?: {
    name: string
    symbol: string
    decimals: string
    totalSupply: string
  }
}

export function TokenHealthScore({ metrics, tokenInfo }: TokenHealthScoreProps) {
  const [healthScore, setHealthScore] = useState(0)
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    // Calculate health score based on various onchain metrics
    const calculateHealthScore = () => {
      let score = 0

      // Liquidity contribution (0-30 points)
      if (metrics.liquidity > 1000000) score += 30
      else if (metrics.liquidity > 100000) score += 25
      else if (metrics.liquidity > 10000) score += 15
      else if (metrics.liquidity > 1000) score += 10
      else score += 5

      // Activity contribution (0-25 points)
      if (metrics.transactions > 10000) score += 25
      else if (metrics.transactions > 1000) score += 20
      else if (metrics.transactions > 100) score += 15
      else if (metrics.transactions > 10) score += 10
      else score += 5

      // Holder distribution (0-25 points)
      if (metrics.holders > 10000) score += 25
      else if (metrics.holders > 1000) score += 20
      else if (metrics.holders > 100) score += 15
      else if (metrics.holders > 10) score += 10
      else score += 5

      // Volume contribution (0-20 points)
      if (metrics.volume > 1000000) score += 20
      else if (metrics.volume > 100000) score += 15
      else if (metrics.volume > 10000) score += 10
      else if (metrics.volume > 1000) score += 5
      else score += 2

      return Math.min(100, Math.max(0, score))
    }

    const newScore = calculateHealthScore()
    setHealthScore(newScore)

    // Animate score
    const duration = 2000
    const steps = 60
    const increment = newScore / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= newScore) {
        setAnimatedScore(newScore)
        clearInterval(timer)
      } else {
        setAnimatedScore(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [metrics])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-blue-400"
    if (score >= 40) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-600"
    if (score >= 60) return "from-blue-500 to-cyan-600"
    if (score >= 40) return "from-yellow-500 to-orange-600"
    return "from-red-500 to-pink-600"
  }

  return (
    <div className="relative">
      <div className="text-center">
        <motion.div
          className={`text-6xl font-bold bg-gradient-to-r ${getScoreGradient(healthScore)} bg-clip-text text-transparent mb-4 font-mono`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 1, type: "spring" }}
        >
          {animatedScore.toFixed(0)}
        </motion.div>
        <p className="text-gray-400 text-lg font-mono">TOKEN HEALTH SCORE</p>
        {tokenInfo && (
          <p className="text-gray-500 text-sm font-mono mt-2">
            {tokenInfo.name} ({tokenInfo.symbol})
          </p>
        )}
      </div>

      {/* Health indicators */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Liquidity</span>
          <span
            className={getScoreColor(
              Math.min(30, metrics.liquidity > 1000000 ? 30 : metrics.liquidity > 100000 ? 25 : 15),
            )}
          >
            {Math.min(30, metrics.liquidity > 1000000 ? 30 : metrics.liquidity > 100000 ? 25 : 15)}/30
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Activity</span>
          <span
            className={getScoreColor(
              Math.min(25, metrics.transactions > 10000 ? 25 : metrics.transactions > 1000 ? 20 : 15),
            )}
          >
            {Math.min(25, metrics.transactions > 10000 ? 25 : metrics.transactions > 1000 ? 20 : 15)}/25
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Holders</span>
          <span
            className={getScoreColor(Math.min(25, metrics.holders > 10000 ? 25 : metrics.holders > 1000 ? 20 : 15))}
          >
            {Math.min(25, metrics.holders > 10000 ? 25 : metrics.holders > 1000 ? 20 : 15)}/25
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Volume</span>
          <span
            className={getScoreColor(Math.min(20, metrics.volume > 1000000 ? 20 : metrics.volume > 100000 ? 15 : 10))}
          >
            {Math.min(20, metrics.volume > 1000000 ? 20 : metrics.volume > 100000 ? 15 : 10)}/20
          </span>
        </div>
      </div>
    </div>
  )
}
