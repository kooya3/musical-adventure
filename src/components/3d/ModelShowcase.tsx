"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AdvancedModelViewer from './AdvancedModelViewer'
import { 
  ModelCategory, 
  MODEL_COLLECTIONS, 
  initializeModelRegistry, 
  getRecommendedModels 
} from '@/lib/model-registry'
import { LoadedModel, LoadingProgress } from '@/lib/advanced-gltf-loader'

interface ModelShowcaseProps {
  category?: ModelCategory
  title?: string
  subtitle?: string
  columns?: 1 | 2 | 3 | 4
  className?: string
  showFilter?: boolean
  showStats?: boolean
  maxModels?: number
}

interface ModelCard {
  name: string
  description: string
  category: ModelCategory
  isLoading: boolean
  loadProgress?: LoadingProgress
}

const categoryDisplayNames: Record<ModelCategory, string> = {
  [ModelCategory.HERO]: 'Hero Models',
  [ModelCategory.TECHNICAL]: 'Technical Demos',
  [ModelCategory.ARTISTIC]: 'Artistic Showcase',
  [ModelCategory.ANIMATED]: 'Animated Models',
  [ModelCategory.MATERIAL]: 'Material Studies',
  [ModelCategory.SIMPLE]: 'Simple Models',
  [ModelCategory.ADVANCED]: 'Advanced Features'
}

const categoryDescriptions: Record<ModelCategory, string> = {
  [ModelCategory.HERO]: 'Premium quality models perfect for main showcases',
  [ModelCategory.TECHNICAL]: 'Engineering and mechanical demonstrations',
  [ModelCategory.ARTISTIC]: 'Creative and visually stunning models',
  [ModelCategory.ANIMATED]: 'Models with built-in animations and movements',
  [ModelCategory.MATERIAL]: 'Showcasing advanced material and shader techniques',
  [ModelCategory.SIMPLE]: 'Basic models perfect for testing and learning',
  [ModelCategory.ADVANCED]: 'Complex models demonstrating cutting-edge features'
}

export default function ModelShowcase({
  category = ModelCategory.HERO,
  title,
  subtitle,
  columns = 3,
  className = '',
  showFilter = true,
  showStats = false,
  maxModels = 12
}: ModelShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory>(category)
  const [availableModels, setAvailableModels] = useState<ModelCard[]>([])
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingProgress>>(new Map())

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeModelRegistry()
        setIsInitialized(true)
        loadModelsForCategory(selectedCategory)
      } catch (error) {
        console.error('Failed to initialize model showcase:', error)
      }
    }

    initialize()
  }, [])

  useEffect(() => {
    if (isInitialized) {
      loadModelsForCategory(selectedCategory)
    }
  }, [selectedCategory, isInitialized])

  const loadModelsForCategory = (cat: ModelCategory) => {
    const recommended = getRecommendedModels(cat, undefined, maxModels)
    
    const modelCards: ModelCard[] = recommended.map(model => ({
      name: model.name,
      description: model.description || `3D model: ${model.name}`,
      category: model.category || cat,
      isLoading: false
    }))

    setAvailableModels(modelCards)
  }

  const handleModelProgress = (modelName: string, progress: LoadingProgress) => {
    setLoadingStates(prev => new Map(prev.set(modelName, progress)))
    
    setAvailableModels(prev => 
      prev.map(model => 
        model.name === modelName 
          ? { ...model, isLoading: progress.progress < 100, loadProgress: progress }
          : model
      )
    )
  }

  const handleModelLoad = (modelName: string, model: LoadedModel) => {
    setAvailableModels(prev => 
      prev.map(m => 
        m.name === modelName 
          ? { ...m, isLoading: false }
          : m
      )
    )
    
    setLoadingStates(prev => {
      const newMap = new Map(prev)
      newMap.delete(modelName)
      return newMap
    })
  }

  const getGridClassName = () => {
    const baseClass = 'grid gap-6'
    switch (columns) {
      case 1: return `${baseClass} grid-cols-1`
      case 2: return `${baseClass} grid-cols-1 lg:grid-cols-2`
      case 3: return `${baseClass} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
      case 4: return `${baseClass} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
      default: return `${baseClass} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
    }
  }

  const displayTitle = title || categoryDisplayNames[selectedCategory]
  const displaySubtitle = subtitle || categoryDescriptions[selectedCategory]

  if (!isInitialized) {
    return (
      <div className={`p-8 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Initializing 3D Model Showcase...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {displayTitle}
        </motion.h2>
        
        <motion.p
          className="text-gray-400 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {displaySubtitle}
        </motion.p>
      </div>

      {/* Category Filter */}
      {showFilter && (
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {Object.entries(categoryDisplayNames).map(([cat, displayName]) => {
            const categoryKey = cat as ModelCategory
            const isActive = categoryKey === selectedCategory
            
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(categoryKey)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
              >
                {displayName}
              </button>
            )
          })}
        </motion.div>
      )}

      {/* Model Grid */}
      <motion.div
        className={getGridClassName()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {availableModels.map((model, index) => (
            <motion.div
              key={model.name}
              className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedModel(model.name)}
            >
              {/* 3D Model Viewer */}
              <div className="relative h-64 md:h-80">
                <AdvancedModelViewer
                  modelName={model.name}
                  environment="studio"
                  enableControls={false}
                  autoRotate={!model.isLoading}
                  autoRotateSpeed={1}
                  showStats={showStats}
                  enableShadows={true}
                  className="w-full h-full"
                  onProgress={(progress) => handleModelProgress(model.name, progress)}
                  onLoad={(loadedModel) => handleModelLoad(model.name, loadedModel)}
                />
                
                {/* Loading Overlay */}
                {model.isLoading && model.loadProgress && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <div className="text-white text-sm">
                        {Math.round(model.loadProgress.progress)}%
                      </div>
                    </div>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    View Details
                  </button>
                </div>
              </div>

              {/* Model Info */}
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {model.name}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {model.description}
                </p>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                    {categoryDisplayNames[model.category]}
                  </span>
                  
                  {loadingStates.has(model.name) && (
                    <div className="w-16 bg-gray-700 rounded-full h-1">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${loadingStates.get(model.name)?.progress || 0}%` 
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Model Count Info */}
      <motion.div
        className="text-center text-gray-400 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        Showing {availableModels.length} models from the {categoryDisplayNames[selectedCategory].toLowerCase()} collection
      </motion.div>
    </div>
  )
}