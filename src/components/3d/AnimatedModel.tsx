"use client"

import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { useModels } from '@/contexts/ModelContext'
import { getAnimationConfig } from '@/lib/performance-config'

interface AnimatedModelProps {
  modelName: string
  variant?: string
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  animationType?: 'float' | 'rotate' | 'pulse' | 'hover' | 'custom'
  speed?: number
  intensity?: number
  autoPlay?: boolean
  onLoad?: () => void
}

export default function AnimatedModel({
  modelName,
  variant = 'glTF-Binary',
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  animationType = 'float',
  speed = 1,
  intensity = 1,
  autoPlay = true,
  onLoad
}: AnimatedModelProps) {
  const meshRef = useRef<THREE.Group>(null)
  const { cloneModel } = useModels()
  const [model, setModel] = React.useState<THREE.Group | null>(null)
  const animationConfig = getAnimationConfig()

  // Animation state
  const baseY = position[1]
  const timeRef = useRef(0)

  useEffect(() => {
    const cloned = cloneModel(modelName, variant)
    if (cloned) {
      setModel(cloned)
      onLoad?.()
    }
  }, [modelName, variant, cloneModel, onLoad])

  // Custom animations using useFrame
  useFrame((state, delta) => {
    if (!meshRef.current || !animationConfig.enabled) return

    timeRef.current += delta * speed

    switch (animationType) {
      case 'float':
        meshRef.current.position.y = baseY + Math.sin(timeRef.current * 2) * 0.1 * intensity
        meshRef.current.rotation.y += delta * 0.5 * speed
        break

      case 'rotate':
        meshRef.current.rotation.y += delta * 2 * speed
        break

      case 'pulse':
        const pulseScale = scale + Math.sin(timeRef.current * 4) * 0.1 * intensity
        meshRef.current.scale.setScalar(pulseScale)
        break

      case 'hover':
        meshRef.current.position.y = baseY + Math.sin(timeRef.current * 1.5) * 0.05 * intensity
        meshRef.current.rotation.x = Math.sin(timeRef.current * 1.2) * 0.1 * intensity
        meshRef.current.rotation.z = Math.cos(timeRef.current * 0.8) * 0.05 * intensity
        break

      case 'custom':
        // Advanced animation combining multiple effects
        meshRef.current.position.y = baseY + Math.sin(timeRef.current * 1.8) * 0.08 * intensity
        meshRef.current.rotation.y += delta * 0.3 * speed
        meshRef.current.rotation.x = Math.sin(timeRef.current * 2.1) * 0.15 * intensity
        const customScale = scale + Math.sin(timeRef.current * 3) * 0.05 * intensity
        meshRef.current.scale.setScalar(customScale)
        break
    }
  })

  if (!model) {
    return null
  }

  // Wrap with Float component for enhanced floating animations
  if (animationType === 'float' && animationConfig.quality !== 'low') {
    return (
      <Float
        speed={speed * 2}
        rotationIntensity={intensity * 0.3}
        floatIntensity={intensity * 0.2}
        enabled={autoPlay && animationConfig.enabled}
      >
        <primitive
          ref={meshRef}
          object={model}
          scale={scale}
          position={position}
          rotation={rotation}
        />
      </Float>
    )
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

// Preset animation configurations
export const AnimationPresets = {
  hero: {
    animationType: 'custom' as const,
    speed: 0.8,
    intensity: 1,
    autoPlay: true
  },
  showcase: {
    animationType: 'float' as const,
    speed: 1,
    intensity: 0.8,
    autoPlay: true
  },
  featured: {
    animationType: 'hover' as const,
    speed: 1.2,
    intensity: 1.2,
    autoPlay: true
  },
  subtle: {
    animationType: 'rotate' as const,
    speed: 0.3,
    intensity: 0.5,
    autoPlay: true
  },
  static: {
    animationType: 'rotate' as const,
    speed: 0,
    intensity: 0,
    autoPlay: false
  }
}