"use client"

import React, { useEffect, useState } from 'react'
import SimpleFallbackScene from './SimpleFallbackScene'

export default function ClientOnlyEnhanced3DHeroScene() {
  const [SceneComponent, setSceneComponent] = useState<any>(null)

  useEffect(() => {
    const loadScene = async () => {
      try {
        const module = await import('./Enhanced3DHeroScene')
        setSceneComponent(() => module.default)
      } catch (error) {
        console.error('Failed to load 3D scene:', error)
        setSceneComponent(() => SimpleFallbackScene)
      }
    }

    loadScene()
  }, [])

  if (!SceneComponent) {
    return <SimpleFallbackScene />
  }

  return <SceneComponent />
}