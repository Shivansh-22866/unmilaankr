"use client"

import * as React from "react"

type MicroSparklineProps = {
  data?: number[]
  width?: number
  height?: number
  strokeColorA?: string
  strokeColorB?: string
  fillOpacity?: number
  className?: string
  label?: string
}

export function MicroSparkline({
  data = [0.2, 0.3, 0.25, 0.35, 0.32, 0.45, 0.4, 0.55, 0.52, 0.6, 0.58, 0.7],
  width = 140,
  height = 40,
  strokeColorA = "#06b6d4", // cyan-500
  strokeColorB = "#a855f7", // purple-500
  fillOpacity = 0.12,
  className,
  label,
}: MicroSparklineProps) {
  const id = React.useId()

  const paddingX = 4
  const paddingY = 4
  const innerW = width - paddingX * 2
  const innerH = height - paddingY * 2

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * innerW + paddingX
    const y = height - paddingY - ((d - min) / range) * innerH
    return [x, y] as const
  })

  const pathD = points.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`)).join(" ")

  const areaD =
    `M ${points[0][0]},${height - paddingY} ` +
    points.map(([x, y]) => `L ${x},${y}`).join(" ") +
    ` L ${points[points.length - 1][0]},${height - paddingY} Z`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-label={label}
      role={label ? "img" : "presentation"}
    >
      <defs>
        <linearGradient id={`${id}-stroke`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={strokeColorA} />
          <stop offset="100%" stopColor={strokeColorB} />
        </linearGradient>
        <linearGradient id={`${id}-fill`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={strokeColorA} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={strokeColorB} stopOpacity={fillOpacity} />
        </linearGradient>
      </defs>

      {/* baseline */}
      <line
        x1={paddingX}
        x2={width - paddingX}
        y1={height - paddingY}
        y2={height - paddingY}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1}
      />

      {/* subtle grid ticks */}
      {Array.from({ length: 3 }).map((_, i) => {
        const y = paddingY + (i + 1) * (innerH / 4)
        return (
          <line
            key={i}
            x1={paddingX}
            x2={width - paddingX}
            y1={y}
            y2={y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        )
      })}

      {/* area */}
      <path d={areaD} fill={`url(#${id}-fill)`} />

      {/* line */}
      <path
        d={pathD}
        fill="none"
        stroke={`url(#${id}-stroke)`}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* end dot */}
      {points.length > 0 ? (
        <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r={2.5} fill={strokeColorB} />
      ) : null}
    </svg>
  )
}
