"use client"

import React, { useEffect, useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Stage, PresentationControls } from '@react-three/drei'
import * as THREE from 'three'
import { advancedGLTFLoader, LoadedModel, LoadingProgress, LoadingStage } from '@/lib/advanced-gltf-loader'
import { initializeModelRegistry, ModelCategory } from '@/lib/model-registry'
import { getPerformanceConfig } from '@/lib/performance-config'

interface AdvancedModelViewerProps {
  modelName: string
  className?: string
  width?: string | number
  height?: string | number
  
  // Rendering options
  environment?: 'studio' | 'city' | 'forest' | 'night' | 'sunset' | 'dawn' | null
  enableShadows?: boolean
  shadowType?: 'contact' | 'soft' | 'basic'
  background?: string | null
  
  // Interaction
  enableControls?: boolean
  autoRotate?: boolean
  autoRotateSpeed?: number
  enableZoom?: boolean
  enablePan?: boolean
  
  // Animation
  playAnimations?: boolean
  animationLoop?: boolean
  
  // Performance
  pixelRatio?: number | [number, number]
  antialias?: boolean
  
  // Callbacks
  onLoad?: (model: LoadedModel) => void
  onProgress?: (progress: LoadingProgress) => void
  onError?: (error: Error) => void
  onClick?: (event: any) => void
  onHover?: (event: any) => void
  
  // Display
  showStats?: boolean
  showWireframe?: boolean
  scale?: number | [number, number, number]
  position?: [number, number, number]
  rotation?: [number, number, number]
}

interface ModelDisplayProps {
  model: LoadedModel
  scale?: number | [number, number, number]
  position?: [number, number, number] 
  rotation?: [number, number, number]
  playAnimations?: boolean
  showWireframe?: boolean
  onClick?: (event: any) => void
  onHover?: (event: any) => void
}

function ModelDisplay({ 
  model, 
  scale = 1, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  playAnimations = true,
  showWireframe = false,
  onClick,
  onHover
}: ModelDisplayProps) {
  const groupRef = useRef<THREE.Group>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const { scene } = useThree()

  useEffect(() => {
    if (!groupRef.current || !model.scene) return

    // Clone the model scene
    const clonedScene = model.scene.clone()
    groupRef.current.add(clonedScene)

    // Setup animations
    if (model.animations.length > 0 && playAnimations) {
      mixerRef.current = new THREE.AnimationMixer(clonedScene)
      
      model.animations.forEach(clip => {
        const action = mixerRef.current!.clipAction(clip)
        action.play()
      })
    }

    // Apply wireframe mode
    if (showWireframe) {
      clonedScene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => {
              material.wireframe = true
            })
          } else {
            object.material.wireframe = true
          }
        }
      })
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
        mixerRef.current = null
      }
      if (groupRef.current) {
        groupRef.current.clear()
      }
    }
  }, [model, playAnimations, showWireframe])

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
  })

  const scaleArray = Array.isArray(scale) ? scale : [scale, scale, scale]

  return (
    <group 
      ref={groupRef}
      scale={scaleArray as [number, number, number]}
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={onHover}
    />
  )
}

