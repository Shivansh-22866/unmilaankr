"use client"

import { useEffect, useRef } from "react"

interface DiscordMessage {
  author: string
  content: string
  timestamp: string
}

interface DiscordMessagesVizProps {
  messages: DiscordMessage[]
  messageStats: {
    totalMessages: number
    uniqueUsers: number
    averageLength: number
    topUsers: Array<{ username: string; count: number }>
  }
}

export function DiscordMessagesViz({ messages, messageStats }: DiscordMessagesVizProps) {
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

      // Draw message activity timeline
      const timelineY = 80
      const timelineWidth = canvas.width - 100
      const timelineHeight = 120

      // Background
      ctx.fillStyle = "rgba(88, 101, 242, 0.1)"
      ctx.fillRect(50, timelineY, timelineWidth, timelineHeight)

      // Grid lines
      ctx.strokeStyle = "rgba(88, 101, 242, 0.2)"
      ctx.lineWidth = 1
      for (let i = 0; i <= 10; i++) {
        const x = 50 + (i / 10) * timelineWidth
        ctx.beginPath()
        ctx.moveTo(x, timelineY)
        ctx.lineTo(x, timelineY + timelineHeight)
        ctx.stroke()
      }

      // Message activity bars (simulate hourly activity)
      const hourlyActivity = Array.from({ length: 24 }, (_, i) => {
        const hour = i
        const messagesInHour = messages.filter((msg) => {
          const msgHour = new Date(msg.timestamp).getHours()
          return msgHour === hour
        }).length
        return messagesInHour
      })

      const maxActivity = Math.max(...hourlyActivity, 1)
      const barWidth = timelineWidth / 24

      hourlyActivity.forEach((activity, hour) => {
        const barHeight = (activity / maxActivity) * timelineHeight
        const x = 50 + hour * barWidth
        const y = timelineY + timelineHeight - barHeight

        // Animated bar
        const animatedHeight = barHeight * (0.7 + 0.3 * Math.sin(time + hour * 0.1))

        ctx.fillStyle = `rgba(88, 101, 242, ${0.6 + 0.4 * Math.sin(time + hour * 0.05)})`
        ctx.shadowBlur = 10
        ctx.shadowColor = "#5865f2"
        ctx.fillRect(x + 2, y, barWidth - 4, animatedHeight)
      })

      // Draw user activity circles
      const userY = 280
      const topUsers = messageStats.topUsers.slice(0, 5)

      topUsers.forEach((user, index) => {
        const x = 100 + index * 140
        const radius = 25 + (user.count / messageStats.totalMessages) * 20
        const pulseRadius = radius + Math.sin(time * 2 + index) * 8

        // User activity circle
        const colors = ["#5865f2", "#57f287", "#fee75c", "#eb459e", "#ed4245"]
        const color = colors[index % colors.length]

        // Outer glow
        ctx.fillStyle = color
        ctx.shadowBlur = 20
        ctx.shadowColor = color
        ctx.globalAlpha = 0.4
        ctx.beginPath()
        ctx.arc(x, userY, pulseRadius, 0, Math.PI * 2)
        ctx.fill()

        // Main circle
        ctx.globalAlpha = 0.8
        ctx.beginPath()
        ctx.arc(x, userY, radius, 0, Math.PI * 2)
        ctx.fill()

        // Message count
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 12px monospace"
        ctx.textAlign = "center"
        ctx.fillText(user.count.toString(), x, userY + 4)

        // Username
        ctx.fillStyle = color
        ctx.font = "10px monospace"
        ctx.fillText(user.username.slice(0, 8), x, userY + 50)
      })

      // Draw message flow visualization
      const flowY = 380
      const flowHeight = 60

      for (let i = 0; i < 30; i++) {
        const x = 50 + (i / 29) * (canvas.width - 100)
        const waveHeight = 15 * Math.sin(time * 1.5 + i * 0.2)
        const opacity = 0.3 + 0.3 * Math.sin(time + i * 0.15)

        ctx.fillStyle = `rgba(88, 101, 242, ${opacity})`
        ctx.shadowBlur = 8
        ctx.shadowColor = "#5865f2"
        ctx.beginPath()
        ctx.arc(x, flowY + waveHeight, 4, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw community health indicator
      const healthX = canvas.width - 100
      const healthY = 350
      const healthRadius = 40

      // Health ring
      ctx.strokeStyle = "#57f287"
      ctx.lineWidth = 6
      ctx.shadowBlur = 15
      ctx.shadowColor = "#57f287"
      ctx.beginPath()
      ctx.arc(healthX, healthY, healthRadius, 0, Math.PI * 2)
      ctx.stroke()

      // Health percentage (based on activity)
      const healthPercentage = Math.min(messageStats.totalMessages / 100, 1)
      ctx.strokeStyle = "#5865f2"
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(healthX, healthY, healthRadius - 5, -Math.PI / 2, -Math.PI / 2 + healthPercentage * Math.PI * 2)
      ctx.stroke()

      // Health text
      ctx.fillStyle = "#ffffff"
      ctx.font = "12px monospace"
      ctx.textAlign = "center"
      ctx.shadowBlur = 0
      ctx.fillText("HEALTH", healthX, healthY - 5)
      ctx.fillText(`${(healthPercentage * 100).toFixed(0)}%`, healthX, healthY + 10)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [messages, messageStats])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-lg border border-purple-500/30"
      style={{ filter: "drop-shadow(0 0 20px rgba(88, 101, 242, 0.2))" }}
    />
  )
}
