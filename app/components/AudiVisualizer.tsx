"use client"

import { useEffect, useRef, useState } from "react"

export function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 800
    canvas.height = 200

    // Simulate audio data
    const generateAudioData = () => {
      return Array.from({ length: 64 }, () => Math.random() * 255)
    }

    const animate = () => {
      const audioData = generateAudioData()

      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = canvas.width / audioData.length

      audioData.forEach((value, index) => {
        const barHeight = (value / 255) * canvas.height * 0.8
        const x = index * barWidth
        const y = canvas.height - barHeight

        // Create gradient
        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height)
        gradient.addColorStop(0, "#00ffff")
        gradient.addColorStop(0.5, "#8b5cf6")
        gradient.addColorStop(1, "#ec4899")

        ctx.fillStyle = gradient
        ctx.shadowBlur = 10
        ctx.shadowColor = "#00ffff"
        ctx.fillRect(x, y, barWidth - 2, barHeight)

        // Add glow effect
        ctx.fillStyle = `rgba(0, 255, 255, ${(value / 255) * 0.3})`
        ctx.fillRect(x - 2, y - 5, barWidth + 4, barHeight + 10)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    if (isActive) {
      animate()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive])

  return (
    <div className="relative">
      <button
        onClick={() => setIsActive(!isActive)}
        className="mb-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-mono text-sm hover:from-cyan-600 hover:to-purple-600 transition-all"
      >
        {isActive ? "DISABLE AUDIO VIZ" : "ENABLE AUDIO VIZ"}
      </button>
      <canvas
        ref={canvasRef}
        className="w-full h-32 rounded-lg border border-cyan-500/30"
        style={{ background: "rgba(0, 0, 0, 0.5)" }}
      />
    </div>
  )
}
