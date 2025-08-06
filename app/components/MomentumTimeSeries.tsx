"use client"

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

interface TimeSeriesData {
  timestamp: number
  github: number
  social: number
  onchain: number
  community: number
}

interface MomentumTimeSeriesProps {
  data: TimeSeriesData[]
}

interface CustomTooltipProps {
  active: boolean;
  payload: any[];
  label: number;
}


export function MomentumTimeSeries({ data }: MomentumTimeSeriesProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-cyan-500/50 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-cyan-400 text-sm font-mono">{formatTime(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg" />
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="githubGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ffff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#00ffff" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="socialGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="onchainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="communityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
          <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="#666" fontSize={10} />
          <YAxis stroke="#666" fontSize={10} />
          <Tooltip content={<CustomTooltip active={false} payload={[]} label={0} />} />
          <Area
            type="monotone"
            dataKey="github"
            stroke="#00ffff"
            fill="url(#githubGradient)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="social"
            stroke="#8b5cf6"
            fill="url(#socialGradient)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="onchain"
            stroke="#10b981"
            fill="url(#onchainGradient)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="community"
            stroke="#f59e0b"
            fill="url(#communityGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
