"use client"

import { motion } from "framer-motion"
import { Twitter, Brain, Users, Zap, MessageCircle, TrendingUp, X } from "lucide-react"

export function XPremiumLoader() {
  const stages = [
    { icon: Brain, label: "Analyzing Sentiment", color: "text-green-400", delay: 0 },
    { icon: Users, label: "Identifying Verified Followers", color: "text-cyan-400", delay: 0.3 },
    { icon: MessageCircle, label: "Collecting Mentions", color: "text-purple-400", delay: 0.6 },
    { icon: Zap, label: "Extracting Tweets", color: "text-yellow-400", delay: 0.9 },
    { icon: TrendingUp, label: "Calculating Metrics", color: "text-pink-400", delay: 1.2 },
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(29,161,242,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,24,128,0.1),transparent_50%)]" />

      {/* Animated Grid */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(rgba(29,161,242,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(29,161,242,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"
        animate={{ backgroundPosition: ["0px 0px", "50px 50px"] }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-8">
            <motion.div
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="relative"
            >
              <div className="p-4 bg-gradient-to-br from-cyan-500 via-blue-500 to-pink-500 rounded-xl">
                <Twitter className="h-12 w-12 text-white" />
              </div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-pink-500 rounded-xl opacity-0"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            </motion.div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-3 font-mono">X ANALYTICS</h1>
          <p className="text-cyan-400 font-mono text-sm mb-2">Accessing Premium Data</p>
          <p className="text-gray-400 text-sm">Gathering comprehensive social metrics...</p>
        </motion.div>

        {/* Progress Stages */}
        <div className="space-y-4 mb-12">
          {stages.map((stage, index) => {
            const Icon = stage.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="flex items-center gap-4"
              >
                {/* Stage Indicator */}
                <motion.div animate={{ opacity: 1 }} transition={{ delay: stage.delay }} className="relative">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center">
                    <Icon className={`h-6 w-6 ${stage.color}`} />
                  </div>
                  {/* Pulse effect for active stage */}
                  <motion.div
                    animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                    transition={{
                      delay: stage.delay,
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className={`absolute inset-0 rounded-lg border ${stage.color}`}
                  />
                </motion.div>

                {/* Stage Label and Progress */}
                <div className="flex-1">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      delay: stage.delay,
                      duration: 1.2,
                      ease: "easeOut",
                    }}
                    className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 rounded-full mb-2"
                  />
                  <p className="text-gray-300 font-mono text-sm">{stage.label}</p>
                </div>

                {/* Status Indicator */}
                <motion.div
                  animate={{ opacity: [0.5, 1] }}
                  transition={{
                    delay: stage.delay,
                    duration: 0.6,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  className={`w-2 h-2 rounded-full ${stage.color}`}
                />
              </motion.div>
            )
          })}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-black/40 backdrop-blur-md border border-cyan-500/30 rounded-lg p-6 text-center"
        >
          <p className="text-gray-400 text-sm font-mono mb-3">Our advanced system processes:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-cyan-400 font-bold">Sentiment</p>
              <p className="text-xs text-gray-500">AI Analysis</p>
            </div>
            <div>
              <p className="text-purple-400 font-bold">Mentions</p>
              <p className="text-xs text-gray-500">100% Coverage</p>
            </div>
            <div>
              <p className="text-pink-400 font-bold">Tweets</p>
              <p className="text-xs text-gray-500">All Posts</p>
            </div>
            <div>
              <p className="text-yellow-400 font-bold">Growth</p>
              <p className="text-xs text-gray-500">Real-time</p>
            </div>
          </div>
        </motion.div>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mt-12">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-cyan-400 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{
                delay: 0.15 * i,
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
