"use client"

import React, { useEffect, useRef, useState, Suspense } from 'react'
import * as THREE from 'three'

interface SimpleModelViewerProps {
  modelName: string
  className?: string
  width?: string | number
  height?: string | number
  scale?: number
  autoRotate?: boolean
  onLoad?: () => void
  onError?: (error: Error) => void
}

// Simple GLTFModel component that loads a glTF model
function GLTFModel({ 
  modelName, 
  scale = 1, 
  autoRotate = false,
  onLoad 
}: { 
  modelName: string
  scale: number
  autoRotate: boolean
  onLoad?: () => void 
}) {
  const meshRef = useRef<THREE.Group>(null)
  const [model, setModel] = useState<THREE.Group | null>(null)

  useEffect(() => {
    let isMounted = true
    
    const loadModel = async () => {
      try {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
        
        const loader = new GLTFLoader()
        
        // Try to load the glTF model from the 2.0 directory
        const modelPath = `/2.0/${modelName}/glTF-Binary/${modelName}.glb`
        
        loader.load(
          modelPath,
          (gltf) => {
            if (!isMounted) return
            
            const scene = gltf.scene.clone()
            
            // Center and scale the model
            const box = new THREE.Box3().setFromObject(scene)
            const center = box.getCenter(new THREE.Vector3())
            const size = box.getSize(new THREE.Vector3())
            
            // Scale to fit within reasonable bounds
            const maxDim = Math.max(size.x, size.y, size.z)
            const targetScale = scale / maxDim
            scene.scale.setScalar(targetScale)
            
            // Center the model
            scene.position.sub(center.multiplyScalar(targetScale))
            
            setModel(scene)
            onLoad?.()
          },
          (progress) => {
            // Loading progress
            console.log(`Loading ${modelName}:`, (progress.loaded / progress.total * 100) + '%')
          },
          (error) => {
            if (!isMounted) return
            console.error(`Error loading ${modelName}:`, error)
            
            // Fallback to a simple colored cube
            const geometry = new THREE.BoxGeometry(scale, scale, scale)
            const material = new THREE.MeshStandardMaterial({ 
              color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5)
            })
            const cube = new THREE.Mesh(geometry, material)
            
            const fallbackGroup = new THREE.Group()
            fallbackGroup.add(cube)
            setModel(fallbackGroup)
            
            onLoad?.()
          }
        )
      } catch (err) {
        console.error('Failed to load GLTFLoader:', err)
        
        // Create a simple fallback cube
        const geometry = new THREE.BoxGeometry(scale, scale, scale)
        const material = new THREE.MeshStandardMaterial({ color: 'orange' })
        const cube = new THREE.Mesh(geometry, material)
        
        const fallbackGroup = new THREE.Group()
        fallbackGroup.add(cube)
        setModel(fallbackGroup)
        
        onLoad?.()
      }
    }

    loadModel()
    
    return () => {
      isMounted = false
    }
  }, [modelName, scale, onLoad])

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate || !meshRef.current) return
    
    let animationId: number
    
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01
      }
      animationId = requestAnimationFrame(animate)
    }
    
    animationId = requestAnimationFrame(animate)
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [autoRotate, model])

  if (!model) return null

  return <primitive ref={meshRef} object={model} />
}

export default function SimpleModelViewer({
  modelName,
  className = '',
  width = '100%',
  height = '100%',
  scale = 1,
  autoRotate = true,
  onLoad,
  onError
}: SimpleModelViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [Canvas, setCanvas] = useState<any>(null)

  useEffect(() => {
    const loadCanvas = async () => {
      try {
        const { Canvas: CanvasComponent } = await import('@react-three/fiber')
        setCanvas(() => CanvasComponent)
      } catch (err) {
        console.error('Failed to load Canvas:', err)
        setError(err instanceof Error ? err.message : 'Failed to load 3D canvas')
        onError?.(err instanceof Error ? err : new Error('Failed to load 3D canvas'))
      }
    }

    loadCanvas()
  }, [onError])

  const canvasStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  const handleModelLoad = () => {
    setLoading(false)
    onLoad?.()
  }

  if (error) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center ${className}`} style={canvasStyle}>
        <div className="text-center text-red-400">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-sm font-medium">Failed to load 3D viewer</div>
          <div className="text-xs opacity-75 mt-1">{modelName}</div>
        </div>
      </div>
    )
  }

  if (!Canvas) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center ${className}`} style={canvasStyle}>
        <div className="text-center text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <div className="text-sm font-medium">Loading 3D Viewer...</div>
          <div className="text-xs opacity-75 mt-1">Preparing {modelName}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`} style={canvasStyle}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
          <div className="text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <div className="text-sm font-medium">Loading {modelName}...</div>
          </div>
        </div>
      )}
      
      <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} />
        
        <Suspense fallback={null}>
          <GLTFModel
            modelName={modelName}
            scale={scale}
            autoRotate={autoRotate}
            onLoad={handleModelLoad}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}