"use client"

import { useState, useEffect } from "react"
import { debounce } from "@/lib/utils"

interface ViewportSize {
  width: number
  height: number
}

interface ResponsiveConfig {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  viewport: ViewportSize
  pixelRatio: number
  reducedMotion: boolean
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
} as const

export function useResponsive(): ResponsiveConfig {
  const [config, setConfig] = useState<ResponsiveConfig>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    viewport: { width: 1920, height: 1080 },
    pixelRatio: 1,
    reducedMotion: false,
  })

  useEffect(() => {
    const updateConfig = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      
      // Check for reduced motion preference
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches

      setConfig({
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.desktop,
        isDesktop: width >= BREAKPOINTS.desktop,
        viewport: { width, height },
        pixelRatio,
        reducedMotion,
      })
    }

    // Initial update
    updateConfig()

    // Debounced resize handler
    const debouncedUpdate = debounce(updateConfig, 100)
    
    window.addEventListener("resize", debouncedUpdate)
    
    // Listen for reduced motion changes
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    mediaQuery.addEventListener("change", updateConfig)

    return () => {
      window.removeEventListener("resize", debouncedUpdate)
      mediaQuery.removeEventListener("change", updateConfig)
    }
  }, [])

  return config
}