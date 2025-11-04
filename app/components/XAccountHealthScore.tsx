"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import type { PremiumTwitterMetrics } from "@/lib/data/twitter-premium"

interface XAccountHealthScoreProps {
  metrics: PremiumTwitterMetrics
}

export function XAccountHealthScore({ metrics }: XAccountHealthScoreProps) {
  const [healthScore, setHealthScore] = useState(0)
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    // Calculate health score based on various metrics
    const calculateHealthScore = () => {
      let score = 0

      // Followers contribution (0-25 points)
      score += Math.min(25, (metrics.totalFollowersCount / 10000) * 25)

      // Activity contribution (0-25 points)
      const postsPerDay = metrics.totalPostsCount > 0 ? metrics.totalPostsCount / 30 : 0
      score += Math.min(25, Math.min(postsPerDay * 5, 25))

      // Engagement contribution (0-25 points)
      const engagementScore = metrics.engagementRate
        ? Math.min(metrics.engagementRate * 250, 25)
        : metrics.totalPostsCount > 0
          ? Math.min((metrics.totalEngagements / metrics.totalPostsCount) * 2.5, 25)
          : 0
      score += engagementScore

      // Sentiment contribution (0-25 points)
      const sentimentNormalized = Math.max(-1, Math.min(1, metrics.sentimentScore))
      score += ((sentimentNormalized + 1) / 2) * 25

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
        <p className="text-gray-400 text-lg font-mono">ACCOUNT HEALTH SCORE</p>
      </div>

      {/* Health indicators */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Growth</span>
          <span className={getScoreColor(Math.min(25, (metrics.totalFollowersCount / 10000) * 25))}>
            {Math.min(25, (metrics.totalFollowersCount / 10000) * 25).toFixed(0)}/25
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Activity</span>
          <span className={getScoreColor(Math.min(25, Math.min((metrics.totalPostsCount / 30 || 0) * 5, 25)))}>
            {Math.min(25, Math.min((metrics.totalPostsCount / 30 || 0) * 5, 25)).toFixed(0)}/25
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Engagement</span>
          <span
            className={getScoreColor(
              Math.min(
                25,
                metrics.engagementRate
                  ? Math.min(metrics.engagementRate * 250, 25)
                  : metrics.totalPostsCount > 0
                    ? Math.min((metrics.totalEngagements / metrics.totalPostsCount) * 2.5, 25)
                    : 0,
              ),
            )}
          >
            {Math.min(
              25,
              metrics.engagementRate
                ? Math.min(metrics.engagementRate * 250, 25)
                : metrics.totalPostsCount > 0
                  ? Math.min((metrics.totalEngagements / metrics.totalPostsCount) * 2.5, 25)
                  : 0,
            ).toFixed(0)}
            /25
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Sentiment</span>
          <span className={getScoreColor(((Math.max(-1, Math.min(1, metrics.sentimentScore)) + 1) / 2) * 25)}>
            {(((Math.max(-1, Math.min(1, metrics.sentimentScore)) + 1) / 2) * 25).toFixed(0)}/25
          </span>
        </div>
      </div>
    </div>
  )
}
