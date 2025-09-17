"use client"

import React, { useEffect, useState } from 'react'

interface ClientOnlyAdvancedModelViewerProps {
  modelName: string
  className?: string
  width?: string | number
  height?: string | number
  environment?: 'studio' | 'city' | 'forest' | 'night' | 'sunset' | 'dawn' | null
  enableShadows?: boolean
  shadowType?: 'contact' | 'soft' | 'basic'
  background?: string | null
  enableControls?: boolean
  autoRotate?: boolean
  autoRotateSpeed?: number
  enableZoom?: boolean
  enablePan?: boolean
  playAnimations?: boolean
  animationLoop?: boolean
  pixelRatio?: number | [number, number]
  antialias?: boolean
  onLoad?: (model: any) => void
  onProgress?: (progress: any) => void
  onError?: (error: Error) => void
  onClick?: (event: any) => void
  onHover?: (event: any) => void
  showStats?: boolean
  showWireframe?: boolean
  scale?: number | [number, number, number]
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export default function ClientOnlyAdvancedModelViewer(props: ClientOnlyAdvancedModelViewerProps) {
  const [ModelViewerComponent, setModelViewerComponent] = useState<any>(null)

  useEffect(() => {
    const loadModelViewer = async () => {
      try {
        const module = await import('./AdvancedModelViewer')
        setModelViewerComponent(() => module.default)
      } catch (error) {
        console.error('Failed to load AdvancedModelViewer:', error)
        setModelViewerComponent(() => () => (
          <div className={`w-full h-full flex items-center justify-center bg-gray-900 rounded-lg ${props.className || ''}`}>
            <div className="text-center text-red-400">
              <div className="text-lg font-medium mb-2">⚠️</div>
              <div className="text-sm font-medium">Failed to load 3D Viewer</div>
              <div className="text-xs opacity-75 mt-1">{props.modelName}</div>
            </div>
          </div>
        ))
      }
    }

    loadModelViewer()
  }, [props.className, props.modelName])

  if (!ModelViewerComponent) {
    const canvasStyle = {
      width: typeof props.width === 'number' ? `${props.width}px` : props.width || '100%',
      height: typeof props.height === 'number' ? `${props.height}px` : props.height || '100%',
    }

    return (
      <div className={`bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center ${props.className || ''}`} style={canvasStyle}>
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-sm font-medium">Loading 3D Viewer...</div>
          <div className="text-xs opacity-75 mt-1">Preparing {props.modelName}</div>
        </div>
      </div>
    )
  }

  return <ModelViewerComponent {...props} />
}