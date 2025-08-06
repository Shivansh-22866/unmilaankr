"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MomentumChartProps {
  score: number
  trend: "up" | "down" | "stable"
  label: string
  color: string
}

export function MomentumChart({ score, trend, label, color }: MomentumChartProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score)
    }, 300)
    return () => clearTimeout(timer)
  }, [score])

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const percentage = Math.min((animatedScore / 10) * 100, 100)

  return (
    <div className="relative p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {getTrendIcon()}
      </div>

      <div className="mb-3">
        <div className="text-2xl font-bold text-gray-900">{animatedScore.toFixed(2)}</div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
