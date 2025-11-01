"use client"

import { useEffect, useRef } from "react"

interface TrendVelocityGaugeProps {
  velocity: number
  shortTerm: string
  longTerm: string
}

export function TrendVelocityGauge({ velocity, shortTerm, longTerm }: TrendVelocityGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 300
    canvas.height = 200

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height - 30
      const radius = 80

      // Draw gauge arc
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.lineWidth = 8
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, Math.PI, 0)
      ctx.stroke()

      // Draw velocity indicator
      const normalizedVelocity = Math.max(-1, Math.min(1, velocity / 10)) // Normalize to -1 to 1
      const angle = Math.PI + (normalizedVelocity + 1) * (Math.PI / 2) // Map to gauge range

      // Velocity arc
      const velocityColor = velocity > 0 ? "#00ff00" : velocity < 0 ? "#ff0000" : "#ffff00"
      ctx.strokeStyle = velocityColor
      ctx.lineWidth = 6
      ctx.shadowBlur = 15
      ctx.shadowColor = velocityColor
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, Math.PI, angle)
      ctx.stroke()

      // Draw needle
      const needleLength = radius - 10
      const needleX = centerX + Math.cos(angle) * needleLength
      const needleY = centerY + Math.sin(angle) * needleLength

      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 3
      ctx.shadowBlur = 10
      ctx.shadowColor = "#ffffff"
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(needleX, needleY)
      ctx.stroke()

      // Center dot
      ctx.fillStyle = "#ffffff"
      ctx.shadowBlur = 15
      ctx.beginPath()
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2)
      ctx.fill()

      // Labels
      ctx.fillStyle = "#ffffff"
      ctx.font = "12px monospace"
      ctx.textAlign = "center"
      ctx.shadowBlur = 0
      ctx.fillText("SLOW", centerX - 60, centerY + 20)
      ctx.fillText("FAST", centerX + 60, centerY + 20)
      ctx.fillText(`${velocity.toFixed(1)}`, centerX, centerY + 35)

      // Trend indicators
      ctx.font = "10px monospace"
      ctx.fillText(`Short: ${shortTerm}`, centerX, centerY - radius - 20)
      ctx.fillText(`Long: ${longTerm}`, centerX, centerY - radius - 5)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [velocity, shortTerm, longTerm])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-lg"
      style={{ filter: "drop-shadow(0 0 15px rgba(0, 255, 255, 0.2))" }}
    />
  )
}
