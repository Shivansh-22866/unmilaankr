"use client"

import { useEffect, useRef } from "react"

interface DataCubeProps {
  data: {
    github: number
    social: number
    onchain: number
    community: number
  }
}

export function HolographicDataCube({ data }: DataCubeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const rotationRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 400
    canvas.height = 400

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const size = 80

    const drawCube = (rotX: number, rotY: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const vertices = [
        [-size, -size, -size],
        [size, -size, -size],
        [size, size, -size],
        [-size, size, -size],
        [-size, -size, size],
        [size, -size, size],
        [size, size, size],
        [-size, size, size],
      ]

      const rotatedVertices = vertices.map(([x, y, z]) => {
        const y1 = y * Math.cos(rotX) - z * Math.sin(rotX)
        const z1 = y * Math.sin(rotX) + z * Math.cos(rotX)
        const x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY)
        const z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY)
        return [x2, y1, z2]
      })

      const projectedVertices = rotatedVertices.map(([x, y]) => [centerX + x, centerY + y])

      const edges = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ]

      ctx.strokeStyle = "#00ffff"
      ctx.lineWidth = 2
      ctx.shadowBlur = 10
      ctx.shadowColor = "#00ffff"

      edges.forEach(([start, end]) => {
        const [x1, y1] = projectedVertices[start]
        const [x2, y2] = projectedVertices[end]

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      })

      const dataValues = [data.github, data.social, data.onchain, data.community]
      const colors = ["#00ffff", "#8b5cf6", "#10b981", "#f59e0b"]
      const labels = ["GitHub", "Social", "Onchain", "Community"]

      dataValues.forEach((value, index) => {
        const angle = (index / dataValues.length) * Math.PI * 2
        const barHeight = (value / 10) * size * 0.4
        const x = centerX + Math.cos(angle) * 60
        const y = centerY + Math.sin(angle) * 30

        ctx.fillStyle = colors[index]
        ctx.shadowBlur = 15
        ctx.shadowColor = colors[index]
        ctx.fillRect(x - 5, y - barHeight / 2, 10, barHeight)

        ctx.fillStyle = colors[index]
        ctx.font = "12px monospace"
        ctx.textAlign = "center"
        ctx.fillText(labels[index], x, y + barHeight / 2 + 20)
        ctx.fillText(value.toFixed(1), x, y + barHeight / 2 + 35)
      })
    }

    const animate = () => {
      // Update rotationRef directly
      rotationRef.current.x += 0.01
      rotationRef.current.y += 0.015

      const { x, y } = rotationRef.current
      drawCube(x, y)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [data]) // ✅ No rotation in deps
  

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 20px rgba(0, 255, 255, 0.3))" }}
      />
    </div>
  )
}
