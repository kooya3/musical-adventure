"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import * as THREE from 'three'
import { modelLoader, ModelConfig, LoadedModel, PORTFOLIO_MODELS } from '@/lib/gltf-loader'

export interface ModelState {
  isLoading: boolean
  loadedModels: Map<string, LoadedModel>
  loadingProgress: Map<string, number>
  errors: Map<string, Error>
  totalModels: number
  loadedCount: number
}

type ModelAction =
  | { type: 'START_LOADING'; payload: { totalModels: number } }
  | { type: 'MODEL_PROGRESS'; payload: { modelName: string; progress: number } }
  | { type: 'MODEL_LOADED'; payload: { modelName: string; model: LoadedModel } }
  | { type: 'MODEL_ERROR'; payload: { modelName: string; error: Error } }
  | { type: 'LOADING_COMPLETE' }
  | { type: 'RESET' }

const initialState: ModelState = {
  isLoading: false,
  loadedModels: new Map(),
  loadingProgress: new Map(),
  errors: new Map(),
  totalModels: 0,
  loadedCount: 0
}

function modelReducer(state: ModelState, action: ModelAction): ModelState {
  switch (action.type) {
    case 'START_LOADING':
      return {
        ...state,
        isLoading: true,
        totalModels: action.payload.totalModels,
        loadedCount: 0,
        loadingProgress: new Map(),
        errors: new Map()
      }

    case 'MODEL_PROGRESS':
      const newProgress = new Map(state.loadingProgress)
      newProgress.set(action.payload.modelName, action.payload.progress)
      return {
        ...state,
        loadingProgress: newProgress
      }

    case 'MODEL_LOADED':
      const newLoadedModels = new Map(state.loadedModels)
      newLoadedModels.set(action.payload.modelName, action.payload.model)
      return {
        ...state,
        loadedModels: newLoadedModels,
        loadedCount: state.loadedCount + 1
      }

    case 'MODEL_ERROR':
      const newErrors = new Map(state.errors)
      newErrors.set(action.payload.modelName, action.payload.error)
      return {
        ...state,
        errors: newErrors
      }

    case 'LOADING_COMPLETE':
      return {
        ...state,
        isLoading: false
      }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

export interface ModelContextValue {
  state: ModelState
  loadModels: (configs?: ModelConfig[]) => Promise<void>
  getModel: (name: string, variant?: string) => LoadedModel | null
  cloneModel: (name: string, variant?: string) => THREE.Group | null
  preloadEssentialModels: () => Promise<void>
  reset: () => void
}

const ModelContext = createContext<ModelContextValue | null>(null)

export function useModels(): ModelContextValue {
  const context = useContext(ModelContext)
  if (!context) {
    throw new Error('useModels must be used within a ModelProvider')
  }
  return context
}

interface ModelProviderProps {
  children: ReactNode
  autoLoad?: boolean
  models?: ModelConfig[]
}

export function ModelProvider({ 
  children, 
  autoLoad = true,
  models = PORTFOLIO_MODELS 
}: ModelProviderProps) {
  const [state, dispatch] = useReducer(modelReducer, initialState)

  useEffect(() => {
    // Set up model loader callbacks
    modelLoader.onLoadProgress = (modelName: string, loaded: number, total: number) => {
      const progress = total > 0 ? (loaded / total) * 100 : 0
      dispatch({ type: 'MODEL_PROGRESS', payload: { modelName, progress } })
    }

    modelLoader.onLoadComplete = (modelName: string, model: LoadedModel) => {
      dispatch({ type: 'MODEL_LOADED', payload: { modelName, model } })
    }

    modelLoader.onLoadError = (modelName: string, error: Error) => {
      dispatch({ type: 'MODEL_ERROR', payload: { modelName, error } })
    }

    return () => {
      // Cleanup
      modelLoader.onLoadProgress = undefined
      modelLoader.onLoadComplete = undefined
      modelLoader.onLoadError = undefined
    }
  }, [])

  useEffect(() => {
    if (autoLoad) {
      preloadEssentialModels()
    }
  }, [autoLoad])

  const loadModels = async (configs: ModelConfig[] = models): Promise<void> => {
    dispatch({ type: 'START_LOADING', payload: { totalModels: configs.length } })

    try {
      await modelLoader.loadModels(configs)
      dispatch({ type: 'LOADING_COMPLETE' })
    } catch (error) {
      console.error('Failed to load models:', error)
      dispatch({ type: 'LOADING_COMPLETE' })
    }
  }

  const preloadEssentialModels = async (): Promise<void> => {
    const essentialModels = models.filter(model => model.preload)
    if (essentialModels.length > 0) {
      await loadModels(essentialModels)
    }
  }

  const getModel = (name: string, variant: string = 'glTF-Binary'): LoadedModel | null => {
    return modelLoader.getModel(name, variant)
  }

  const cloneModel = (name: string, variant: string = 'glTF-Binary'): THREE.Group | null => {
    return modelLoader.cloneModel(name, variant)
  }

  const reset = (): void => {
    modelLoader.disposeAll()
    dispatch({ type: 'RESET' })
  }

  const contextValue: ModelContextValue = {
    state,
    loadModels,
    getModel,
    cloneModel,
    preloadEssentialModels,
    reset
  }

  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  )
}

export default ModelProvider