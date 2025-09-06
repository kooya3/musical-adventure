"use client"

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { gsap } from 'gsap'

interface InteractiveModelSceneProps {
  modelName?: string
  className?: string
}

export default function InteractiveModelScene({ 
  modelName = 'BoomBox',
  className = '' 
}: InteractiveModelSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    model?: THREE.Object3D
    particles?: THREE.Points
    raycaster: THREE.Raycaster
    mouse: THREE.Vector2
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000000, 10, 50)

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 1, 4) // Optimal camera position for model viewing

    // Renderer setup with high quality settings
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
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    containerRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.enableZoom = true
    controls.minDistance = 2
    controls.maxDistance = 10
    controls.maxPolarAngle = Math.PI / 1.8

    // Raycaster for interaction
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      raycaster,
      mouse
    }

    // Sophisticated lighting setup
    const ambientLight = new THREE.AmbientLight(0x8b5cf6, 0.2)
    scene.add(ambientLight)

    // Key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2)
    keyLight.position.set(5, 10, 5)
    keyLight.castShadow = true
    keyLight.shadow.camera.near = 0.1
    keyLight.shadow.camera.far = 50
    keyLight.shadow.camera.left = -10
    keyLight.shadow.camera.right = 10
    keyLight.shadow.camera.top = 10
    keyLight.shadow.camera.bottom = -10
    keyLight.shadow.mapSize.width = 2048
    keyLight.shadow.mapSize.height = 2048
    scene.add(keyLight)

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x8b5cf6, 0.5)
    fillLight.position.set(-5, 5, -5)
    scene.add(fillLight)

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x00ffff, 0.8)
    rimLight.position.set(0, 5, -10)
    scene.add(rimLight)

    // Add floating particles
    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = 1000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30
      positions[i + 1] = Math.random() * 20 - 5
      positions[i + 2] = (Math.random() - 0.5) * 30

      // Purple to cyan gradient
      const color = new THREE.Color()
      color.setHSL(0.7 + Math.random() * 0.3, 1, 0.5)
      colors[i] = color.r
      colors[i + 1] = color.g
      colors[i + 2] = color.b
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.6
    })

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)
    if (sceneRef.current) sceneRef.current.particles = particles

    // Load model - check which format is available
    const loader = new GLTFLoader()
    
    // Models without glTF-Binary variant
    const modelsWithoutBinary = ['FlightHelmet']
    const useGltfFormat = modelsWithoutBinary.includes(modelName)
    
    const modelPath = useGltfFormat 
      ? `/2.0/${modelName}/glTF/${modelName}.gltf`
      : `/2.0/${modelName}/glTF-Binary/${modelName}.glb`

    const setupModel = (gltf: any) => {
      const model = gltf.scene
      
      // Center and scale model - ZOOM IN MORE
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 3 / maxDim // Perfect scale for model visibility
      
      model.scale.multiplyScalar(scale)
      model.position.sub(center.multiplyScalar(scale))
      model.position.y = 0 // Centered vertically

      // Enable shadows and enhance materials
      model.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          // Enhance materials with glow
          if (child.material) {
            child.material.envMapIntensity = 2
            // Add emissive glow to materials
            if (child.material.color) {
              child.material.emissive = new THREE.Color(0x8b5cf6)
              child.material.emissiveIntensity = 0.05
            }
            child.material.needsUpdate = true
          }
        }
      })

      scene.add(model)
      if (sceneRef.current) sceneRef.current.model = model

      // SUBTLE ENTRANCE ANIMATIONS
      // Smooth scale in
      gsap.from(model.scale, {
        duration: 1.5,
        x: 0.8,
        y: 0.8,
        z: 0.8,
        ease: "power2.out"
      })

      // Gentle rotation entrance
      gsap.from(model.rotation, {
        duration: 2,
        y: Math.PI * 0.5,
        ease: "power3.out"
      })

      // Smooth fade-in from below
      gsap.from(model.position, {
        duration: 1.8,
        y: -2,
        ease: "power2.out"
      })

      // Very subtle floating animation
      gsap.to(model.position, {
        y: 0.1,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })

      // Gentle continuous rotation
      gsap.to(model.rotation, {
        y: Math.PI * 2,
        duration: 60, // Much slower rotation
        repeat: -1,
        ease: "none"
      })

      setLoading(false)
    }

    loader.load(
      modelPath,
      setupModel,
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100
        setLoadingProgress(Math.round(percent))
      },
      (error) => {
        console.error('Model loading error:', error)
        // Try alternate format
        const fallbackPath = useGltfFormat
          ? `/2.0/${modelName}/glTF-Binary/${modelName}.glb`
          : `/2.0/${modelName}/glTF/${modelName}.gltf`
          
        loader.load(fallbackPath, setupModel, undefined, (fallbackError) => {
          console.error('Fallback loading error:', fallbackError)
          setLoading(false)
        })
      }
    )

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      if (!sceneRef.current) return
      
      const rect = containerRef.current!.getBoundingClientRect()
      sceneRef.current.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      sceneRef.current.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Subtle parallax effect
      if (sceneRef.current.model) {
        gsap.to(sceneRef.current.model.rotation, {
          x: sceneRef.current.mouse.y * 0.05, // Much more subtle
          y: sceneRef.current.mouse.x * 0.1,   // Much more subtle
          duration: 0.8,
          ease: "power2.out"
        })
      }
      
      // Move particles with mouse
      if (sceneRef.current.particles) {
        gsap.to(sceneRef.current.particles.rotation, {
          x: sceneRef.current.mouse.y * 0.1,
          z: sceneRef.current.mouse.x * 0.1,
          duration: 1
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      
      if (sceneRef.current) {
        const elapsedTime = clock.getElapsedTime()
        
        // Rotate particles
        if (sceneRef.current.particles) {
          sceneRef.current.particles.rotation.y = elapsedTime * 0.05
          sceneRef.current.particles.position.y = Math.sin(elapsedTime * 0.5) * 0.5
        }

        // Removed pulsing - too distracting
        // Models will only rotate gently via the gsap animation

        controls.update()
        renderer.render(scene, camera)
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
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      if (sceneRef.current) {
        sceneRef.current.renderer.dispose()
        containerRef.current?.removeChild(sceneRef.current.renderer.domElement)
      }
    }
  }, [modelName])

  return (
    <div className={`relative w-full h-full ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/90">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
              <div 
                className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% ${loadingProgress}%, 0 ${loadingProgress}%)`
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-purple-500">
                  {loadingProgress}%
                </span>
              </div>
            </div>
            <p className="text-white/80 text-lg">Loading 3D Experience</p>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  )
}