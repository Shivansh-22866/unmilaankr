"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { generateDiscordInsight } from "@/lib/ai/discordInsights"
import {
  MessageSquare,
  Search,
  Users,
  Activity,
  Hash,
  Crown,
  TrendingUp,
  Clock,
  MessageCircle,
  Zap,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DiscordMessagesViz } from "@/app/components/DiscordCanvasViz"
import { CommunityHealthScore } from "@/app/components/CommunityHealthScore"
import { ParticleSystem } from "@/app/components/ParticleSystem"
import { GestureInterface } from "@/app/components/GestureInterface"

interface DiscordMessage {
  author: string
  content: string
  timestamp: string
}

interface MessageStats {
  totalMessages: number
  uniqueUsers: number
  averageLength: number
  topUsers: Array<{ username: string; count: number }>
}

interface ServerInfo {
  name: string
  memberCount: number
  channelName: string
}

export default function DiscordAnalytics() {
  const [serverId, setServerId] = useState("")
  const [channelId, setChannelId] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<DiscordMessage[]>([])
  const [messageStats, setMessageStats] = useState<MessageStats>({
    totalMessages: 0,
    uniqueUsers: 0,
    averageLength: 0,
    topUsers: [],
  })
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [insight, setInsight] = useState<null | {
  summary: string
  engagementLevel: string
  suggestions: string[]
  }>(null)

  const searchParams = useSearchParams()

  const calculateMessageStats = (msgs: DiscordMessage[]): MessageStats => {
    const userCounts = new Map<string, number>()
    let totalLength = 0

    msgs.forEach((msg) => {
      userCounts.set(msg.author, (userCounts.get(msg.author) || 0) + 1)
      totalLength += msg.content.length
    })

    const topUsers = Array.from(userCounts.entries())
      .map(([username, count]) => ({ username, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalMessages: msgs.length,
      uniqueUsers: userCounts.size,
      averageLength: msgs.length > 0 ? totalLength / msgs.length : 0,
      topUsers,
    }
  }

  const handleAnalyzeWithIds = async (server: string, channel: string) => {
    if (!server.trim() || !channel.trim()) {
      setError("Please enter valid Discord server and channel IDs")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/discord-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId: server, channelId: channel }),
      })

      const data = await response.json()

      if (data.success) {
        setMessages(data.messages || [])
        const stats = calculateMessageStats(data.messages || [])
        setMessageStats(stats)
        setServerInfo(data.serverInfo)
      } else {
        setError(data.error || "Failed to fetch Discord messages")
      }
    } catch (err) {
      console.error(err)
      setError("Failed to analyze Discord channel. Please check the IDs and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    await handleAnalyzeWithIds(serverId, channelId)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

    useEffect(() => {
    // Get server and channel IDs from search parameters
    const serverParam = searchParams.get("server")
    const channelParam = searchParams.get("channel")
    if (serverParam && channelParam) {
      setServerId(serverParam)
      setChannelId(channelParam)
      // Auto-trigger analysis when IDs are provided
      handleAnalyzeWithIds(serverParam, channelParam)
    }
  }, [searchParams])

  useEffect(() => {
  if (messageStats.totalMessages > 0) {
    generateDiscordInsight(messageStats).then(setInsight).catch(console.error)
  }
  }, [messageStats])

  return (
    <div className="min-h-screen bg-black relative overflow-hidden dark">
      {/* Particle System Background */}
      <ParticleSystem />

      {/* Dynamic Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(88,101,242,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(87,242,135,0.1),transparent_50%)]" />

      {/* Animated Grid */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(rgba(88,101,242,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(88,101,242,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"
        animate={{
          backgroundPosition: ["0px 0px", "50px 50px"],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      <GestureInterface>
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-8">
              <motion.div
                className="relative"
                animate={{
                  rotateY: [0, 360],
                }}
                transition={{
                  duration: 10,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="relative p-6 bg-gradient-to-br from-purple-500 via-blue-600 to-green-600 rounded-full">
                  <MessageSquare className="h-16 w-16 text-white" />
                </div>
              </motion.div>
            </div>

            <motion.h1
              className="text-8xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent mb-6 font-mono"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              DISCORD.AI
            </motion.h1>

            <motion.p
              className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              Advanced Community Intelligence • Real-time Discord Analytics • Engagement Insights
            </motion.p>
          </motion.div>

          {/* Search Interface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-12"
          >
            <Card className="bg-black/60 backdrop-blur-md border border-purple-500/30 shadow-2xl">
              <CardHeader className="border-b border-purple-500/20">
                <CardTitle className="text-2xl text-white font-mono flex items-center">
                  <Search className="h-6 w-6 mr-3 text-purple-400" />
                  DISCORD ANALYZER
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Server ID</label>
                    <Input
                      type="text"
                      placeholder="Enter Discord server ID"
                      value={serverId}
                      onChange={(e) => setServerId(e.target.value)}
                      className="bg-black/40 border-purple-500/30 text-white placeholder-gray-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Channel ID</label>
                    <Input
                      type="text"
                      placeholder="Enter Discord channel ID"
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      className="bg-black/40 border-purple-500/30 text-white placeholder-gray-400 font-mono"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 rounded-xl font-mono text-lg"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <Activity className="h-5 w-5 mr-2" />
                      </motion.div>
                      ANALYZING COMMUNITY...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      ANALYZE DISCORD CHANNEL
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Error Display */}
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
              <Alert className="border-red-500/50 bg-red-500/10 backdrop-blur-md">
                <Target className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300 font-mono">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Results */}
          <AnimatePresence>
            {messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="space-y-8"
              >
                {/* Server Info Header */}
                <Card className="bg-black/60 backdrop-blur-md border border-blue-500/30 shadow-2xl">
                  <CardHeader className="border-b border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <MessageSquare className="h-8 w-8 text-blue-400" />
                        <div>
                          <CardTitle className="text-3xl text-white font-mono">
                            {serverInfo ? serverInfo.name : "Discord Server"}
                          </CardTitle>
                          <p className="text-gray-400 text-lg">
                            #{serverInfo ? serverInfo.channelName : "general"} • Community Analysis Complete
                          </p>
                          <p className="text-gray-500 text-sm font-mono">
                            Server: {serverId} • Channel: {channelId}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10 px-4 py-2">
                        <Activity className="h-4 w-4 mr-2" />
                        ACTIVE
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Main Metrics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Health Score */}
                  <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 shadow-2xl">
                    <CardHeader className="border-b border-green-500/20">
                      <CardTitle className="text-xl text-white font-mono flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                        COMMUNITY HEALTH
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <CommunityHealthScore messageStats={messageStats} serverInfo={serverInfo || undefined} />
                    </CardContent>
                  </Card>

                  {/* Key Metrics */}
                  <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      {
                        icon: MessageCircle,
                        label: "Messages",
                        value: messageStats.totalMessages,
                        color: "text-purple-400",
                        bgColor: "from-purple-500/20 to-pink-500/20",
                        borderColor: "border-purple-500/30",
                      },
                      {
                        icon: Users,
                        label: "Active Users",
                        value: messageStats.uniqueUsers,
                        color: "text-blue-400",
                        bgColor: "from-blue-500/20 to-cyan-500/20",
                        borderColor: "border-blue-500/30",
                      },
                      {
                        icon: Hash,
                        label: "Avg Length",
                        value: Math.round(messageStats.averageLength),
                        color: "text-green-400",
                        bgColor: "from-green-500/20 to-emerald-500/20",
                        borderColor: "border-green-500/30",
                        suffix: " chars",
                      },
                      {
                        icon: Crown,
                        label: "Top User",
                        value: messageStats.topUsers[0]?.count || 0,
                        color: "text-yellow-400",
                        bgColor: "from-yellow-500/20 to-orange-500/20",
                        borderColor: "border-yellow-500/30",
                        suffix: " msgs",
                      },
                    ].map((metric, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.5 }}
                      >
                        <Card className={`bg-black/60 backdrop-blur-md border ${metric.borderColor} shadow-xl`}>
                          <CardContent className="p-6">
                            <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.bgColor} mb-4`}>
                              <metric.icon className={`h-6 w-6 ${metric.color}`} />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-400 uppercase tracking-wider">{metric.label}</p>
                              <div className="flex items-baseline space-x-1">
                                <span className={`text-2xl font-bold ${metric.color} font-mono`}>
                                  {formatNumber(metric.value)}
                                </span>
                                {metric.suffix && <span className="text-sm text-gray-400">{metric.suffix}</span>}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Visualization */}
                <Card className="bg-black/60 backdrop-blur-md border border-purple-500/30 shadow-2xl">
                  <CardHeader className="border-b border-purple-500/20">
                    <CardTitle className="text-xl text-white font-mono flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-purple-400" />
                      COMMUNITY ACTIVITY VISUALIZATION
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[500px]">
                      <DiscordMessagesViz messages={messages} messageStats={messageStats} />
                    </div>
                  </CardContent>
                </Card>

                {/* Top Contributors & Recent Messages */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top Contributors */}
                  <Card className="bg-black/60 backdrop-blur-md border border-yellow-500/30 shadow-2xl">
                    <CardHeader className="border-b border-yellow-500/20">
                      <CardTitle className="text-xl text-white font-mono flex items-center">
                        <Crown className="h-5 w-5 mr-2 text-yellow-400" />
                        TOP CONTRIBUTORS
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {messageStats.topUsers.slice(0, 8).map((user, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {index + 1}
                              </div>
                              <span className="text-gray-300 font-mono">{user.username}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-purple-400 font-mono">{user.count}</p>
                              <p className="text-gray-500 text-xs">
                                {((user.count / messageStats.totalMessages) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Messages */}
                  <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 shadow-2xl">
                    <CardHeader className="border-b border-green-500/20">
                      <CardTitle className="text-xl text-white font-mono flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-green-400" />
                        RECENT MESSAGES
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ScrollArea className="h-80">
                        <div className="space-y-4">
                          {messages.slice(0, 10).map((message, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.05 * index }}
                              className="p-3 bg-gray-800/30 rounded-lg border-l-4 border-purple-500/50"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-purple-400 font-mono text-sm">{message.author}</span>
                                <span className="text-gray-500 text-xs">{formatDate(message.timestamp)}</span>
                              </div>
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {message.content.length > 100 ? `${message.content.slice(0, 100)}...` : message.content}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Timeline */}
                <Card className="bg-black/60 backdrop-blur-md border border-cyan-500/30 shadow-2xl">
                  <CardHeader className="border-b border-cyan-500/20">
                    <CardTitle className="text-xl text-white font-mono flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-cyan-400" />
                      ACTIVITY INSIGHTS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-cyan-400 font-mono mb-2">
                          {messageStats.totalMessages > 0
                            ? (
                                messageStats.topUsers.reduce((sum, user) => sum + user.count, 0) /
                                messageStats.uniqueUsers
                              ).toFixed(1)
                            : "0"}
                        </div>
                        <p className="text-gray-400 text-sm">Avg Messages/User</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 font-mono mb-2">
                          {messageStats.uniqueUsers > 0
                            ? ((messageStats.uniqueUsers / (messageStats.totalMessages || 1)) * 100).toFixed(1)
                            : "0"}
                          %
                        </div>
                        <p className="text-gray-400 text-sm">User Participation</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 font-mono mb-2">
                          {messageStats.topUsers.length > 0 ? messageStats.topUsers[0].username.slice(0, 8) : "N/A"}
                        </div>
                        <p className="text-gray-400 text-sm">Most Active User</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          {insight && (
  <Card className="bg-black/60 backdrop-blur-md border border-yellow-500/30 shadow-2xl">
    <CardHeader className="border-b border-yellow-500/20">
      <CardTitle className="text-lg text-white font-mono">💡 AI COMMUNITY INSIGHTS</CardTitle>
    </CardHeader>
    <CardContent className="p-6 text-gray-300 whitespace-pre-line font-mono text-sm space-y-4">
      <div>
        <span className="text-green-400 font-bold">Summary:</span> {insight.summary}
      </div>
      <div>
        <span className="text-blue-400 font-bold">Engagement:</span> {insight.engagementLevel}
      </div>
      <div>
        <span className="text-purple-400 font-bold">Suggestions:</span>
        <ul className="list-disc list-inside text-gray-300">
          {insight.suggestions.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
)}

        </div>
      </GestureInterface>
    </div>
  )
}
