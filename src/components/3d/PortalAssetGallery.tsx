"use client"

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { gsap } from 'gsap'

interface AssetConfig {
  path: string
  scale: number
  emissive?: boolean
  rotate?: boolean
  float?: boolean
  glowColor?: string
}

// Project-specific asset configurations
const PROJECT_ASSETS: Record<string, AssetConfig[]> = {
  'hackathon-ai-winner': [
    { path: '/2.0/2CylinderEngine/glTF-Binary/2CylinderEngine.glb', scale: 0.5, rotate: true, glowColor: '#06b6d4' },
    { path: '/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb', scale: 0.3, rotate: true, float: true },
    { path: '/2.0/AnimatedMorphCube/glTF/AnimatedMorphCube.gltf', scale: 0.4, rotate: true }
  ],
  'yc-saas-platform': [
    { path: '/2.0/IridescenceLamp/glTF-Binary/IridescenceLamp.glb', scale: 0.4, emissive: true, float: true },
    { path: '/2.0/BoomBox/glTF-Binary/BoomBox.glb', scale: 0.5, rotate: true },
    { path: '/2.0/FlightHelmet/glTF/FlightHelmet.gltf', scale: 0.4, rotate: true }
  ],
  'ai-portfolio': [
    { path: '/2.0/IridescenceSuzanne/glTF-Binary/IridescenceSuzanne.glb', scale: 0.5, rotate: true, glowColor: '#8b5cf6' },
    { path: '/2.0/Fox/glTF-Binary/Fox.glb', scale: 0.01, rotate: true, float: true },
    { path: '/2.0/DragonAttenuation/glTF-Binary/DragonAttenuation.glb', scale: 0.3, rotate: true }
  ],
  'spacetime-visualization': [
    { path: '/2.0/AnimatedMorphCube/glTF/AnimatedMorphCube.gltf', scale: 0.5, rotate: true, glowColor: '#3b82f6' },
    { path: '/2.0/IridescenceLamp/glTF-Binary/IridescenceLamp.glb', scale: 0.4, emissive: true },
    { path: '/2.0/Duck/glTF-Binary/Duck.glb', scale: 0.4, rotate: true, float: true }
  ],
  'ai-challenge-dashboard': [
    { path: '/2.0/2CylinderEngine/glTF-Binary/2CylinderEngine.glb', scale: 0.4, rotate: true },
    { path: '/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb', scale: 0.5, rotate: true, glowColor: '#10b981' },
    { path: '/2.0/BoomBox/glTF-Binary/BoomBox.glb', scale: 0.4, float: true }
  ],
  'e-commerce-redesign': [
    { path: '/2.0/WaterBottle/glTF-Binary/WaterBottle.glb', scale: 0.5, rotate: true, float: true },
    { path: '/2.0/Lantern/glTF-Binary/Lantern.glb', scale: 0.4, emissive: true, glowColor: '#ec4899' },
    { path: '/2.0/BarramundiFish/glTF-Binary/BarramundiFish.glb', scale: 0.3, rotate: true }
  ]
}

interface PortalAssetGalleryProps {
  projectId: string
  isActive: boolean
  primaryColor: string
  secondaryColor: string
}

