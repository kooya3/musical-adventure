"use client"

import React from 'react'
import { Canvas } from '@react-three/fiber'

function TestMesh() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export default function TestCanvas() {
  return (
    <div className="w-full h-64 bg-gray-900">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <TestMesh />
      </Canvas>
    </div>
  )
}