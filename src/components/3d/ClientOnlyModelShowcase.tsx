"use client"

import React, { useEffect, useState } from 'react'
import { ModelCategory } from '@/lib/model-registry'

interface ClientOnlyModelShowcaseProps {
  category?: ModelCategory
  title?: string
  subtitle?: string
  columns?: 1 | 2 | 3 | 4
  className?: string
  showFilter?: boolean
  showStats?: boolean
  maxModels?: number
}

export default function ClientOnlyModelShowcase(props: ClientOnlyModelShowcaseProps) {
  const [ShowcaseComponent, setShowcaseComponent] = useState<any>(null)

  useEffect(() => {
    const loadShowcase = async () => {
      try {
        const module = await import('./ModelShowcase')
        setShowcaseComponent(() => module.default)
      } catch (error) {
        console.error('Failed to load ModelShowcase:', error)
        setShowcaseComponent(() => () => (
          <div className={`p-8 ${props.className || ''}`}>
            <div className="text-center text-red-400">
              <div className="text-2xl mb-2">⚠️</div>
              <div className="text-lg font-medium">Failed to load 3D Model Showcase</div>
              <div className="text-sm opacity-75 mt-2">Please refresh to try again</div>
            </div>
          </div>
        ))
      }
    }

    loadShowcase()
  }, [props.className])

  if (!ShowcaseComponent) {
    return (
      <div className={`p-8 ${props.className || ''}`}>
        <div className="space-y-6">
          {/* Loading Header */}
          <div className="text-center space-y-4">
            <div className="h-8 bg-gray-700 rounded-lg w-64 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-800 rounded w-96 mx-auto animate-pulse" />
          </div>
          
          {/* Loading Filter Buttons */}
          <div className="flex justify-center gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-20 bg-gray-700 rounded-full animate-pulse" />
            ))}
          </div>
          
          {/* Loading Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden animate-pulse">
                <div className="h-64 md:h-80 bg-gray-800" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-full" />
                  <div className="h-3 bg-gray-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400">Loading 3D Model Showcase...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <ShowcaseComponent {...props} />
}