export default function PortalAssetGallery({ 
  projectId, 
  isActive,
  primaryColor,
  secondaryColor
}: PortalAssetGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    composer: EffectComposer
    controls: OrbitControls
    models: THREE.Object3D[]
    mixers: THREE.AnimationMixer[]
  } | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!containerRef.current || !isActive) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000000, 10, 50)

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 10)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    containerRef.current.appendChild(renderer.domElement)

    // Post-processing
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight),
      1.2, // strength
      0.5, // radius
      0.8  // threshold
    )
    composer.addPass(bloomPass)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    controls.minPolarAngle = Math.PI / 4
    controls.maxPolarAngle = Math.PI * 3 / 4

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Dynamic colored lights
    const colorLight1 = new THREE.PointLight(primaryColor, 2, 20)
    colorLight1.position.set(5, 0, 5)
    scene.add(colorLight1)

    const colorLight2 = new THREE.PointLight(secondaryColor, 2, 20)
    colorLight2.position.set(-5, 0, -5)
    scene.add(colorLight2)

    // Create orbital paths
    const orbitRadius = 5
    const models: THREE.Object3D[] = []
    const mixers: THREE.AnimationMixer[] = []

    // Load assets
    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    loader.setDRACOLoader(dracoLoader)

    const assets = PROJECT_ASSETS[projectId] || PROJECT_ASSETS['ai-portfolio']
    
    assets.forEach((asset, index) => {
      const angle = (index / assets.length) * Math.PI * 2
      const x = Math.cos(angle) * orbitRadius
      const z = Math.sin(angle) * orbitRadius
      const y = Math.sin(angle * 2) * 1

      loader.load(
        asset.path,
        (gltf) => {
          const model = gltf.scene
          
          // Center and scale
          const box = new THREE.Box3().setFromObject(model)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z)
          const targetScale = 2 * asset.scale // Make models more visible
          const scale = targetScale / maxDim
          
          model.scale.multiplyScalar(scale)
          // Center the model
          model.position.x = x - center.x * scale
          model.position.y = y - center.y * scale
          model.position.z = z - center.z * scale

          // Apply materials
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (asset.emissive) {
                child.material.emissive = new THREE.Color(asset.glowColor || primaryColor)
                child.material.emissiveIntensity = 0.5
              }
              
              // Add glass-like properties for certain models
              if (asset.path.includes('Iridescence') || asset.path.includes('Dragon')) {
                child.material.transparent = true
                child.material.opacity = 0.8
                child.material.side = THREE.DoubleSide
              }
            }
          })

          // Setup animations if present
          if (gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model)
            gltf.animations.forEach(clip => {
              mixer.clipAction(clip).play()
            })
            mixers.push(mixer)
          }

          scene.add(model)
          models.push(model)

          // Entrance animation
          model.scale.set(0, 0, 0)
          gsap.to(model.scale, {
            x: scale,
            y: scale,
            z: scale,
            duration: 1,
            delay: index * 0.2,
            ease: "elastic.out(1, 0.5)"
          })
        },
        (progress) => {
          // Progress callback
          console.log(`Loading ${asset.path}: ${(progress.loaded / progress.total * 100).toFixed(0)}%`)
        },
        (error) => {
          console.warn(`Failed to load ${asset.path}:`, error)
          
          // Create a placeholder geometry if model fails to load
          const fallbackGeometry = new THREE.IcosahedronGeometry(1, 1)
          const fallbackMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(asset.glowColor || primaryColor),
            emissive: new THREE.Color(asset.glowColor || primaryColor),
            emissiveIntensity: 0.3,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.7
          })
          const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial)
          fallbackMesh.position.set(x, y, z)
          fallbackMesh.scale.setScalar(asset.scale)
          
          scene.add(fallbackMesh)
          models.push(fallbackMesh)
        }
      )
    })

    // Add particle field
    const particlesGeometry = new THREE.BufferGeometry()
    const particleCount = 500
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    const color1 = new THREE.Color(primaryColor)
    const color2 = new THREE.Color(secondaryColor)
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 8 + Math.random() * 12
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos((Math.random() * 2) - 1)
      
      positions[i] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i + 2] = radius * Math.cos(phi)
      
      const mixFactor = Math.random()
      const mixedColor = color1.clone().lerp(color2, mixFactor)
      colors[i] = mixedColor.r
      colors[i + 1] = mixedColor.g
      colors[i + 2] = mixedColor.b
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    sceneRef.current = {
      scene,
      camera,
      renderer,
      composer,
      controls,
      models,
      mixers
    }

    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      
      if (sceneRef.current) {
        const delta = clock.getDelta()
        const elapsedTime = clock.getElapsedTime()
        
        // Update mixers
        sceneRef.current.mixers.forEach(mixer => mixer.update(delta))
        
        // Animate models
        sceneRef.current.models.forEach((model, index) => {
          const asset = assets[index]
          if (!asset) return
          
          // Orbital motion
          const angle = elapsedTime * 0.2 + (index / assets.length) * Math.PI * 2
          const radius = 5 + Math.sin(elapsedTime * 0.5 + index) * 0.5
          
          model.position.x = Math.cos(angle) * radius
          model.position.z = Math.sin(angle) * radius
          
          if (asset.float) {
            model.position.y = Math.sin(elapsedTime * 2 + index) * 0.5
          }
          
          if (asset.rotate) {
            model.rotation.y = elapsedTime * 0.5
            model.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2
          }
        })
        
        // Animate lights
        colorLight1.position.x = Math.cos(elapsedTime * 0.5) * 8
        colorLight1.position.z = Math.sin(elapsedTime * 0.5) * 8
        colorLight1.position.y = Math.sin(elapsedTime) * 2
        
        colorLight2.position.x = Math.sin(elapsedTime * 0.5) * 8
        colorLight2.position.z = Math.cos(elapsedTime * 0.5) * 8
        colorLight2.position.y = Math.cos(elapsedTime) * 2
        
        // Rotate particles
        particles.rotation.y = elapsedTime * 0.05
        particles.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1
        
        sceneRef.current.controls.update()
        sceneRef.current.composer.render()
      }
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!sceneRef.current || !containerRef.current) return
      
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      
      sceneRef.current.camera.aspect = width / height
      sceneRef.current.camera.updateProjectionMatrix()
      sceneRef.current.renderer.setSize(width, height)
      sceneRef.current.composer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      if (sceneRef.current) {
        sceneRef.current.renderer.dispose()
        containerRef.current?.removeChild(sceneRef.current.renderer.domElement)
      }
    }
  }, [isActive, projectId, primaryColor, secondaryColor])

  if (!isActive) return null

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  )
}