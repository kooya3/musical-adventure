"use client"

import React, { useEffect, useState } from 'react'
import SimpleModelViewer from './SimpleModelViewer'

export default function TestCanvas() {
  const [Canvas, setCanvas] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showModels, setShowModels] = useState(false)

  useEffect(() => {
    const loadCanvas = async () => {
      try {
        console.log('Attempting to load Canvas...')
        const { Canvas: CanvasComponent } = await import('@react-three/fiber')
        console.log('Canvas loaded successfully!')
        setCanvas(() => CanvasComponent)
        setShowModels(true)
      } catch (err) {
        console.error('Failed to load Canvas:', err)
        setError(err instanceof Error ? err.message : 'Failed to load Canvas')
      }
    }

    loadCanvas()
  }, [])

  if (error) {
    return (
      <div className="w-full h-64 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center justify-center">
        <div className="text-center text-red-400">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-sm font-medium">Failed to load 3D viewer</div>
          <div className="text-xs opacity-75 mt-1">{error}</div>
        </div>
      </div>
    )
  }

  if (!showModels) {
    return (
      <div className="w-full h-64 bg-blue-900/20 border border-blue-500/50 rounded-lg flex items-center justify-center">
        <div className="text-center text-blue-400">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <div className="font-medium">Loading Canvas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Duck Model</h3>
          <SimpleModelViewer
            modelName="Duck"
            scale={2}
            autoRotate={true}
            className="w-full h-64"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Damaged Helmet</h3>
          <SimpleModelViewer
            modelName="DamagedHelmet"
            scale={1}
            autoRotate={true}
            className="w-full h-64"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Flight Helmet</h3>
          <SimpleModelViewer
            modelName="FlightHelmet"
            scale={1.5}
            autoRotate={true}
            className="w-full h-64"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">BoomBox</h3>
          <SimpleModelViewer
            modelName="BoomBox"
            scale={2}
            autoRotate={true}
            className="w-full h-64"
          />
        </div>
      </div>
    </div>
  )
}