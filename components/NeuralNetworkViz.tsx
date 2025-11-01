"use client"

import { useEffect, useRef } from "react"

interface Node {
  x: number
  y: number
  value: number
  active: boolean
  layer: number
}

interface Connection {
  from: Node
  to: Node
  weight: number
  active: boolean
}

export function NeuralNetworkViz({ isProcessing }: { isProcessing: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const connectionsRef = useRef<Connection[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 600
    canvas.height = 400

    // Initialize neural network structure
    const layers = [8, 12, 16, 12, 6, 3] // Input -> Hidden -> Output
    const nodes: Node[] = []
    const connections: Connection[] = []

    // Create nodes
    layers.forEach((layerSize, layerIndex) => {
      for (let i = 0; i < layerSize; i++) {
        nodes.push({
          x: (layerIndex / (layers.length - 1)) * (canvas.width - 100) + 50,
          y: (i / (layerSize - 1)) * (canvas.height - 100) + 50,
          value: Math.random(),
          active: false,
          layer: layerIndex,
        })
      }
    })

    // Create connections
    let nodeIndex = 0
    layers.forEach((layerSize, layerIndex) => {
      if (layerIndex < layers.length - 1) {
        const nextLayerStart = nodeIndex + layerSize
        const nextLayerSize = layers[layerIndex + 1]

        for (let i = 0; i < layerSize; i++) {
          for (let j = 0; j < nextLayerSize; j++) {
            connections.push({
              from: nodes[nodeIndex + i],
              to: nodes[nextLayerStart + j],
              weight: Math.random() * 2 - 1,
              active: false,
            })
          }
        }
      }
      nodeIndex += layerSize
    })

    nodesRef.current = nodes
    connectionsRef.current = connections

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (isProcessing) {
        // Simulate neural activity
        const time = Date.now() * 0.001
        nodes.forEach((node, index) => {
          node.active = Math.sin(time + index * 0.1) > 0.3
          node.value = Math.max(0, Math.sin(time + index * 0.1))
        })

        connections.forEach((conn) => {
          conn.active = conn.from.active && Math.random() > 0.7
        })
      }

      // Draw connections
      connections.forEach((conn) => {
        if (conn.active && isProcessing) {
          const gradient = ctx.createLinearGradient(conn.from.x, conn.from.y, conn.to.x, conn.to.y)
          gradient.addColorStop(0, "#00ffff")
          gradient.addColorStop(1, "#8b5cf6")

          ctx.strokeStyle = gradient
          ctx.lineWidth = Math.abs(conn.weight) * 2
          ctx.globalAlpha = conn.from.value * 0.8
          ctx.shadowBlur = 5
          ctx.shadowColor = "#00ffff"
        } else {
          ctx.strokeStyle = "rgba(100, 100, 100, 0.2)"
          ctx.lineWidth = 0.5
          ctx.globalAlpha = 0.3
          ctx.shadowBlur = 0
        }

        ctx.beginPath()
        ctx.moveTo(conn.from.x, conn.from.y)
        ctx.lineTo(conn.to.x, conn.to.y)
        ctx.stroke()
      })

      // Draw nodes
      nodes.forEach((node) => {
        ctx.globalAlpha = 1
        if (node.active && isProcessing) {
          ctx.fillStyle = node.layer === 0 ? "#00ffff" : node.layer === layers.length - 1 ? "#ec4899" : "#8b5cf6"
          ctx.shadowBlur = 15
          ctx.shadowColor = ctx.fillStyle
        } else {
          ctx.fillStyle = "rgba(150, 150, 150, 0.5)"
          ctx.shadowBlur = 0
        }

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.active && isProcessing ? 6 + node.value * 4 : 4, 0, Math.PI * 2)
        ctx.fill()

        // Draw activation value
        if (node.active && isProcessing) {
          ctx.fillStyle = "white"
          ctx.font = "8px monospace"
          ctx.textAlign = "center"
          ctx.fillText(node.value.toFixed(2), node.x, node.y - 15)
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isProcessing])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-[200px] border border-cyan-500/30 rounded-lg bg-black/50"
        style={{ filter: "drop-shadow(0 0 20px rgba(0, 255, 255, 0.2))" }}
      />
      <div className="absolute top-2 left-2 text-xs font-mono text-cyan-400">
        {isProcessing ? "NEURAL PROCESSING ACTIVE" : "NEURAL NETWORK IDLE"}
      </div>
    </div>
  )
}
