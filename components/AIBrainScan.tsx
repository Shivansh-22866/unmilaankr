"use client"

import { useEffect, useRef } from "react"

export function AIBrainScan({ confidence }: { confidence: number }) {
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
      const centerY = canvas.height / 2
      const time = Date.now() * 0.002

      // Draw brain outline
      ctx.strokeStyle = "#00ffff"
      ctx.lineWidth = 2
      ctx.shadowBlur = 10
      ctx.shadowColor = "#00ffff"

      // Brain shape (simplified)
      ctx.beginPath()
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const radius = 60 + Math.sin(angle * 3) * 15 + Math.sin(time + angle * 2) * 5
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius * 0.8
        if (angle === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()

      // Draw neural activity based on confidence
      const activityLevel = confidence * 10
      for (let i = 0; i < activityLevel; i++) {
        const angle = (i / activityLevel) * Math.PI * 2
        const radius = 30 + Math.sin(time + i) * 20
        const x = centerX + Math.cos(angle + time) * radius
        const y = centerY + Math.sin(angle + time) * radius * 0.8

        ctx.fillStyle = `hsl(${180 + i * 20}, 100%, ${50 + Math.sin(time + i) * 30}%)`
        ctx.shadowBlur = 15
        ctx.shadowColor = ctx.fillStyle
        ctx.beginPath()
        ctx.arc(x, y, 3 + Math.sin(time + i) * 2, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw confidence meter
      const meterWidth = 200
      const meterHeight = 10
      const meterX = (canvas.width - meterWidth) / 2
      const meterY = canvas.height - 30

      ctx.fillStyle = "rgba(0, 255, 255, 0.2)"
      ctx.fillRect(meterX, meterY, meterWidth, meterHeight)

      ctx.fillStyle = "#00ffff"
      ctx.fillRect(meterX, meterY, meterWidth * confidence, meterHeight)

      ctx.fillStyle = "#00ffff"
      ctx.font = "12px monospace"
      ctx.textAlign = "center"
      ctx.fillText(`CONFIDENCE: ${(confidence * 100).toFixed(1)}%`, centerX, meterY + 25)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [confidence])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-lg"
      style={{ filter: "drop-shadow(0 0 15px rgba(0, 255, 255, 0.3))" }}
    />
  )
}
