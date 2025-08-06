"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface CommunityHealthScoreProps {
  messageStats: {
    totalMessages: number
    uniqueUsers: number
    averageLength: number
    topUsers: Array<{ username: string; count: number }>
  }
  serverInfo?: {
    name: string
    memberCount: number
    channelName: string
  }
}

export function CommunityHealthScore({ messageStats, serverInfo }: CommunityHealthScoreProps) {
  const [healthScore, setHealthScore] = useState(0)
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    // Calculate community health score based on various metrics
    const calculateHealthScore = () => {
      let score = 0

      // Activity level (0-30 points)
      if (messageStats.totalMessages > 1000) score += 30
      else if (messageStats.totalMessages > 500) score += 25
      else if (messageStats.totalMessages > 100) score += 20
      else if (messageStats.totalMessages > 50) score += 15
      else if (messageStats.totalMessages > 10) score += 10
      else score += 5

      // User diversity (0-25 points)
      if (messageStats.uniqueUsers > 100) score += 25
      else if (messageStats.uniqueUsers > 50) score += 20
      else if (messageStats.uniqueUsers > 20) score += 15
      else if (messageStats.uniqueUsers > 10) score += 10
      else if (messageStats.uniqueUsers > 5) score += 5
      else score += 2

      // Engagement quality (0-25 points)
      if (messageStats.averageLength > 100) score += 25
      else if (messageStats.averageLength > 50) score += 20
      else if (messageStats.averageLength > 30) score += 15
      else if (messageStats.averageLength > 20) score += 10
      else score += 5

      // Distribution balance (0-20 points)
      if (messageStats.topUsers.length > 0) {
        const topUserPercentage = messageStats.topUsers[0].count / messageStats.totalMessages
        if (topUserPercentage < 0.3)
          score += 20 // Good distribution
        else if (topUserPercentage < 0.5) score += 15
        else if (topUserPercentage < 0.7) score += 10
        else score += 5 // Poor distribution (dominated by few users)
      }

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
  }, [messageStats])

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
        <p className="text-gray-400 text-lg font-mono">COMMUNITY HEALTH SCORE</p>
        {serverInfo && (
          <div className="mt-2">
            <p className="text-gray-500 text-sm font-mono">{serverInfo.name}</p>
            <p className="text-gray-600 text-xs font-mono">#{serverInfo.channelName}</p>
          </div>
        )}
      </div>

      {/* Health indicators */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Activity</span>
          <span
            className={getScoreColor(
              Math.min(30, messageStats.totalMessages > 1000 ? 30 : messageStats.totalMessages > 500 ? 25 : 20),
            )}
          >
            {Math.min(30, messageStats.totalMessages > 1000 ? 30 : messageStats.totalMessages > 500 ? 25 : 20)}/30
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Diversity</span>
          <span
            className={getScoreColor(
              Math.min(25, messageStats.uniqueUsers > 100 ? 25 : messageStats.uniqueUsers > 50 ? 20 : 15),
            )}
          >
            {Math.min(25, messageStats.uniqueUsers > 100 ? 25 : messageStats.uniqueUsers > 50 ? 20 : 15)}/25
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Engagement</span>
          <span
            className={getScoreColor(
              Math.min(25, messageStats.averageLength > 100 ? 25 : messageStats.averageLength > 50 ? 20 : 15),
            )}
          >
            {Math.min(25, messageStats.averageLength > 100 ? 25 : messageStats.averageLength > 50 ? 20 : 15)}/25
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Balance</span>
          <span className={getScoreColor(20)}>
            {messageStats.topUsers.length > 0
              ? messageStats.topUsers[0].count / messageStats.totalMessages < 0.3
                ? "20"
                : "15"
              : "10"}
            /20
          </span>
        </div>
      </div>
    </div>
  )
}
