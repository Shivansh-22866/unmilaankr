"use client"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { PremiumTwitterMetrics } from "@/lib/data/twitter-premium"

interface TwitterMetricsVizProps {
  metrics: PremiumTwitterMetrics
}

export function TwitterMetricsViz({ metrics }: TwitterMetricsVizProps) {
  // Prepare engagement data
  const engagementData = metrics.tweets.slice(0, 10).map((tweet) => ({
    text: tweet.text.substring(0, 15) + "...",
    likes: tweet.likes,
    retweets: tweet.retweets,
    replies: tweet.replies,
    total: tweet.likes + tweet.retweets + tweet.replies,
  }))

  // Prepare metrics over time
  const timeSeriesData = metrics.postsCountByDay?.map((day) => ({
    date: day.date,
    posts: day.posts,
    replies: day.replies,
  })) || [
    { date: "Day 1", posts: 2, replies: 5 },
    { date: "Day 2", posts: 3, replies: 8 },
    { date: "Day 3", posts: 4, replies: 10 },
  ]

  return (
    <div className="w-full h-full flex flex-col space-y-8">
      {/* Engagement per Tweet */}
      <div>
        <h3 className="text-lg font-mono text-gray-300 mb-4">ENGAGEMENT BY TWEET</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={engagementData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="text"
              stroke="rgba(255,255,255,0.5)"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(6,182,212,0.3)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.7)" }}
            />
            <Legend />
            <Bar dataKey="likes" fill="#ef4444" />
            <Bar dataKey="retweets" fill="#22c55e" />
            <Bar dataKey="replies" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
