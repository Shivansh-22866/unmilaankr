"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Coins,
  Search,
  TrendingUp,
  Users,
  Activity,
  Droplets,
  BarChart3,
  Wallet,
  ArrowUpDown,
  DollarSign,
  Target,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OnchainMetricsViz } from "@/app/components/OnchainMetricsViz"
import { TokenHealthScore } from "@/app/components/TokenHealthScore"
import { ParticleSystem } from "@/app/components/ParticleSystem"
import { GestureInterface } from "@/app/components/GestureInterface"
import type { OnchainMetrics } from "@/types/agent"
import { generateOnchainInsight } from '@/lib/ai/onchainInsights'


interface TokenInfo {
  name: string
  symbol: string
  decimals: string
  totalSupply: string
}

interface DEXMetrics {
  pairs: Array<{
    dex: string
    pair: string
    liquidity: number
    volume24h: number
    price: number
  }>
  totalLiquidity: number
  totalVolume24h: number
}

export default function OnchainAnalytics() {
  const [contractAddress, setContractAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [metrics, setMetrics] = useState<OnchainMetrics | null>(null)
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [transactionHistory, setTransactionHistory] = useState<Array<{ date: string; count: number; volume: number }>>(
    [],
  )
  const [hourlyData, setHourlyData] = useState<Array<{ hour: number; count: number }>>([])
  const [dexMetrics, setDexMetrics] = useState<DEXMetrics | null>(null)
  const [topHolders, setTopHolders] = useState<Array<{ address: string; balance: string; percentage: number }>>([])
  const [error, setError] = useState<string | null>(null)
  const [insight, setInsight] = useState<Awaited<ReturnType<typeof generateOnchainInsight>> | null>(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    // Get the contract address from search parameters
    const addressParam = searchParams.get("address")
    if (addressParam) {
      setContractAddress(addressParam)
      // Auto-trigger analysis when address is provided
      handleAnalyzeWithAddress(addressParam)
    }
  }, [searchParams])

  const handleAnalyzeWithAddress = async (address: string) => {
    if (!address.trim()) {
      setError("Please enter a valid Ethereum contract address")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/onchain-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractAddress: address }),
      })

      const data = await response.json()

      if (data.success) {
        setMetrics(data.metrics)
        setTokenInfo(data.tokenInfo)
        setTransactionHistory(data.transactionHistory?.daily || [])
        setHourlyData(data.transactionHistory?.hourly || [])
        setDexMetrics(data.dexMetrics)
        setTopHolders(data.topHolders || [])
        const aiInsight = await generateOnchainInsight(data.metrics)
        setInsight(aiInsight)

      } else {
        setError(data.error || "Failed to fetch onchain metrics")
      }
    } catch (err) {
      console.error(err)
      setError("Failed to analyze contract. Please check the address and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    await handleAnalyzeWithAddress(contractAddress)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + "B"
    if (num >= 1000000) return (num / 1000000).toFixed(2) + "M"
    if (num >= 1000) return (num / 1000).toFixed(2) + "K"
    return num.toFixed(2)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden dark">
      {/* Particle System Background */}
      <ParticleSystem />

      {/* Dynamic Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]" />

      {/* Animated Grid */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"
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
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="relative p-6 bg-gradient-to-br from-green-500 via-blue-600 to-purple-600 rounded-full">
                  <Coins className="h-16 w-16 text-white" />
                </div>
              </motion.div>
            </div>

            <motion.h1
              className="text-8xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 font-mono"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              ONCHAIN.AI
            </motion.h1>

            <motion.p
              className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              Advanced Blockchain Intelligence • Real-time Token Analytics • DeFi Insights
            </motion.p>
          </motion.div>

          {/* Search Interface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-12"
          >
            <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 shadow-2xl">
              <CardHeader className="border-b border-green-500/20">
                <CardTitle className="text-2xl text-white font-mono flex items-center">
                  <Search className="h-6 w-6 mr-3 text-green-400" />
                  CONTRACT ANALYZER
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter Ethereum contract address (e.g., 0x...)"
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      className="bg-black/40 border-green-500/30 text-white placeholder-gray-400 text-lg py-6 font-mono"
                      onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                    />
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={loading}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-6 rounded-xl font-mono text-lg"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Activity className="h-5 w-5 mr-2" />
                        </motion.div>
                        ANALYZING...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        ANALYZE
                      </>
                    )}
                  </Button>
                </div>
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
            {metrics && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="space-y-8"
              >
                {/* Token Info Header */}
                <Card className="bg-black/60 backdrop-blur-md border border-blue-500/30 shadow-2xl">
                  <CardHeader className="border-b border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Coins className="h-8 w-8 text-blue-400" />
                        <div>
                          <CardTitle className="text-3xl text-white font-mono">
                            {tokenInfo ? `${tokenInfo.name} (${tokenInfo.symbol})` : formatAddress(contractAddress)}
                          </CardTitle>
                          <p className="text-gray-400 text-lg">Onchain Analysis Complete</p>
                          <p className="text-gray-500 text-sm font-mono">{contractAddress}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10 px-4 py-2">
                        <Activity className="h-4 w-4 mr-2" />
                        LIVE
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
                        TOKEN HEALTH
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <TokenHealthScore metrics={metrics} tokenInfo={tokenInfo || undefined} />
                    </CardContent>
                  </Card>

                  {/* Key Metrics */}
                  <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      {
                        icon: ArrowUpDown,
                        label: "Transactions",
                        value: metrics.transactions,
                        color: "text-green-400",
                        bgColor: "from-green-500/20 to-emerald-500/20",
                        borderColor: "border-green-500/30",
                      },
                      {
                        icon: Users,
                        label: "Holders",
                        value: metrics.holders,
                        color: "text-blue-400",
                        bgColor: "from-blue-500/20 to-cyan-500/20",
                        borderColor: "border-blue-500/30",
                      },
                      {
                        icon: BarChart3,
                        label: "Volume",
                        value: metrics.volume,
                        color: "text-yellow-400",
                        bgColor: "from-yellow-500/20 to-orange-500/20",
                        borderColor: "border-yellow-500/30",
                        prefix: "$",
                      },
                      {
                        icon: Droplets,
                        label: "Liquidity",
                        value: metrics.liquidity,
                        color: "text-purple-400",
                        bgColor: "from-purple-500/20 to-pink-500/20",
                        borderColor: "border-purple-500/30",
                        prefix: "$",
                      },
                      {
                        icon: Wallet,
                        label: "Unique Addresses",
                        value: metrics.uniqueAddresses,
                        color: "text-cyan-400",
                        bgColor: "from-cyan-500/20 to-blue-500/20",
                        borderColor: "border-cyan-500/30",
                      },
                      {
                        icon: Zap,
                        label: "Transfers",
                        value: metrics.transferCount,
                        color: "text-orange-400",
                        bgColor: "from-orange-500/20 to-red-500/20",
                        borderColor: "border-orange-500/30",
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
                                {metric.prefix && <span className="text-sm text-gray-400">{metric.prefix}</span>}
                                <span className={`text-2xl font-bold ${metric.color} font-mono`}>
                                  {formatNumber(metric.value)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Visualization */}
                <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 shadow-2xl">
                  <CardHeader className="border-b border-green-500/20">
                    <CardTitle className="text-xl text-white font-mono flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-green-400" />
                      ONCHAIN ANALYTICS VISUALIZATION
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[500px]">
                      <OnchainMetricsViz
                        metrics={metrics}
                        transactionHistory={transactionHistory}
                        hourlyData={hourlyData}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* DEX Metrics & Top Holders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* DEX Metrics */}
                  {dexMetrics && (
                    <Card className="bg-black/60 backdrop-blur-md border border-purple-500/30 shadow-2xl">
                      <CardHeader className="border-b border-purple-500/20">
                        <CardTitle className="text-xl text-white font-mono flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-purple-400" />
                          DEX METRICS
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Liquidity</span>
                            <span className="text-purple-400 font-mono">
                              ${formatNumber(dexMetrics.totalLiquidity)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">24h Volume</span>
                            <span className="text-green-400 font-mono">${formatNumber(dexMetrics.totalVolume24h)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Active Pairs</span>
                            <span className="text-blue-400 font-mono">{dexMetrics.pairs.length}</span>
                          </div>
                          {dexMetrics.pairs.length > 0 && (
                            <div className="pt-4 border-t border-gray-700">
                              <p className="text-sm text-gray-400 mb-2">Top Pair:</p>
                              <p className="text-white font-mono text-sm">{dexMetrics.pairs[0].dex}</p>
                              <p className="text-gray-400 text-xs">
                                ${formatNumber(dexMetrics.pairs[0].price)} per token
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Top Holders */}
                  <Card className="bg-black/60 backdrop-blur-md border border-cyan-500/30 shadow-2xl">
                    <CardHeader className="border-b border-cyan-500/20">
                      <CardTitle className="text-xl text-white font-mono flex items-center">
                        <Users className="h-5 w-5 mr-2 text-cyan-400" />
                        TOP HOLDERS
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {topHolders.slice(0, 5).map((holder, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {index + 1}
                              </div>
                              <span className="text-gray-300 font-mono text-sm">{formatAddress(holder.address)}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-cyan-400 font-mono text-sm">
                                {formatNumber(Number.parseFloat(holder.balance))}
                              </p>
                              <p className="text-gray-500 text-xs">{holder.percentage.toFixed(2)}%</p>
                            </div>
                          </div>
                        ))}
                        {topHolders.length === 0 && (
                          <p className="text-gray-500 text-center py-4">No holder data available</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Token Information */}
                {tokenInfo && (
                  <Card className="bg-black/60 backdrop-blur-md border border-yellow-500/30 shadow-2xl">
                    <CardHeader className="border-b border-yellow-500/20">
                      <CardTitle className="text-xl text-white font-mono flex items-center">
                        <Coins className="h-5 w-5 mr-2 text-yellow-400" />
                        TOKEN INFORMATION
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Name</p>
                          <p className="text-white font-mono">{tokenInfo.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Symbol</p>
                          <p className="text-white font-mono">{tokenInfo.symbol}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Decimals</p>
                          <p className="text-white font-mono">{tokenInfo.decimals}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Supply</p>
                          <p className="text-white font-mono">
                            {formatNumber(Number.parseFloat(tokenInfo.totalSupply))}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            {insight && (
  <Card className="bg-black/60 backdrop-blur-md border border-yellow-500/30 shadow-2xl mt-8">
    <CardHeader className="border-b border-yellow-500/20">
      <CardTitle className="text-xl text-white font-mono">💡 AI INSIGHTS</CardTitle>
    </CardHeader>
    <CardContent className="p-6 text-gray-300 font-mono space-y-4 text-sm">
      <p><strong>📌 Summary:</strong> {insight.summary}</p>
      <p><strong>📈 Outlook:</strong> <span className="text-green-400">{insight.outlook}</span></p>
      <p><strong>⚠️ Risk Level:</strong> <span className="text-red-400">{insight.riskLevel}</span></p>
      <p><strong>💬 Reason:</strong> {insight.reason}</p>
      <div>
        <p className="font-bold mb-1">🔍 Key Signals:</p>
        <ul className="list-disc list-inside text-gray-400">
          {insight.keySignals.map((signal, index) => (
            <li key={index}>{signal}</li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
)}

          </div>
        </div>
      </GestureInterface>
    </div>
  )
}
