"use client"

import React, { useEffect, useState } from 'react'

export default function IsolatedTestCanvas() {
  const [CanvasComponent, setCanvasComponent] = useState<any>(null)

  useEffect(() => {
    // Only import React Three Fiber components on the client side
    const loadCanvas = async () => {
      try {
        const { Canvas } = await import('@react-three/fiber')
        
        const TestMesh = () => (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="orange" />
          </mesh>
        )

        const CanvasWithScene = () => (
          <div className="w-full h-64 bg-gray-900">
            <Canvas>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <TestMesh />
            </Canvas>
          </div>
        )

        setCanvasComponent(() => CanvasWithScene)
      } catch (error) {
        console.error('Failed to load 3D canvas:', error)
        setCanvasComponent(() => () => (
          <div className="w-full h-64 bg-red-900 rounded-lg flex items-center justify-center">
            <span className="text-red-300">Failed to load 3D canvas</span>
          </div>
        ))
      }
    }

    loadCanvas()
  }, [])

  if (!CanvasComponent) {
    return (
      <div className="w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-gray-400">Loading 3D Canvas...</div>
      </div>
    )
  }

  return <CanvasComponent />
}