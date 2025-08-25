"use client"

import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  ContactShadows,
  Stage,
  PresentationControls,
  Html,
  useProgress,
  Bounds,
  useBounds
} from '@react-three/drei'
import * as THREE from 'three'
import { useModels } from '@/contexts/ModelContext'

export interface ModelViewerProps {
  modelName: string
  variant?: string
  autoRotate?: boolean
  enableControls?: boolean
  environment?: string
  showShadows?: boolean
  className?: string
  fallback?: React.ReactNode
  onModelLoad?: () => void
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}

function LoadingSpinner() {
  const { progress, active } = useProgress()
  
  return (
    <Html center>
      <div className="flex flex-col items-center space-y-2">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <div className="text-white text-sm font-medium">
          {progress}% loaded
        </div>
      </div>
    </Html>
  )
}

interface ModelProps {
  modelName: string
  variant: string
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  onLoad?: () => void
}

function Model({ modelName, variant, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], onLoad }: ModelProps) {
  const meshRef = useRef<THREE.Group>(null)
  const { getModel, cloneModel } = useModels()
  const [model, setModel] = useState<THREE.Group | null>(null)
  const [error, setError] = useState<string | null>(null)
  const bounds = useBounds()

  useEffect(() => {
    const loadedModel = getModel(modelName, variant)
    if (loadedModel) {
      const cloned = cloneModel(modelName, variant)
      if (cloned) {
        setModel(cloned)
        onLoad?.()
        // Focus camera on the model
        setTimeout(() => {
          bounds.refresh(cloned).fit()
        }, 100)
      } else {
        setError(`Failed to clone model: ${modelName}`)
      }
    } else {
      setError(`Model not found: ${modelName}`)
    }
  }, [modelName, variant, getModel, cloneModel, onLoad, bounds])

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.05
      
      // Optional rotation animation
      meshRef.current.rotation.y += 0.005
    }
  })

  if (error) {
    return (
      <Html center>
        <div className="text-red-400 text-center">
          <div className="text-lg font-semibold">Failed to load model</div>
          <div className="text-sm opacity-75">{error}</div>
        </div>
      </Html>
    )
  }

  if (!model) {
    return <LoadingSpinner />
  }

  return (
    <primitive
      ref={meshRef}
      object={model}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  )
}

export default function ModelViewer({
  modelName,
  variant = 'glTF-Binary',
  autoRotate = true,
  enableControls = true,
  environment = 'city',
  showShadows = true,
  className = '',
  fallback,
  onModelLoad,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0]
}: ModelViewerProps) {
  const [modelLoaded, setModelLoaded] = useState(false)

  const handleModelLoad = () => {
    setModelLoaded(true)
    onModelLoad?.()
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [2, 2, 2], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance" 
        }}
        shadows={showShadows}
        dpr={[1, 2]}
      >
        <color attach="background" args={['transparent']} />
        
        <Bounds fit clip observe>
          {enableControls ? (
            <PresentationControls
              global
              config={{ mass: 2, tension: 500 }}
              snap={{ mass: 4, tension: 1500 }}
              rotation={[0, 0, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
            >
              <Model
                modelName={modelName}
                variant={variant}
                scale={scale}
                position={position}
                rotation={rotation}
                onLoad={handleModelLoad}
              />
            </PresentationControls>
          ) : (
            <Model
              modelName={modelName}
              variant={variant}
              scale={scale}
              position={position}
              rotation={rotation}
              onLoad={handleModelLoad}
            />
          )}
        </Bounds>

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow={showShadows}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <spotLight
          position={[-10, -10, -10]}
          intensity={0.3}
          angle={0.3}
          penumbra={1}
          castShadow={showShadows}
        />

        {/* Environment */}
        <Environment preset={environment as any} background={false} />

        {/* Shadows */}
        {showShadows && (
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={20}
            blur={1}
            far={2}
          />
        )}

        {/* Controls */}
        {autoRotate && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        )}
      </Canvas>

      {!modelLoaded && fallback && (
        <div className="absolute inset-0 flex items-center justify-center">
          {fallback}
        </div>
      )}
    </div>
  )
}