"use client"

import * as React from "react"

type RadialMeterProps = {
  value?: number // 0..1
  size?: number
  thickness?: number
  trackColor?: string
  gradientA?: string
  gradientB?: string
  label?: string
  className?: string
}

export function RadialMeter({
  value = 0.72,
  size = 96,
  thickness = 10,
  trackColor = "rgba(255,255,255,0.08)",
  gradientA = "#06b6d4", // cyan-500
  gradientB = "#a855f7", // purple-500
  label,
  className,
}: RadialMeterProps) {
  const id = React.useId()
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, value))
  const dash = circumference * clamped
  const gap = circumference - dash

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label={label}
      role={label ? "img" : "presentation"}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={gradientA} />
          <stop offset="100%" stopColor={gradientB} />
        </linearGradient>
      </defs>

      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={thickness} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${id}-grad)`}
          strokeWidth={thickness}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          fill="none"
        />
      </g>

      <g>
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="fill-white"
          style={{
            fontFamily: '"SF Mono","Monaco","Inconsolata","Roboto Mono","Courier New",monospace',
            fontSize: size * 0.22,
          }}
        >
          {(clamped * 100).toFixed(0)}%
        </text>
      </g>
    </svg>
  )
}
