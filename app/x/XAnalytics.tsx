"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Twitter,
  Search,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  TrendingUp,
  Users,
  Activity,
  Eye,
  Zap,
  Crown,
  BarChart3,
} from "lucide-react"
import { generateTwitterInsightBatched } from "@/lib/ai/xInsights"
import type { TwitterMetrics } from "@/types/agent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TwitterMetricsViz } from "../components/TwitterMetricsViz"
import { XAccountHealthScore } from "../components/XAccountHealthScore"
import { ParticleSystem } from "../components/ParticleSystem"
import { GestureInterface } from "../components/GestureInterface"
import { XPremiumLoader } from "../components/XLoader"
import type { PremiumTwitterMetrics } from "@/lib/data/twitter-premium"
import { Provider } from "ethers"
import { useAppKit, useAppKitAccount, useAppKitProvider } from "@reown/appkit/react"
import { PublicKey, Transaction, VersionedTransaction, Connection } from '@solana/web3.js';
import { createX402Client } from '@payai/x402-solana/client';
import { modal } from "@/contexts"


interface Tweet {
  text: string
  likes: number
  retweets: number
  replies: number
  timestamp: string
  author: string
}

interface Mention {
  author: string
  text: string
  timestamp: string
}

interface TwitterInsightsProps {
  tweets: Tweet[]
  mentions?: Mention[]
}

interface TwitterInsight {
  summary: string
  engagementLevel: string
  suggestions: string[]
}

