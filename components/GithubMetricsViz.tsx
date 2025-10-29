"use client"

import { useEffect, useRef } from "react"
import type { GitHubMetrics } from "@/types/agent"

interface GitHubMetricsVizProps {
  metrics: GitHubMetrics
  commitActivity: number[]
}

export function GitHubMetricsViz({ metrics, commitActivity }: GitHubMetricsVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 800
    canvas.height = 400

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const time = Date.now() * 0.001

      // Draw commit activity chart
      const chartWidth = canvas.width - 100
      const chartHeight = 150
      const chartX = 50
      const chartY = 50

      // Background
      ctx.fillStyle = "rgba(0, 255, 255, 0.1)"
      ctx.fillRect(chartX, chartY, chartWidth, chartHeight)

      // Grid lines
      ctx.strokeStyle = "rgba(0, 255, 255, 0.2)"
      ctx.lineWidth = 1
      for (let i = 0; i <= 10; i++) {
        const x = chartX + (i / 10) * chartWidth
        ctx.beginPath()
        ctx.moveTo(x, chartY)
        ctx.lineTo(x, chartY + chartHeight)
        ctx.stroke()
      }

      // Commit activity bars
      if (commitActivity.length > 0) {
        const maxCommits = Math.max(...commitActivity, 1)
        const barWidth = chartWidth / commitActivity.length

        commitActivity.forEach((commits, index) => {
          const barHeight = (commits / maxCommits) * chartHeight
          const x = chartX + index * barWidth
          const y = chartY + chartHeight - barHeight

          // Animated bar
          const animatedHeight = barHeight * (0.5 + 0.5 * Math.sin(time + index * 0.2))

          ctx.fillStyle = `rgba(0, 255, 255, ${0.6 + 0.4 * Math.sin(time + index * 0.1)})`
          ctx.shadowBlur = 10
          ctx.shadowColor = "#00ffff"
          ctx.fillRect(x + 2, y, barWidth - 4, animatedHeight)
        })
      }

      // Draw metrics circles
      const metricsData = [
        { label: "Stars", value: metrics.stars, color: "#ffff00", x: 150, y: 280 },
        { label: "Forks", value: metrics.forks, color: "#00ff00", x: 300, y: 280 },
        { label: "Issues", value: metrics.issues, color: "#ff6600", x: 450, y: 280 },
        { label: "PRs", value: metrics.pullRequests, color: "#ff00ff", x: 600, y: 280 },
      ]

      metricsData.forEach((metric, index) => {
        const radius = 30 + Math.sin(time + index) * 5
        const pulseRadius = radius + Math.sin(time * 2 + index) * 10

        // Outer glow
        ctx.fillStyle = metric.color
        ctx.shadowBlur = 20
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
        ctx.fillText(metric.value.toString(), metric.x, metric.y + 4)

        ctx.fillStyle = "#ffffff"
        ctx.font = "10px monospace"
        ctx.fillText(metric.label, metric.x, metric.y + 50)
      })

      // Velocity indicator
      const velocityX = canvas.width - 100
      const velocityY = 300
      const velocityRadius = 40

      ctx.strokeStyle = "#00ffff"
      ctx.lineWidth = 3
      ctx.shadowBlur = 15
      ctx.shadowColor = "#00ffff"
      ctx.beginPath()
      ctx.arc(velocityX, velocityY, velocityRadius, 0, Math.PI * 2)
      ctx.stroke()

      // Velocity needle
      const velocityAngle = (metrics.velocity / 10) * Math.PI * 2 - Math.PI / 2
      const needleLength = velocityRadius - 5
      const needleX = velocityX + Math.cos(velocityAngle) * needleLength
      const needleY = velocityY + Math.sin(velocityAngle) * needleLength

      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(velocityX, velocityY)
      ctx.lineTo(needleX, needleY)
      ctx.stroke()

      ctx.fillStyle = "#ffffff"
      ctx.font = "10px monospace"
      ctx.textAlign = "center"
      ctx.shadowBlur = 0
      ctx.fillText("Velocity", velocityX, velocityY + velocityRadius + 20)
      ctx.fillText(metrics.velocity.toFixed(2), velocityX, velocityY + velocityRadius + 35)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [metrics, commitActivity])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-lg border border-cyan-500/30"
      style={{ filter: "drop-shadow(0 0 20px rgba(0, 255, 255, 0.2))" }}
    />
  )
}
