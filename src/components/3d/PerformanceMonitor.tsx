"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

interface PerformanceStats {
  fps: number
  memory: number
  drawCalls: number
  triangles: number
  points: number
  lines: number
  frame: number
}

interface PerformanceMonitorProps {
  enabled?: boolean
  showStats?: boolean
  onPerformanceUpdate?: (stats: PerformanceStats) => void
}

export default function PerformanceMonitor({ 
  enabled = true, 
  showStats = false,
  onPerformanceUpdate 
}: PerformanceMonitorProps) {
  const { gl, scene } = useThree()
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    memory: 0,
    drawCalls: 0,
    triangles: 0,
    points: 0,
    lines: 0,
    frame: 0
  })

  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const fpsBuffer = useRef<number[]>([])

  useFrame(() => {
    if (!enabled) return

    frameCount.current++
    const currentTime = performance.now()
    const deltaTime = currentTime - lastTime.current

    // Calculate FPS every 500ms
    if (deltaTime >= 500) {
      const fps = Math.round((frameCount.current * 1000) / deltaTime)
      
      // Maintain FPS buffer for smoothing
      fpsBuffer.current.push(fps)
      if (fpsBuffer.current.length > 10) {
        fpsBuffer.current.shift()
      }
      
      const avgFps = Math.round(
        fpsBuffer.current.reduce((a, b) => a + b, 0) / fpsBuffer.current.length
      )

      // Get renderer info
      const info = gl.info
      const memory = (performance as any).memory
      
      const newStats: PerformanceStats = {
        fps: avgFps,
        memory: memory ? Math.round(memory.usedJSHeapSize / 1048576) : 0, // MB
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        points: info.render.points,
        lines: info.render.lines,
        frame: info.render.frame
      }

      setStats(newStats)
      onPerformanceUpdate?.(newStats)

      // Reset counters
      frameCount.current = 0
      lastTime.current = currentTime
    }
  })

  if (!enabled || !showStats) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-sm border border-gray-600 rounded-lg p-4 text-white text-sm font-mono">
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={stats.fps < 30 ? 'text-red-400' : stats.fps < 50 ? 'text-yellow-400' : 'text-green-400'}>
            {stats.fps}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Memory:</span>
          <span className={stats.memory > 200 ? 'text-red-400' : stats.memory > 100 ? 'text-yellow-400' : 'text-green-400'}>
            {stats.memory}MB
          </span>
        </div>
        <div className="flex justify-between">
          <span>Draw Calls:</span>
          <span className={stats.drawCalls > 100 ? 'text-red-400' : 'text-white'}>
            {stats.drawCalls}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Triangles:</span>
          <span>{stats.triangles.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Frame:</span>
          <span>{stats.frame}</span>
        </div>
      </div>
    </div>
  )
}

// Performance warning component
export function PerformanceWarning({ stats }: { stats: PerformanceStats }) {
  const [showWarning, setShowWarning] = useState(false)
  
  useEffect(() => {
    const hasPerformanceIssue = stats.fps < 20 || stats.memory > 300 || stats.drawCalls > 200
    setShowWarning(hasPerformanceIssue)
  }, [stats])

  if (!showWarning) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-red-600/90 backdrop-blur-sm border border-red-500 rounded-lg p-4 text-white text-sm max-w-sm">
      <div className="flex items-start space-x-2">
        <div className="text-yellow-300 text-lg">⚠️</div>
        <div>
          <div className="font-semibold mb-1">Performance Warning</div>
          <div className="text-xs opacity-90">
            3D rendering performance may be impacted. Consider reducing quality settings.
          </div>
          <button 
            onClick={() => setShowWarning(false)}
            className="mt-2 text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook for performance monitoring
export function usePerformanceMonitoring() {
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [isOptimal, setIsOptimal] = useState(true)

  useEffect(() => {
    if (!stats) return
    
    const optimal = stats.fps >= 30 && stats.memory < 200 && stats.drawCalls < 150
    setIsOptimal(optimal)
  }, [stats])

  return {
    stats,
    isOptimal,
    onPerformanceUpdate: setStats
  }
}