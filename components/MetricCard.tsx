"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface HolographicMetricCardProps {
  title: string
  value: number
  previousValue?: number
  suffix?: string
  icon: React.ReactNode
  color: string
  glowColor: string
}

export function HolographicMetricCard({
  title,
  value,
  previousValue,
  suffix = "",
  icon,
  color,
  glowColor,
}: HolographicMetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable")

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)

    if (previousValue !== undefined) {
      if (value > previousValue) setTrend("up")
      else if (value < previousValue) setTrend("down")
      else setTrend("stable")
    }

    return () => clearInterval(timer)
  }, [value, previousValue])

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-400" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const formatValue = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + "M"
    if (val >= 1000) return (val / 1000).toFixed(1) + "K"
    return Math.round(val).toString()
  }

  return (
    <div className="relative group">
      {/* Holographic background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20 rounded-xl blur-sm group-hover:opacity-30 transition-opacity duration-300`}
      />
      <div className={`absolute inset-0 bg-gradient-to-tr ${glowColor} opacity-10 rounded-xl animate-pulse`} />

      {/* Main card */}
      <div className="relative bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
        {/* Scanning line effect */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${color} bg-opacity-20`}>{icon}</div>
          {getTrendIcon()}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">{title}</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white font-mono">{formatValue(displayValue)}</span>
            <span className="text-sm text-gray-400">{suffix}</span>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400 opacity-50" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400 opacity-50" />
      </div>
    </div>
  )
}
