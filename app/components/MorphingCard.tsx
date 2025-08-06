"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence, useMotionValue, useAnimationFrame } from "framer-motion"

interface MorphingCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  children?: React.ReactNode
}

export function MorphingCard({ title, value, icon, color, children }: MorphingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Use Framer Motion's motion value instead of React state
  const glow = useMotionValue(0.3)

  // Update glow value on every animation frame
  useAnimationFrame(() => {
    const intensity = 0.3 + Math.sin(Date.now() * 0.003) * 0.2
    glow.set(intensity)
  })

  return (
    <motion.div
      className="relative cursor-pointer"
      whileHover={{ scale: 1.05, rotateY: 5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${color} rounded-xl blur-lg`}
        style={{ opacity: glow }} // Use motion value for opacity
        animate={{
          scale: isExpanded ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="relative bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-6 overflow-hidden"
        animate={{
          height: isExpanded ? "auto" : "120px",
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_70%)] animate-pulse" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.div>

            <motion.div className="text-right" animate={{ x: isExpanded ? 10 : 0 }}>
              <div className="text-2xl font-bold text-white font-mono">{value.toFixed(1)}</div>
            </motion.div>
          </div>

          <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-4">{title}</h3>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scanning line effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </motion.div>
    </motion.div>
  )
}
