"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"

interface RadarData {
  metric: string
  value: number
  fullMark: 10
}

interface MomentumRadarChartProps {
  data: {
    github: number
    social: number
    onchain: number
    community: number
    overall: number
  }
}

export function MomentumRadarChart({ data }: MomentumRadarChartProps) {
  const radarData: RadarData[] = [
    { metric: "GitHub", value: data.github, fullMark: 10 },
    { metric: "Social", value: data.social, fullMark: 10 },
    { metric: "Onchain", value: data.onchain, fullMark: 10 },
    { metric: "Community", value: data.community, fullMark: 10 },
    { metric: "Overall", value: data.overall, fullMark: 10 },
  ]

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse" />
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#00ffff" strokeWidth={0.5} className="opacity-30" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "#00ffff", fontSize: 12, fontWeight: "bold" }}
            className="text-cyan-400"
          />
          <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#666", fontSize: 10 }} tickCount={6} />
          <Radar
            name="Momentum"
            dataKey="value"
            stroke="#00ffff"
            fill="url(#radarGradient)"
            fillOpacity={0.3}
            strokeWidth={2}
            dot={{ fill: "#00ffff", strokeWidth: 2, r: 4 }}
          />
          <defs>
            <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00ffff" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#ec4899" stopOpacity={0.4} />
            </linearGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