function TwitterInsightsCard({ tweets, mentions }: TwitterInsightsProps) {
  const [insight, setInsight] = useState<TwitterInsight | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tweets.length > 0) {
      setLoading(true)
      generateTwitterInsightBatched({ tweets, mentions })
        .then(setInsight)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [tweets, mentions])

  if (!insight) return null

  return (
    <Card className="!bg-black/60 backdrop-blur-md border border-purple-500/30 shadow-2xl mt-8">
      <CardHeader className="border-b border-purple-500/20">
        <CardTitle className="text-lg text-white font-mono">💡 AI TWITTER INSIGHTS</CardTitle>
      </CardHeader>
      <CardContent className="p-6 text-gray-300 whitespace-pre-line font-mono text-sm space-y-4">
        {loading && <div className="text-gray-400">Generating insights...</div>}
        {!loading && (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function XAnalytics() {
  const [handle, setHandle] = useState("")
  const [loading, setLoading] = useState(false)
  const [metrics, setMetrics] = useState<PremiumTwitterMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {open} = useAppKit();
  const {address, isConnected} = useAppKitAccount()
  const {walletProvider} = useAppKitProvider<Provider>("solana")

  const searchParams = useSearchParams()

  useEffect(() => {
    const handleParam = searchParams.get("handle")
    if (handleParam) {
      setHandle(decodeURIComponent(handleParam))
      handleAnalyzeWithHandle(decodeURIComponent(handleParam))
    }
  }, [searchParams])

  const handleAnalyzeWithHandle = async (twitterHandle: string) => {
    if (!twitterHandle.trim()) {
      setError("Please enter a valid Twitter handle")
      return
    }

    if(!isConnected || !walletProvider) {
      setError("Please connect your wallet to run the analysis.")
      open()
      console.log("Please connect your wallet to run the analysis.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const provider = modal.getWalletProvider() as any;
      const address = modal.getAddress();
      const chain = modal.getChainId();

      const client = createX402Client({
          wallet: {
            publicKey: new PublicKey(address!),
            signTransaction: async (tx) => {
              const signed = await provider.signTransaction(tx);
              return signed
            }
          },
          network: 'solana',
          rpcUrl: process.env.SOLANA_RPC_URL!,
          maxPaymentAmount: BigInt(1_000_000_000_000_000), // 100,000 USDC in micro-units
      });
      const response = await client.fetch("/api/x-premium", {
        method: "POST",
        body: JSON.stringify({
          handle: twitterHandle.replace("@", ""),
          tweetLimit: 40,
          mentionLimit: 40,
          includeFollowersGrowth: true,
          includeImpressions: true,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMetrics(data.metrics)
      } else {
        setError(data.error || "Failed to fetch Twitter metrics")
      }
    } catch (err) {
      console.error(err)
      setError("Failed to analyze Twitter account. Please check the handle and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    await handleAnalyzeWithHandle(handle)
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

  if (loading) {
    return <XPremiumLoader />
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Particle System Background */}
      <ParticleSystem />

      {/* Dynamic Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(29,161,242,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,24,128,0.1),transparent_50%)]" />

      {/* Animated Grid */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(rgba(29,161,242,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(29,161,242,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"
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
        <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
          {/* Compact Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="relative p-3 bg-gradient-to-br from-blue-500 via-cyan-500 to-pink-500 rounded-lg">
                  <Twitter className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white font-mono">X ANALYTICS</h1>
                  <p className="text-sm text-gray-400">Premium social media intelligence</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search Interface - Cleaner Design */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <Card className="!bg-black/40 backdrop-blur-md border border-cyan-500/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder="Enter X handle (e.g., @username)"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                      className="!bg-black/40 border-cyan-500/30 text-white placeholder-gray-500 text-base py-6 pl-4 font-mono"
                    />
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={loading}
                    size="lg"
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 rounded-lg font-mono"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="flex items-center"
                      >
                        <Activity className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Error Display */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
              <Alert className="border-red-500/50 bg-red-500/10 backdrop-blur-md">
                <Zap className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300 font-mono text-sm">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Results Section */}
          <AnimatePresence>
            {metrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                {/* Account Header Card */}
                <Card className="!bg-black/40 backdrop-blur-md border border-cyan-500/20 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                          <Twitter className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white font-mono">@{metrics.handle}</h2>
                          <p className="text-sm text-gray-400">
                            {formatNumber(metrics.totalFollowersCount)} followers • {metrics.totalPostsCount} posts
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30">
                        <Activity className="h-3 w-3 mr-2" />
                        ACTIVE
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  {[
                    {
                      icon: Heart,
                      label: "Likes",
                      value: metrics.likesCount,
                      color: "text-red-400",
                      bgColor: "from-red-500/20",
                    },
                    {
                      icon: Repeat2,
                      label: "Retweets",
                      value: metrics.retweetsCount,
                      color: "text-green-400",
                      bgColor: "from-green-500/20",
                    },
                    {
                      icon: MessageCircle,
                      label: "Replies",
                      value: metrics.totalRepliesCount,
                      color: "text-blue-400",
                      bgColor: "from-blue-500/20",
                    },
                    {
                      icon: Eye,
                      label: "Impressions",
                      value: metrics.impressions || 0,
                      color: "text-purple-400",
                      bgColor: "from-purple-500/20",
                    },
                    {
                      icon: Users,
                      label: "Followers",
                      value: metrics.totalFollowersCount,
                      color: "text-cyan-400",
                      bgColor: "from-cyan-500/20",
                    },
                    {
                      icon: Share,
                      label: "Mentions",
                      value: metrics.mentionsCount,
                      color: "text-yellow-400",
                      bgColor: "from-yellow-500/20",
                    },
                    {
                      icon: Zap,
                      label: "Engagements",
                      value: metrics.totalEngagements,
                      color: "text-orange-400",
                      bgColor: "from-orange-500/20",
                    },
                    {
                      icon: TrendingUp,
                      label: "Eng. Rate",
                      value: metrics.engagementRate ? (metrics.engagementRate * 100).toFixed(2) : 0,
                      color: "text-pink-400",
                      bgColor: "from-pink-500/20",
                      suffix: "%",
                    },
                  ].map((metric, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <Card className="!bg-black/40 backdrop-blur-md border border-gray-700/50 hover:border-gray-600/80 transition-colors h-full">
                        <CardContent className="p-3">
                          <div className={`p-2 rounded bg-gradient-to-br ${metric.bgColor} to-transparent mb-2`}>
                            <metric.icon className={`h-4 w-4 ${metric.color}`} />
                          </div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{metric.label}</p>
                          <p className={`text-lg font-bold ${metric.color} font-mono`}>
                            {/* {formatNumber(metric.value)} */}
                            {metric.value}
                            {metric.suffix}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Two Column Layout - Health & Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Health Score */}
                  <Card className="!bg-black/40 backdrop-blur-md border border-green-500/20 shadow-xl">
                    <CardHeader className="border-b border-green-500/10 pb-4">
                      <CardTitle className="text-lg text-white font-mono flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        Account Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <XAccountHealthScore metrics={metrics} />
                    </CardContent>
                  </Card>

                  {/* Visualization - Spans 2 columns */}
                  <Card className="!bg-black/40 backdrop-blur-md border border-blue-500/20 shadow-xl lg:col-span-2 z-50">
                    <CardHeader className="border-b border-blue-500/10 pb-4">
                      <CardTitle className="text-lg text-white font-mono flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-400" />
                        Engagement Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="h-80">
                        <TwitterMetricsViz metrics={metrics} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* All Recent Posts */}
                  <Card className="!bg-black/40 backdrop-blur-md border border-yellow-500/20 shadow-xl">
                    <CardHeader className="border-b border-yellow-500/10 pb-4">
                      <CardTitle className="text-lg text-white font-mono flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-400" />
                        Recent Posts ({metrics.tweets.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ScrollArea className="h-96">
                        <div className="space-y-3 pr-4">
                          {metrics.tweets.map((tweet, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -15 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.03 * index }}
                              className="p-3 bg-gradient-to-r from-gray-800/30 to-transparent rounded-lg border border-gray-700/30 hover:border-yellow-500/30 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-2">
                                  <Heart className="h-3.5 w-3.5 text-red-400" />
                                  <span className="text-sm font-mono text-red-400">{formatNumber(tweet.likes)}</span>
                                </div>
                                <span className="text-xs text-gray-500">{formatDate(tweet.timestamp)}</span>
                              </div>
                              <p className="text-sm text-gray-300 leading-relaxed mb-2">{tweet.text}</p>
                              <div className="flex gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Repeat2 className="h-3 w-3 text-green-400" />
                                  {formatNumber(tweet.retweets)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3 text-blue-400" />
                                  {formatNumber(tweet.replies)}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Sentiment & All Mentions */}
                  <div className="space-y-6">
                    {/* Sentiment Analysis */}
                    <Card className="!bg-black/40 backdrop-blur-md border border-green-500/20 shadow-xl">
                      <CardHeader className="border-b border-green-500/10 pb-4">
                        <CardTitle className="text-lg text-white font-mono flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-400" />
                          Sentiment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="text-center mb-6">
                          <motion.div
                            className={`text-5xl font-bold mb-2 font-mono ${
                              metrics.sentimentScore > 0
                                ? "text-green-400"
                                : metrics.sentimentScore < 0
                                  ? "text-red-400"
                                  : "text-yellow-400"
                            }`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                          >
                            {metrics.sentimentScore.toFixed(2)}
                          </motion.div>
                          <Badge
                            className={`${
                              metrics.sentimentScore > 0
                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                : metrics.sentimentScore < 0
                                  ? "bg-red-500/20 text-red-300 border-red-500/30"
                                  : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                            } border text-xs`}
                          >
                            {metrics.sentimentScore > 0
                              ? "POSITIVE"
                              : metrics.sentimentScore < 0
                                ? "NEGATIVE"
                                : "NEUTRAL"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700/50">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Avg/Post</p>
                            <p className="text-sm font-mono text-cyan-400">
                              {(metrics.totalEngagements / Math.max(1, metrics.totalPostsCount)).toFixed(0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Growth</p>
                            <p className="text-sm font-mono text-cyan-400">
                              {metrics.followersGrowth ? `+${formatNumber(metrics.followersGrowth.delta)}` : "N/A"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* All Recent Mentions */}
                    {metrics.mentions && metrics.mentions.length > 0 && (
                      <Card className="!bg-black/40 backdrop-blur-md border border-purple-500/20 shadow-xl">
                        <CardHeader className="border-b border-purple-500/10 pb-4">
                          <CardTitle className="text-lg text-white font-mono flex items-center gap-2">
                            <Share className="h-4 w-4 text-purple-400" />
                            All Mentions ({metrics.mentions.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <ScrollArea className="h-56">
                            <div className="space-y-2 pr-4">
                              {metrics.mentions.map((mention, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.05 * index }}
                                  className="p-2 bg-gray-800/20 rounded border border-gray-700/30 hover:border-purple-500/30 transition-colors"
                                >
                                  <p className="text-purple-400 font-mono text-sm truncate">{mention.author}</p>
                                  <p className="text-gray-400 text-xs leading-relaxed mt-1">{mention.text}</p>
                                </motion.div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {metrics && <TwitterInsightsCard tweets={metrics.tweets} mentions={metrics.mentions} />}
          </AnimatePresence>
        </div>
      </GestureInterface>
    </div>
  )
}
