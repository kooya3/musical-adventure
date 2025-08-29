"use client"

import React, { useEffect, useState } from 'react'

export interface ClientOnlyModelGalleryProps {
  columns?: 1 | 2 | 3 | 4
  className?: string
  onItemSelect?: (item: any) => void
  interactive?: boolean
  showDetails?: boolean
  autoRotate?: boolean
  title?: string
  models?: Array<{ name: string; variant?: string }>
}

export default function ClientOnlyModelGallery(props: ClientOnlyModelGalleryProps) {
  const [ModelGalleryComponent, setModelGalleryComponent] = useState<any>(null)

  useEffect(() => {
    const loadModelGallery = async () => {
      try {
        const module = await import('./ModelGallery')
        setModelGalleryComponent(() => module.default)
      } catch (error) {
        console.error('Failed to load ModelGallery:', error)
        setModelGalleryComponent(() => () => (
          <div className={`w-full ${props.className || ''}`}>
            <div className="text-center text-red-400 p-8">
              <div className="text-lg font-medium">Failed to load 3D Gallery</div>
              <div className="text-sm opacity-75">Please check your connection</div>
            </div>
          </div>
        ))
      }
    }

    loadModelGallery()
  }, [props.className])

  if (!ModelGalleryComponent) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${props.className || ''}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden animate-pulse">
            <div className="relative h-64 md:h-80 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <div className="text-xs">Loading 3D Gallery...</div>
              </div>
            </div>
            <div className="p-4">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-12 bg-gray-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return <ModelGalleryComponent {...props} />
}