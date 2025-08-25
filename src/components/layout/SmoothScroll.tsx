"use client"

import React, { useEffect, useRef, ReactNode } from "react"
import { motion } from "framer-motion"
import { useResponsive } from "@/hooks/useResponsive"

interface SmoothScrollProps {
  children: ReactNode
  className?: string
}

export default function SmoothScroll({ children, className }: SmoothScrollProps) {
  const { reducedMotion, isMobile } = useResponsive()

  // For now, we'll skip Lenis and use native smooth scroll
  // This can be enhanced later once the basic portfolio is working

  return (
    <div className={className}>
      {children}
      <ScrollProgressBar />
    </div>
  )
}

function ScrollProgressBar() {
  const [progress, setProgress] = React.useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollTop / docHeight
      setProgress(progress)
    }

    const handleScroll = () => requestAnimationFrame(updateProgress)
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 transform-gpu z-50"
      style={{
        scaleX: progress,
        transformOrigin: "0%",
      }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: progress }}
      transition={{ duration: 0.1, ease: "linear" }}
    />
  )
}

// Hook to use scroll functionality in other components
export function useLenis() {
  return {
    scrollTo: (target: string | number, options?: any) => {
      // Use native smooth scroll for now
      if (typeof target === "string") {
        const element = document.querySelector(target)
        element?.scrollIntoView({ behavior: "smooth" })
      } else {
        window.scrollTo({ top: target, behavior: "smooth" })
      }
    },
    lenis: null,
  }
}