function LoadingIndicator({ progress, modelName }: { progress: LoadingProgress; modelName: string }) {
  const getStageText = (stage: LoadingStage): string => {
    switch (stage) {
      case LoadingStage.INITIALIZING: return 'Preparing...'
      case LoadingStage.DOWNLOADING: return 'Downloading...'
      case LoadingStage.PARSING: return 'Processing...'
      case LoadingStage.PROCESSING: return 'Building scene...'
      case LoadingStage.OPTIMIZING: return 'Optimizing...'
      case LoadingStage.COMPLETE: return 'Complete!'
      case LoadingStage.ERROR: return 'Error occurred'
      default: return 'Loading...'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 text-white">
      <div className="w-16 h-16 relative">
        <div className="w-full h-full border-4 border-gray-600 border-t-blue-400 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-mono">
          {Math.round(progress.progress)}%
        </div>
      </div>
      
      <div className="text-center space-y-1">
        <div className="text-lg font-medium">{modelName}</div>
        <div className="text-sm text-gray-300">{getStageText(progress.stage)}</div>
      </div>
      
      <div className="w-48 bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
          style={{ width: `${progress.progress}%` }}
        />
      </div>
      
      {progress.total > 0 && (
        <div className="text-xs text-gray-400 font-mono">
          {Math.round(progress.loaded / 1024)}KB / {Math.round(progress.total / 1024)}KB
        </div>
      )}
    </div>
  )
}

function ErrorDisplay({ error, modelName }: { error: Error; modelName: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 text-white">
      <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
        <span className="text-2xl">⚠</span>
      </div>
      
      <div className="text-center space-y-2">
        <div className="text-lg font-medium text-red-400">Failed to load {modelName}</div>
        <div className="text-sm text-gray-300 max-w-sm">{error.message}</div>
      </div>
      
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}

function ModelStats({ model }: { model: LoadedModel }) {
  return (
    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-gray-600 rounded-lg p-3 text-white text-xs font-mono z-10">
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span>Model:</span>
          <span className="text-blue-300">{model.model.name}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Variant:</span>
          <span className="text-green-300">{model.variant}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Polygons:</span>
          <span className="text-yellow-300">{model.polyCount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Textures:</span>
          <span className="text-purple-300">{model.textureCount}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Load Time:</span>
          <span className="text-cyan-300">{Math.round(model.loadTime)}ms</span>
        </div>
        {model.animations.length > 0 && (
          <div className="flex justify-between gap-4">
            <span>Animations:</span>
            <span className="text-orange-300">{model.animations.length}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdvancedModelViewer({
  modelName,
  className = '',
  width = '100%',
  height = '100%',
  environment = 'studio',
  enableShadows = true,
  shadowType = 'contact',
  background = null,
  enableControls = true,
  autoRotate = false,
  autoRotateSpeed = 2,
  enableZoom = true,
  enablePan = true,
  playAnimations = true,
  animationLoop = true,
  pixelRatio,
  antialias,
  onLoad,
  onProgress,
  onError,
  onClick,
  onHover,
  showStats = false,
  showWireframe = false,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0]
}: AdvancedModelViewerProps) {
  const [model, setModel] = useState<LoadedModel | null>(null)
  const [loading, setLoading] = useState<LoadingProgress | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const performanceConfig = getPerformanceConfig()

  useEffect(() => {
    let mounted = true

    const loadModel = async () => {
      try {
        setError(null)
        setLoading({
          name: modelName,
          loaded: 0,
          total: 100,
          progress: 0,
          stage: LoadingStage.INITIALIZING
        })

        // Initialize registry first
        await initializeModelRegistry()

        const loadedModel = await advancedGLTFLoader.loadModel(modelName, {
          onProgress: (progress) => {
            if (mounted) {
              setLoading(progress)
              onProgress?.(progress)
            }
          }
        })

        if (mounted) {
          setModel(loadedModel)
          setLoading(null)
          onLoad?.(loadedModel)
        }
      } catch (err) {
        if (mounted) {
          const error = err instanceof Error ? err : new Error('Failed to load model')
          setError(error)
          setLoading(null)
          onError?.(error)
        }
      }
    }

    loadModel()

    return () => {
      mounted = false
    }
  }, [modelName, onLoad, onProgress, onError])

  const canvasStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  const effectivePixelRatio = pixelRatio || performanceConfig.dpr
  const effectiveAntialias = antialias !== undefined ? antialias : performanceConfig.antialias

  if (error) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`} style={canvasStyle}>
        <ErrorDisplay error={error} modelName={modelName} />
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`} style={canvasStyle}>
        <LoadingIndicator progress={loading} modelName={modelName} />
      </div>
    )
  }

  if (!model) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center ${className}`} style={canvasStyle}>
        <div className="text-white text-center">
          <div className="text-lg font-medium">No model loaded</div>
          <div className="text-sm text-gray-400">Model: {modelName}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`} style={canvasStyle}>
      {showStats && <ModelStats model={model} />}
      
      <Canvas
        dpr={effectivePixelRatio}
        gl={{ antialias: effectiveAntialias }}
        shadows={enableShadows}
        camera={{ position: [3, 3, 3], fov: 50 }}
      >
        {background && <color attach="background" args={[background]} />}
        
        <Suspense fallback={null}>
          {environment && <Environment preset={environment as any} background={false} />}
          
          <ModelDisplay
            model={model}
            scale={scale}
            position={position}
            rotation={rotation}
            playAnimations={playAnimations}
            showWireframe={showWireframe}
            onClick={onClick}
            onHover={onHover}
          />
          
          {enableShadows && shadowType === 'contact' && (
            <ContactShadows 
              position={[0, -1, 0]} 
              opacity={0.4} 
              scale={10} 
              blur={2} 
            />
          )}
          
          {enableControls && (
            <OrbitControls
              autoRotate={autoRotate}
              autoRotateSpeed={autoRotateSpeed}
              enableZoom={enableZoom}
              enablePan={enablePan}
              maxPolarAngle={Math.PI / 2}
              minDistance={2}
              maxDistance={10}
            />
          )}
          
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 10]} 
            intensity={1}
            castShadow={enableShadows && shadowType !== 'contact'}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}