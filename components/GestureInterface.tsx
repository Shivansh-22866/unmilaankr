"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

export function GestureInterface({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        })
      }
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove)
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Dynamic lighting effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: isHovering
            ? `radial-gradient(600px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(0, 255, 255, 0.1), transparent 40%)`
            : "transparent",
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Floating particles that follow mouse */}
      {isHovering && (
        <motion.div
          className="absolute w-2 h-2 bg-cyan-400 rounded-full pointer-events-none"
          animate={{
            x: mousePosition.x * (containerRef.current?.offsetWidth || 0) - 4,
            y: mousePosition.y * (containerRef.current?.offsetHeight || 0) - 4,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping" />
        </motion.div>
      )}

      {children}
    </div>
  )
}
