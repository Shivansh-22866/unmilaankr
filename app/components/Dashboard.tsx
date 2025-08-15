"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Twitter,
  Activity,
  Users,
  AlertTriangle,
  Cpu,
  Wifi,
  Shield,
  Target,
  Layers,
  Rocket,
  Brain,
  Atom,
  MessageSquare,
  Zap,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParticleSystem } from "./ParticleSystem";
import { HolographicDataCube } from "./DataCube";
import { AudioVisualizer } from "./AudiVisualizer";
import { MorphingCard } from "./MorphingCard";
import { GestureInterface } from "./GestureInterface";
import type {
  MomentumScore,
  AnomalyAlert as AlertType,
  ProjectConfig,
  TimeSeriesAllPoint,
  AIinsights,
} from "@/types/agent";
import { MomentumTimeSeries } from "./MomentumTimeSeries";
import { AIInsightsDisplay } from "./AIInsightsDisplay";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/app/assets/images/logo.png"

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<MomentumScore | null>(null);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [breakDown, setBreakDown] = useState<TimeSeriesAllPoint[]>([]);
  const [githubWeight, setGithubWeight] = useState(0.25);
  const [twitterWeight, setTwitterWeight] = useState(0.35);
  const [onchainWeight, setOnchainWeight] = useState(0.1);
  const [communityWeight, setCommunityWeight] = useState(0.15);
  const [previousScore, setPreviousScore] = useState<MomentumScore | null>(null);
  const [scoreDelta, setScoreDelta] = useState<number | null>(null);
  const [insights, setInsights] = useState<AIinsights>({
    summary: "",
    outlook: "neutral",
    keySignals: [],
    riskLevel: "medium",
    confidence: 0,
    reason: "",
    review: "",
    narrative: "",
    trendDelta: {
      shortTerm: "stable",
      longTerm: "stable",
      velocity: 0,
    },
    signalAlignment: {
      githubVsTwitter: "inconclusive",
      communityVsOnchain: "inconclusive",
    },
    anomalyTrend: "",
    relativePerformance: {
      category: "",
      rankPercentile: 0,
      outperformingSignals: [],
    },
  });
  const [aiProcessing, setAiProcessing] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    name: "Lens Protocol",
    githubRepo: "https://github.com/RocketChat/Rocket.Chat",
    twitterHandle: "isShivmkwr",
    contractAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    tokenSymbol: "LENS",
    discord: {
      serverId: "1381348107551379557",
      channelId: "1381348108453286063",
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 1000);
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(timeInterval);
    };
  }, []);

  const handleRunAgent = async () => {
    setLoading(true);
    setError(null);
    try {
      setAiProcessing(true);
      setPreviousScore(score);
      const totalWeight = githubWeight + twitterWeight + onchainWeight + communityWeight || 1;
const normalizedWeights = {
  github: githubWeight / totalWeight,
  twitter: twitterWeight / totalWeight,
  onchain: onchainWeight / totalWeight,
  community: communityWeight / totalWeight,
};

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: projectConfig,
          timeWindow: 48,
          updateInterval: 60,
          anomalyThreshold: 2.5,
          weights: normalizedWeights
        }),
      });

      const json = await res.json();
      if (json.status === "ok") {
        console.log(json);
        setAiProcessing(false);
        setBreakDown(json.breakdown);
        setScore(json.score);
        setAlerts(json.alerts);
        setInsights(json.aiInput);
        if (previousScore && json.score) {
        const delta = json.score.overall - previousScore.overall;
        setScoreDelta(delta);
      } else {
        setScoreDelta(null);
      }
        console.log("AI INSIGHTS", insights);
      } else {
        setError("Neural network synchronization failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Quantum entanglement disrupted. Recalibrating...");
    } finally {
      setLoading(false);
      setAiProcessing(false)
    }
  };

  const handleViewGitHubAnalytics = () => {
    const encodedUrl = encodeURIComponent(projectConfig.githubRepo || "");
    router.push(`/github?url=${encodedUrl}`);
  };

  const handleViewOnchainAnalytics  = () => {
    const encodedUrl = encodeURIComponent(projectConfig.contractAddress || "");
    router.push(`/onchain?address=${encodedUrl}`);
  }

  const handleDiscordAnalytics = () => {
    router.push(`/discord?server=${projectConfig.discord?.serverId}&channel=${projectConfig.discord?.channelId}`);
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Particle System Background */}
      <ParticleSystem />

      {/* Dynamic Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(236,72,153,0.05),transparent_50%)]" />

      {/* Animated Grid */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"
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
          {/* Animated Header */}
          <AnimatePresence>
            {isInitialized && (
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
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full blur-2xl opacity-50 animate-pulse" />
                    <div className="relative p-2 bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-600 rounded-full">
                      {/* <Brain className="h-16 w-16 text-white" /> */}
                      <Image src={Logo} height={64} width={64} alt="Logo" />
                    </div>
                  </motion.div>
                </div>

                <motion.h1
                  className="text-8xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 font-mono"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  Signiq
                </motion.h1>

                <motion.p
                  className="text-xl italic text-gray-300 max-w-4xl mx-auto leading-relaxed mb-6 font-serif"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                >
                  Catch the Signal Before the Noise
                </motion.p>

                <motion.p
                  className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                >
                  Momentum Forecasting • Signal Intelligence • Federated
                  Foresight
                </motion.p>

                {/* Real-time Status Bar */}
                <motion.div
                  className="flex items-center justify-center space-x-8 text-sm font-mono"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400">NEURAL LINK ACTIVE</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-cyan-400" />
                    <span className="text-cyan-400">QUANTUM SYNC</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Atom className="h-4 w-4 text-purple-400 animate-spin" />
                    <span className="text-purple-400">
                      {currentTime.toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Project Command Center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-12"
          >
            <Card className="!bg-black/50 backdrop-blur-md border border-cyan-500/30 shadow-2xl overflow-hidden">
              <motion.div
                className="h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
              <CardHeader className="border-b border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Target className="h-8 w-8 text-purple-400" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-3xl text-white font-mono">
                        {projectConfig.name}
                      </CardTitle>
                      <p className="text-gray-400 text-lg">
                        TARGET ACQUIRED • NEURAL ANALYSIS READY
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Badge
                      variant="outline"
                      className="border-green-500/50 text-green-400 bg-green-500/10 px-4 py-2"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      SECURE
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-cyan-500/50 !text-cyan-400 bg-cyan-500/10 px-4 py-2"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      ACTIVE
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    {
                      icon: Github,
                      label: "REPOSITORY",
                      field: "githubRepo",
                      value: projectConfig.githubRepo,
                      color: "text-gray-400",
                    },
                    {
                      icon: Twitter,
                      label: "SOCIAL HANDLE",
                      field: "twitterHandle",
                      value: projectConfig.twitterHandle,
                      color: "text-blue-400",
                      prefix: "@",
                    },
                    {
                      icon: Layers,
                      label: "CONTRACT",
                      field: "contractAddress",
                      value: projectConfig.contractAddress,
                      color: "text-green-400",
                    },
                    {
                      icon: Cpu,
                      label: "TOKEN",
                      field: "tokenSymbol",
                      value: projectConfig.tokenSymbol,
                      color: "text-purple-400",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                    >
                      <item.icon className={`h-6 w-6 mt-2 ${item.color}`} />
                      <div className="w-full">
                        <p className="text-sm text-gray-400 font-mono mb-1">
                          {item.label}
                        </p>
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) =>
                            setProjectConfig((prev) => ({
                              ...prev,
                              [item.field]: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded text-white font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder={item.label}
                        />
                      </div>
                    </motion.div>
                  ))}
                  <motion.div
                    className="flex items-start space-x-4 mx-auto"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * 4, duration: 0.5 }} // delay after 4th item
                  >
                    <MessageSquare className="h-6 w-6 mt-2 text-indigo-400" />
                    <div className="w-full">
                      <p className="text-sm text-gray-400 font-mono mb-1 flex justify-between items-center">
                        DISCORD CHANNEL
                        <span className="text-xs text-yellow-400 ml-2">
                          Bot must be invited
                        </span>
                      </p>
                      <input
                        type="text"
                        placeholder="Paste Discord channel link..."
                        className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded text-white font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => {
                          const input = e.target.value;
                          const match = input.match(/channels\/(\d+)\/(\d+)/); // extract server + channel ID
                          if (match) {
                            const [_, serverId, channelId] = match;
                            setProjectConfig((prev) => ({
                              ...prev,
                              discord: { serverId, channelId },
                            }));
                          } else {
                            // Optionally reset or show error if input is cleared
                            setProjectConfig((prev) => ({
                              ...prev,
                              discord: undefined,
                            }));
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Example: https://discord.com/channels/
                        <strong>SERVER_ID</strong>/<strong>CHANNEL_ID</strong>
                      </p>
                      <p className="text-xs text-yellow-500 mt-1">
                        Make sure our bot has access to this channel. Invite
                        link:{" "}
                        <a
                          href="https://discord.com/oauth2/authorize?client_id=1381346538961506524"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Invite Bot
                        </a>
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex items-start space-x-4 opacity-50 cursor-not-allowed left-20 relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * 5, duration: 0.5 }} // after existing inputs
                  >
                    <Zap className="h-6 w-6 mt-2 text-pink-400" />
                    <div className="w-full">
                      <p className="text-sm text-gray-400 font-mono mb-1">
                        COMING SOON
                      </p>
                      <input
                        type="text"
                        value="Reddit, Medium, Telegram, Farcaster..."
                        disabled
                        className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded text-white font-mono placeholder-gray-500 focus:outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Future data streams will be supported soon
                      </p>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weight Configuration Sliders */}
<div className="my-10 border-t border-gray-700 pt-8">
  <h3 className="text-white text-xl font-mono mb-4">Weight Configuration</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[
      { label: "GitHub", value: githubWeight, setter: setGithubWeight, color: "text-gray-300" },
      { label: "Twitter", value: twitterWeight, setter: setTwitterWeight, color: "text-blue-300" },
      { label: "Onchain", value: onchainWeight, setter: setOnchainWeight, color: "text-green-300" },
      { label: "Community", value: communityWeight, setter: setCommunityWeight, color: "text-purple-300" },
    ].map(({ label, value, setter, color }, index) => (
      <div key={index}>
        <label className={`block mb-2 font-mono text-sm ${color}`}>{label} Weight: {value.toFixed(2)}</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => setter(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    ))}
  </div>
</div>


          {/* Ultimate Action Button */}
          <motion.div
            className="flex justify-center mb-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleRunAgent}
                disabled={loading}
                size="lg"
                className="relative bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-700 hover:via-purple-700 hover:to-pink-700 text-white px-16 py-6 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 font-mono text-xl"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-2xl"
                  animate={{
                    opacity: loading ? [0.3, 0.7, 0.3] : 0.3,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: loading ? Number.POSITIVE_INFINITY : 0,
                  }}
                />
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    >
                      <Brain className="h-6 w-6 mr-4" />
                    </motion.div>
                    NEURAL PROCESSING...
                  </>
                ) : (
                  <>
                    <Rocket className="h-6 w-6 mr-4" />
                    INITIATE QUANTUM SCAN
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>

          {/* Loading Experience */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-12"
              >
                <Card className="bg-black/80 backdrop-blur-md border border-cyan-500/30 shadow-2xl">
                  <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-8">
                      <motion.div
                        className="relative"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                      >
                        <div className="w-32 h-32 border-4 border-cyan-500/30 rounded-full">
                          <div className="absolute top-0 left-0 w-32 h-32 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" />
                          <div
                            className="absolute top-2 left-2 w-28 h-28 border-4 border-transparent border-t-purple-400 rounded-full animate-spin"
                            style={{ animationDirection: "reverse" }}
                          />
                          <div className="absolute top-4 left-4 w-24 h-24 border-4 border-transparent border-t-pink-400 rounded-full animate-spin" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Brain className="h-12 w-12 text-cyan-400 animate-pulse" />
                        </div>
                      </motion.div>

                      <div className="text-center">
                        <motion.p
                          className="text-3xl font-bold text-cyan-400 font-mono mb-4 !bg-black/50"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                        >
                          QUANTUM NEURAL ANALYSIS
                        </motion.p>
                        <p className="text-gray-400 text-lg mb-6">
                          Scanning GitHub • Twitter • Onchain • Community
                          Signals
                        </p>

                        <div className="flex justify-center space-x-3 mb-8">
                          {[...Array(7)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-3 h-3 bg-cyan-400 rounded-full"
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>

                        <AudioVisualizer />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(score || aiProcessing) && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="mb-12"
              >
                <AIInsightsDisplay
                  insights={insights}
                  isProcessing={aiProcessing}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Dashboard */}
          <AnimatePresence>
            {score && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="space-y-12"
              >
                {/* Holographic Score Display */}
                <Card className="!bg-black/20 backdrop-blur-md border border-cyan-500/30 shadow-2xl overflow-hidden">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                  <CardContent className="p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                      <div className="text-center lg:text-left">
                        <motion.h2
                          className="text-4xl font-bold text-white mb-6 font-mono"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          MOMENTUM QUANTUM STATE
                        </motion.h2>

                        <motion.div
                          className="text-9xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8 font-mono"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: 0.5,
                            duration: 1,
                            type: "spring",
                          }}
                        >
                          {score.overall.toFixed(1)}
                        </motion.div>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                          <Badge
                            variant={
                              score.trend === "rising"
                                ? "default"
                                : score.trend === "falling"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-lg px-6 py-3 font-mono"
                          >
                            {score.trend === "rising"
                              ? "🚀"
                              : score.trend === "falling"
                              ? "📉"
                              : "⚡"}{" "}
                            {score.trend.toUpperCase()}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-lg px-6 py-3 border-cyan-500/50 !text-cyan-400 bg-cyan-500/10 font-mono"
                          >
                            {(score.confidence * 100).toFixed(0)}% CONFIDENCE
                          </Badge>
                          {scoreDelta !== null && (
  <div className="mt-2 text-sm font-mono">
    <span className={scoreDelta >= 0 ? "text-green-400" : "text-red-400"}>
      {scoreDelta >= 0 ? "▲" : "▼"} {Math.abs(scoreDelta).toFixed(1)} pts (
      {previousScore && previousScore.overall > 0
        ? ((scoreDelta / previousScore.overall) * 100).toFixed(1)
        : "0"}
      %)
    </span>{" "}
    compared to previous weights
  </div>
)}

                        </div>
                      </div>

                      <div className="flex justify-center">
                        <HolographicDataCube data={score} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Morphing Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    {
                      title: "GitHub Velocity",
                      value: score.github,
                      icon: <Github className="h-8 w-8 text-gray-300" />,
                      color: "from-gray-600 to-gray-800",
                      content: (
                        <div className="mt-6 pt-6 border-t border-cyan-500/20">
                          <Button
                            onClick={handleViewGitHubAnalytics}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-mono"
                          >
                            <Github className="h-5 w-5 mr-2" />
                            GITHUB ANALYTICS
                          </Button>
                        </div>
                      ),
                    },
                    {
                      title: "Social Momentum",
                      value: score.social,
                      icon: <Twitter className="h-8 w-8 text-blue-400" />,
                      color: "from-blue-600 to-purple-600",
                      content: (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Mentions</span>
                            <span className="text-white">20</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Engagement</span>
                            <span className="text-white">180</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Sentiment</span>
                            <span className="text-green-400">+0.1</span>
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: "Onchain Activity",
                      value: score.onchain,
                      icon: <Activity className="h-8 w-8 text-green-400" />,
                      color: "from-green-600 to-emerald-600",
                      content: (
                        <div className="mt-6 pt-6 border-t border-cyan-500/20">
                          <Button
                            onClick={handleViewOnchainAnalytics}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-mono"
                          >
                            <Coins className="h-5 w-5 mr-2" />
                            ONCHAIN ANALYTICS
                          </Button>
                        </div>
                      ),
                    },
                    {
                      title: "Community Power",
                      value: score.community,
                      icon: <Users className="h-8 w-8 text-purple-400" />,
                      color: "from-purple-600 to-pink-600",
                      content: (
                        <div className="mt-6 pt-6 border-t border-cyan-500/20">
                          <Button
                            onClick={handleDiscordAnalytics}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-mono"
                          >
                            <MessageSquare className="h-5 w-5 mr-2" />
                            DISCORD ANALYTICS
                          </Button>
                        </div>
                      ),
                    },
                  ].map((metric, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                    >
                      <MorphingCard {...metric}>{metric.content}</MorphingCard>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-12">
                  <MomentumTimeSeries data={breakDown} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Anomaly Alerts */}
          <AnimatePresence>
            {alerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-12"
              >
                <Card className="bg-black/80 backdrop-blur-md border border-red-500/30 shadow-2xl">
                  <CardHeader className="border-b border-red-500/20">
                    <div className="flex items-center space-x-4">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{
                          duration: 0.5,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                      >
                        <AlertTriangle className="h-8 w-8 text-red-400" />
                      </motion.div>
                      <CardTitle className="text-2xl text-white font-mono">
                        QUANTUM ANOMALIES DETECTED
                      </CardTitle>
                      <Badge
                        variant="destructive"
                        className="font-mono text-lg px-4 py-2"
                      >
                        {alerts.length} CRITICAL ALERTS
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    {alerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm"
                      >
                        <div className="flex items-start space-x-4">
                          <AlertTriangle className="h-6 w-6 text-red-400 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="font-bold text-white font-mono text-lg">
                                {alert.metric}
                              </span>
                              <Badge
                                variant={
                                  alert.severity === "high"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="font-mono"
                              >
                                {alert.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-gray-300 text-lg">
                              {alert.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GestureInterface>
    </div>
  );
}
