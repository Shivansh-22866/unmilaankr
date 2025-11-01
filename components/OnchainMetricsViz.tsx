"use client"

import { useEffect, useRef } from "react"
import type { OnchainMetrics } from "@/types/agent"

interface OnchainMetricsVizProps {
  metrics: OnchainMetrics
  transactionHistory: Array<{ date: string; count: number; volume: number }>
  hourlyData: Array<{ hour: number; count: number }>
}

export function OnchainMetricsViz({ metrics, transactionHistory, hourlyData }: OnchainMetricsVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 800
    canvas.height = 500

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const time = Date.now() * 0.001

      // Draw transaction volume chart
      const chartWidth = canvas.width - 100
      const chartHeight = 150
      const chartX = 50
      const chartY = 50

      // Background
      ctx.fillStyle = "rgba(16, 185, 129, 0.1)"
      ctx.fillRect(chartX, chartY, chartWidth, chartHeight)

      // Grid lines
      ctx.strokeStyle = "rgba(16, 185, 129, 0.2)"
      ctx.lineWidth = 1
      for (let i = 0; i <= 10; i++) {
        const x = chartX + (i / 10) * chartWidth
        ctx.beginPath()
        ctx.moveTo(x, chartY)
        ctx.lineTo(x, chartY + chartHeight)
        ctx.stroke()
      }

      // Transaction history bars
      if (transactionHistory.length > 0) {
        const maxVolume = Math.max(...transactionHistory.map((d) => d.volume), 1)
        const barWidth = chartWidth / transactionHistory.length

        transactionHistory.forEach((data, index) => {
          const barHeight = (data.volume / maxVolume) * chartHeight
          const x = chartX + index * barWidth
          const y = chartY + chartHeight - barHeight

          // Animated bar
          const animatedHeight = barHeight * (0.5 + 0.5 * Math.sin(time + index * 0.1))

          ctx.fillStyle = `rgba(16, 185, 129, ${0.6 + 0.4 * Math.sin(time + index * 0.05)})`
          ctx.shadowBlur = 10
          ctx.shadowColor = "#10b981"
          ctx.fillRect(x + 2, y, barWidth - 4, animatedHeight)
        })
      }

      // Draw hourly activity heatmap
      const heatmapY = 250
      const cellWidth = (canvas.width - 100) / 24
      const cellHeight = 30

      hourlyData.forEach((data, hour) => {
        const intensity = Math.min(data.count / 10, 1) // Normalize to 0-1
        const x = 50 + hour * cellWidth

        ctx.fillStyle = `rgba(139, 92, 246, ${intensity * 0.8})`
        ctx.shadowBlur = intensity * 15
        ctx.shadowColor = "#8b5cf6"
        ctx.fillRect(x, heatmapY, cellWidth - 2, cellHeight)

        // Hour label
        ctx.fillStyle = "#ffffff"
        ctx.font = "10px monospace"
        ctx.textAlign = "center"
        ctx.shadowBlur = 0
        ctx.fillText(hour.toString(), x + cellWidth / 2, heatmapY + cellHeight + 15)
      })

      // Draw metrics circles
      const metricsData = [
        { label: "Transactions", value: metrics.transactions, color: "#10b981", x: 150, y: 380 },
        { label: "Holders", value: metrics.holders, color: "#3b82f6", x: 300, y: 380 },
        { label: "Volume", value: metrics.volume, color: "#f59e0b", x: 450, y: 380 },
        { label: "Liquidity", value: metrics.liquidity, color: "#ec4899", x: 600, y: 380 },
      ]

      metricsData.forEach((metric, index) => {
        const radius = 35 + Math.sin(time + index) * 5
        const pulseRadius = radius + Math.sin(time * 2 + index) * 12

        // Outer glow
        ctx.fillStyle = metric.color
        ctx.shadowBlur = 25
        ctx.shadowColor = metric.color
        ctx.globalAlpha = 0.3
        ctx.beginPath()
        ctx.arc(metric.x, metric.y, pulseRadius, 0, Math.PI * 2)
        ctx.fill()

        // Main circle
        ctx.globalAlpha = 0.8
        ctx.beginPath()
        ctx.arc(metric.x, metric.y, radius, 0, Math.PI * 2)
        ctx.fill()

        // Text
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
        ctx.fillStyle = "#000000"
        ctx.font = "bold 12px monospace"
        ctx.textAlign = "center"

        // Format large numbers
        let displayValue = metric.value.toString()
        if (metric.value >= 1000000) {
          displayValue = (metric.value / 1000000).toFixed(1) + "M"
        } else if (metric.value >= 1000) {
          displayValue = (metric.value / 1000).toFixed(1) + "K"
        }

        ctx.fillText(displayValue, metric.x, metric.y + 4)

        ctx.fillStyle = "#ffffff"
        ctx.font = "10px monospace"
        ctx.fillText(metric.label, metric.x, metric.y + 55)
      })

      // Liquidity flow visualization
      const flowY = 320
      const flowWidth = canvas.width - 100

      for (let i = 0; i < 20; i++) {
        const x = 50 + (i / 19) * flowWidth
        const waveHeight = 10 * Math.sin(time * 2 + i * 0.3)

        ctx.fillStyle = `rgba(236, 72, 153, ${0.3 + 0.3 * Math.sin(time + i * 0.2)})`
        ctx.beginPath()
        ctx.arc(x, flowY + waveHeight, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [metrics, transactionHistory, hourlyData])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-lg border border-green-500/30"
      style={{ filter: "drop-shadow(0 0 20px rgba(16, 185, 129, 0.2))" }}
    />
  )
}
