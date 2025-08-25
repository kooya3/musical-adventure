"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModelViewer from './ModelViewer'
import { useModels } from '@/contexts/ModelContext'
import { PORTFOLIO_MODELS } from '@/lib/gltf-loader'

export interface ModelGalleryItem {
  modelName: string
  variant?: string
  title: string
  description: string
  scale?: number
  environment?: string
}

const DEFAULT_GALLERY_ITEMS: ModelGalleryItem[] = [
  {
    modelName: 'DamagedHelmet',
    variant: 'glTF-Binary',
    title: 'Damaged Helmet',
    description: 'Classic PBR showcase model with realistic materials and textures',
    scale: 1,
    environment: 'sunset'
  },
  {
    modelName: 'FlightHelmet',
    variant: 'glTF',
    title: 'Flight Helmet',
    description: 'High-fidelity aviation helmet with detailed materials',
    scale: 1,
    environment: 'studio'
  },
  {
    modelName: 'BoomBox',
    variant: 'glTF-Draco',
    title: 'Retro Boom Box',
    description: 'Vintage audio equipment with technical precision',
    scale: 1,
    environment: 'city'
  },
  {
    modelName: 'Avocado',
    variant: 'glTF-Binary',
    title: 'Avocado',
    description: 'Organic modeling with realistic surface details',
    scale: 1,
    environment: 'forest'
  },
  {
    modelName: 'Duck',
    variant: 'glTF-Binary',
    title: 'Classic Duck',
    description: 'Simple yet charming character model',
    scale: 1,
    environment: 'park'
  }
]

export interface ModelGalleryProps {
  items?: ModelGalleryItem[]
  columns?: 1 | 2 | 3 | 4
  className?: string
  onItemSelect?: (item: ModelGalleryItem) => void
  interactive?: boolean
  showDetails?: boolean
  autoRotate?: boolean
}

export default function ModelGallery({
  items = DEFAULT_GALLERY_ITEMS,
  columns = 3,
  className = '',
  onItemSelect,
  interactive = true,
  showDetails = true,
  autoRotate = false
}: ModelGalleryProps) {
  const { state } = useModels()
  const [selectedItem, setSelectedItem] = useState<ModelGalleryItem | null>(null)
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set())

  const handleItemSelect = (item: ModelGalleryItem) => {
    setSelectedItem(item)
    onItemSelect?.(item)
  }

  const handleModelLoad = (modelName: string) => {
    setLoadingItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(modelName)
      return newSet
    })
  }

  const getGridClassName = () => {
    const baseClass = 'grid gap-6'
    switch (columns) {
      case 1: return `${baseClass} grid-cols-1`
      case 2: return `${baseClass} grid-cols-1 md:grid-cols-2`
      case 3: return `${baseClass} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
      case 4: return `${baseClass} grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
      default: return `${baseClass} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
    }
  }

  const getLoadingProgress = (modelName: string): number => {
    return state.loadingProgress.get(modelName) || 0
  }

  const isModelLoaded = (modelName: string): boolean => {
    return state.loadedModels.has(modelName)
  }

  const hasError = (modelName: string): boolean => {
    return state.errors.has(modelName)
  }

  return (
    <div className={`w-full ${className}`}>
      <div className={getGridClassName()}>
        {items.map((item, index) => {
          const isLoaded = isModelLoaded(item.modelName)
          const hasItemError = hasError(item.modelName)
          const progress = getLoadingProgress(item.modelName)
          
          return (
            <motion.div
              key={`${item.modelName}-${item.variant}`}
              className={`
                relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden
                ${interactive ? 'cursor-pointer hover:border-blue-500/50 transition-colors' : ''}
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => interactive && handleItemSelect(item)}
              whileHover={interactive ? { scale: 1.02 } : {}}
              whileTap={interactive ? { scale: 0.98 } : {}}
            >
              {/* Model Viewer */}
              <div className="relative h-64 md:h-80">
                {isLoaded ? (
                  <ModelViewer
                    modelName={item.modelName}
                    variant={item.variant}
                    scale={item.scale}
                    environment={item.environment}
                    autoRotate={autoRotate}
                    enableControls={interactive}
                    onModelLoad={() => handleModelLoad(item.modelName)}
                    className="w-full h-full"
                  />
                ) : hasItemError ? (
                  <div className="flex items-center justify-center h-full text-red-400">
                    <div className="text-center">
                      <div className="text-2xl mb-2">⚠️</div>
                      <div className="text-sm">Failed to load</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400">
                      <div className="w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <div className="text-sm">Loading {Math.round(progress)}%</div>
                    </div>
                  </div>
                )}

                {/* Loading overlay */}
                {!isLoaded && !hasItemError && (
                  <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <div className="text-xs opacity-75">Loading...</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Details */}
              {showDetails && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                  
                  {/* Variant badge */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-block px-2 py-1 bg-blue-600/20 text-blue-300 text-xs font-medium rounded">
                      {item.variant || 'glTF-Binary'}
                    </span>
                    {isLoaded && (
                      <span className="text-green-400 text-xs">✓ Loaded</span>
                    )}
                  </div>
                </div>
              )}

              {/* Selection indicator */}
              {interactive && selectedItem === item && (
                <div className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none" />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Loading progress */}
      {state.isLoading && (
        <motion.div
          className="mt-6 p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Loading Models</span>
            <span className="text-gray-300 text-sm">
              {state.loadedCount} / {state.totalModels}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${state.totalModels > 0 ? (state.loadedCount / state.totalModels) * 100 : 0}%`
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Modal for detailed view */}
      <AnimatePresence>
        {interactive && selectedItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="relative bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-96">
                <ModelViewer
                  modelName={selectedItem.modelName}
                  variant={selectedItem.variant}
                  scale={selectedItem.scale}
                  environment={selectedItem.environment}
                  autoRotate={true}
                  enableControls={true}
                  className="w-full h-full"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.title}</h2>
                <p className="text-gray-300 mb-4">{selectedItem.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm font-medium rounded-full">
                    {selectedItem.variant || 'glTF-Binary'}
                  </span>
                  <span className="px-3 py-1 bg-green-600/20 text-green-300 text-sm font-medium rounded-full">
                    Scale: {selectedItem.scale}x
                  </span>
                </div>
              </div>
              <button
                className="absolute top-4 right-4 w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
                onClick={() => setSelectedItem(null)}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}