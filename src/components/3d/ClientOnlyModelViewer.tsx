"use client"

import React, { useEffect, useState } from 'react'

export interface ClientOnlyModelViewerProps {
  modelName: string
  variant?: string
  autoRotate?: boolean
  enableControls?: boolean
  environment?: string
  showShadows?: boolean
  className?: string
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export default function ClientOnlyModelViewer(props: ClientOnlyModelViewerProps) {
  const [ModelViewerComponent, setModelViewerComponent] = useState<any>(null)

  useEffect(() => {
    const loadModelViewer = async () => {
      try {
        const module = await import('./ModelViewer')
        setModelViewerComponent(() => module.default)
      } catch (error) {
        console.error('Failed to load ModelViewer:', error)
        setModelViewerComponent(() => () => (
          <div className={`w-full h-full flex items-center justify-center ${props.className || ''}`}>
            <div className="text-center text-red-400">
              <div className="text-sm font-medium">Failed to load 3D Model</div>
              <div className="text-xs opacity-75">{props.modelName}</div>
            </div>
          </div>
        ))
      }
    }

    loadModelViewer()
  }, [props.className, props.modelName])

  if (!ModelViewerComponent) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${props.className || ''}`}>
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-sm font-medium">Loading 3D Model...</div>
          <div className="text-xs opacity-75">Preparing {props.modelName}</div>
        </div>
      </div>
    )
  }

  return <ModelViewerComponent {...props} />
}