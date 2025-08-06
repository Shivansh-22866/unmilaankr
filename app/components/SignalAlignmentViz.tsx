"use client"

import { useEffect, useRef } from "react"

interface SignalAlignmentVizProps {
  githubVsTwitter: string
  communityVsOnchain: string
}

export function SignalAlignmentViz({ githubVsTwitter, communityVsOnchain }: SignalAlignmentVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 400
    canvas.height = 200

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const time = Date.now() * 0.002

      // Draw GitHub vs Twitter alignment
      const githubAligned = githubVsTwitter === "aligned"
      const githubX = centerX - 80
      const twitterX = centerX + 80
      const y1 = centerY - 40

      // GitHub node
      ctx.fillStyle = githubAligned ? "#00ffff" : "#ff6b6b"
      ctx.shadowBlur = 15
      ctx.shadowColor = ctx.fillStyle
      ctx.beginPath()
      ctx.arc(githubX, y1, 8 + Math.sin(time) * 2, 0, Math.PI * 2)
      ctx.fill()

      // Twitter node
      ctx.fillStyle = githubAligned ? "#00ffff" : "#ff6b6b"
      ctx.shadowBlur = 15
      ctx.shadowColor = ctx.fillStyle
      ctx.beginPath()
      ctx.arc(twitterX, y1, 8 + Math.sin(time + 1) * 2, 0, Math.PI * 2)
      ctx.fill()

      // Connection line
      ctx.strokeStyle = githubAligned ? "#00ffff" : "#ff6b6b"
      ctx.lineWidth = githubAligned ? 3 : 1
      ctx.shadowBlur = githubAligned ? 10 : 5
      ctx.beginPath()
      ctx.moveTo(githubX, y1)
      ctx.lineTo(twitterX, y1)
      ctx.stroke()

      // Draw Community vs Onchain alignment
      const communityAligned = communityVsOnchain === "aligned"
      const communityX = centerX - 80
      const onchainX = centerX + 80
      const y2 = centerY + 40

      // Community node
      ctx.fillStyle = communityAligned ? "#8b5cf6" : "#ff6b6b"
      ctx.shadowBlur = 15
      ctx.shadowColor = ctx.fillStyle
      ctx.beginPath()
      ctx.arc(communityX, y2, 8 + Math.sin(time + 2) * 2, 0, Math.PI * 2)
      ctx.fill()

      // Onchain node
      ctx.fillStyle = communityAligned ? "#8b5cf6" : "#ff6b6b"
      ctx.shadowBlur = 15
      ctx.shadowColor = ctx.fillStyle
      ctx.beginPath()
      ctx.arc(onchainX, y2, 8 + Math.sin(time + 3) * 2, 0, Math.PI * 2)
      ctx.fill()

      // Connection line
      ctx.strokeStyle = communityAligned ? "#8b5cf6" : "#ff6b6b"
      ctx.lineWidth = communityAligned ? 3 : 1
      ctx.shadowBlur = communityAligned ? 10 : 5
      ctx.beginPath()
      ctx.moveTo(communityX, y2)
      ctx.lineTo(onchainX, y2)
      ctx.stroke()

      // Labels
      ctx.fillStyle = "#ffffff"
      ctx.font = "12px monospace"
      ctx.textAlign = "center"
      ctx.shadowBlur = 0
      ctx.fillText("GitHub", githubX, y1 - 20)
      ctx.fillText("Twitter", twitterX, y1 - 20)
      ctx.fillText("Community", communityX, y2 + 30)
      ctx.fillText("Onchain", onchainX, y2 + 30)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [githubVsTwitter, communityVsOnchain])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        style={{ filter: "drop-shadow(0 0 15px rgba(0, 255, 255, 0.2))" }}
      />
      <div className="absolute top-2 left-2 text-xs font-mono text-cyan-400">SIGNAL ALIGNMENT MATRIX</div>
    </div>
  )
}
