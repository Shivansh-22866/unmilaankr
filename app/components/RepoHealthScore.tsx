"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import type { GitHubMetrics } from "@/types/agent"

interface RepoHealthScoreProps {
  metrics: GitHubMetrics
}

export function RepoHealthScore({ metrics }: RepoHealthScoreProps) {
  const [healthScore, setHealthScore] = useState(0)
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    // Calculate health score based on various metrics
    const calculateHealthScore = () => {
      let score = 0

      // Stars contribution (0-25 points)
      score += Math.min(25, (metrics.stars / 1000) * 25)

      // Activity contribution (0-25 points)
      score += Math.min(25, metrics.velocity * 5)

      // Community contribution (0-25 points)
      const communityScore = (metrics.forks + metrics.contributors) / 100
      score += Math.min(25, communityScore * 25)

      // Maintenance contribution (0-25 points)
      const maintenanceScore = metrics.releases > 0 ? 15 : 0
      const issueRatio = metrics.issues > 0 ? Math.max(0, 10 - metrics.issues / 100) : 10
      score += maintenanceScore + issueRatio

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
        <p className="text-gray-400 text-lg font-mono">REPOSITORY HEALTH SCORE</p>
      </div>

      {/* Health indicators */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Popularity</span>
          <span className={getScoreColor(Math.min(25, (metrics.stars / 1000) * 25))}>
            {Math.min(25, (metrics.stars / 1000) * 25).toFixed(0)}/25
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Activity</span>
          <span className={getScoreColor(Math.min(25, metrics.velocity * 5))}>
            {Math.min(25, metrics.velocity * 5).toFixed(0)}/25
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Community</span>
          <span className={getScoreColor(Math.min(25, ((metrics.forks + metrics.contributors) / 100) * 25))}>
            {Math.min(25, ((metrics.forks + metrics.contributors) / 100) * 25).toFixed(0)}/25
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Maintenance</span>
          <span
            className={getScoreColor(
              Math.min(25, (metrics.releases > 0 ? 15 : 0) + Math.max(0, 10 - metrics.issues / 100)),
            )}
          >
            {Math.min(25, (metrics.releases > 0 ? 15 : 0) + Math.max(0, 10 - metrics.issues / 100)).toFixed(0)}/25
          </span>
        </div>
      </div>
    </div>
  )
}
