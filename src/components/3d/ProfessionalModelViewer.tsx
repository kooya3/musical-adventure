"use client"

import React, { useEffect, useRef, useState } from 'react'
import { ProfessionalRenderer } from '@/lib/vanilla-three-renderer'

interface ProfessionalModelViewerProps {
  modelName: string
  variant?: 'glTF-Binary' | 'glTF-Draco' | 'glTF' | 'glTF-Embedded'
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  enableOrbitControls?: boolean
  enablePostProcessing?: boolean
  parallaxIntensity?: number
  autoRotate?: boolean
  animate?: boolean
  className?: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

export default function ProfessionalModelViewer({
  modelName,
  variant = 'glTF-Binary',
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  enableOrbitControls = true,
  enablePostProcessing = true,
  parallaxIntensity = 0.5,
  autoRotate = false,
  animate = true,
  className = '',
  onLoad,
  onError
}: ProfessionalModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<ProfessionalRenderer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let renderer: ProfessionalRenderer | null = null

    const initScene = async () => {
      try {
        // Determine model path - use glTF as fallback if variant doesn't exist
        let modelPath: string
        let extension: string
        
        // Special handling for models without glTF-Binary variant
        if (modelName === 'FlightHelmet') {
          modelPath = `/2.0/${modelName}/glTF/${modelName}.gltf`
          extension = 'gltf'
        } else {
          extension = variant === 'glTF-Binary' ? 'glb' : 'gltf'
          modelPath = `/2.0/${modelName}/${variant}/${modelName}.${extension}`
        }

        // Create renderer
        renderer = new ProfessionalRenderer({
          container: containerRef.current!,
          modelPath: modelPath,
          enableOrbitControls,
          enablePostProcessing,
          parallaxIntensity,
          autoRotate,
          cameraPosition: [5, 3, 5],
          ambientLightIntensity: 0.4,
          directionalLightIntensity: 0.8
        })

        rendererRef.current = renderer

        // Load and configure model
        const model = await renderer.loadModel(modelPath, {
          scale,
          position,
          rotation,
          animation: animate
        })

        // Animate entrance if enabled
        if (animate) {
          renderer.animateModelEntrance(model)
        }

        setLoading(false)
        onLoad?.()
      } catch (err) {
        console.error('Failed to initialize 3D scene:', err)
        setError(err instanceof Error ? err.message : 'Failed to load model')
        setLoading(false)
        onError?.(err instanceof Error ? err : new Error('Failed to load model'))
      }
    }

    initScene()

    // Cleanup
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose()
        rendererRef.current = null
      }
    }
  }, [modelName, variant, scale, position, rotation, enableOrbitControls, enablePostProcessing, parallaxIntensity, autoRotate, animate, onLoad, onError])

  return (
    <div className={`relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-xl overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-white font-medium">Loading {modelName}...</div>
            <div className="text-gray-400 text-sm mt-1">Preparing professional rendering</div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center text-red-400">
            <div className="text-3xl mb-2">⚠️</div>
            <div className="font-medium">Failed to load model</div>
            <div className="text-sm opacity-75 mt-1">{error}</div>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  )
}