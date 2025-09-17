"use client"

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ParallaxLayer {
  model: THREE.Object3D
  basePosition: THREE.Vector3
  parallaxFactor: number
  rotationSpeed: number
  floatAmplitude?: number
  floatSpeed?: number
}

export default function ParallaxHeroScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const layersRef = useRef<ParallaxLayer[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetMouseRef = useRef({ x: 0, y: 0 })
  const animationIdRef = useRef<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return

    let isDisposed = false
    const container = containerRef.current

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000011, 5, 25)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 2, 8)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer setup with high quality settings
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Professional lighting setup
    const setupLighting = () => {
      // Ambient light for base illumination
      const ambientLight = new THREE.AmbientLight(0x404080, 0.4)
      scene.add(ambientLight)

      // Main directional light with dramatic shadows
      const mainLight = new THREE.DirectionalLight(0xffffff, 1)
      mainLight.position.set(5, 10, 5)
      mainLight.castShadow = true
      mainLight.shadow.mapSize.width = 2048
      mainLight.shadow.mapSize.height = 2048
      mainLight.shadow.camera.near = 0.5
      mainLight.shadow.camera.far = 50
      mainLight.shadow.camera.left = -20
      mainLight.shadow.camera.right = 20
      mainLight.shadow.camera.top = 20
      mainLight.shadow.camera.bottom = -20
      scene.add(mainLight)

      // Accent lights for depth
      const accentLight1 = new THREE.PointLight(0x4080ff, 0.5, 20)
      accentLight1.position.set(-5, 3, 0)
      scene.add(accentLight1)

      const accentLight2 = new THREE.PointLight(0xff8040, 0.3, 20)
      accentLight2.position.set(5, 3, -5)
      scene.add(accentLight2)

      // Rim light for silhouettes
      const rimLight = new THREE.DirectionalLight(0x8080ff, 0.3)
      rimLight.position.set(-10, 5, -10)
      scene.add(rimLight)
    }

    // Create particle system for atmosphere
    const createParticles = () => {
      const particlesGeometry = new THREE.BufferGeometry()
      const particleCount = 1000
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 30
        positions[i * 3 + 1] = (Math.random() - 0.5) * 30
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30

        const color = new THREE.Color()
        color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5 + Math.random() * 0.3)
        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
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

      return particles
    }

    // Load models with parallax layers
    const loadModels = async () => {
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/draco/')
      
      const gltfLoader = new GLTFLoader()
      gltfLoader.setDRACOLoader(dracoLoader)

      const modelConfigs = [
        { 
          name: 'DamagedHelmet', 
          position: new THREE.Vector3(0, 0, 0),
          scale: 1.5,
          parallaxFactor: 1,
          rotationSpeed: 0.3,
          floatAmplitude: 0.2,
          floatSpeed: 1
        },
        { 
          name: 'FlightHelmet', 
          position: new THREE.Vector3(-3, 1, -2),
          scale: 1,
          parallaxFactor: 0.7,
          rotationSpeed: -0.2,
          floatAmplitude: 0.3,
          floatSpeed: 0.8
        },
        { 
          name: 'BoomBox', 
          position: new THREE.Vector3(3, -1, -1),
          scale: 20,
          parallaxFactor: 0.5,
          rotationSpeed: 0.1,
          floatAmplitude: 0.1,
          floatSpeed: 1.2
        }
      ]

      const loadPromises = modelConfigs.map(config => {
        return new Promise<void>((resolve) => {
          const modelPath = `/2.0/${config.name}/glTF-Binary/${config.name}.glb`
          
          gltfLoader.load(
            modelPath,
            (gltf) => {
              const model = gltf.scene
              model.scale.setScalar(config.scale)
              model.position.copy(config.position)
              
              // Enable shadows
              model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.castShadow = true
                  child.receiveShadow = true
                  
                  // Enhance materials
                  if (child.material instanceof THREE.MeshStandardMaterial) {
                    child.material.envMapIntensity = 0.8
                    child.material.roughness *= 0.8
                    child.material.metalness *= 1.2
                  }
                }
              })

              scene.add(model)

              // Add to parallax layers
              layersRef.current.push({
                model,
                basePosition: config.position.clone(),
                parallaxFactor: config.parallaxFactor,
                rotationSpeed: config.rotationSpeed,
                floatAmplitude: config.floatAmplitude,
                floatSpeed: config.floatSpeed
              })

              // Entrance animation
              gsap.from(model.scale, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1.5,
                ease: 'back.out(1.7)',
                delay: layersRef.current.length * 0.2
              })

              gsap.from(model.rotation, {
                y: Math.PI * 2,
                duration: 2,
                ease: 'power2.inOut',
                delay: layersRef.current.length * 0.2
              })

              resolve()
            },
            undefined,
            (error) => {
              console.warn(`Could not load ${config.name}, using fallback`)
              // Create fallback geometry
              const geometry = new THREE.DodecahedronGeometry(1, 0)
              const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5),
                metalness: 0.5,
                roughness: 0.3
              })
              const mesh = new THREE.Mesh(geometry, material)
              mesh.scale.setScalar(config.scale)
              mesh.position.copy(config.position)
              mesh.castShadow = true
              mesh.receiveShadow = true
              
              scene.add(mesh)
              
              layersRef.current.push({
                model: mesh,
                basePosition: config.position.clone(),
                parallaxFactor: config.parallaxFactor,
                rotationSpeed: config.rotationSpeed,
                floatAmplitude: config.floatAmplitude,
                floatSpeed: config.floatSpeed
              })
              
              resolve()
            }
          )
        })
      })

      await Promise.all(loadPromises)
      setLoading(false)
    }

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      targetMouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      targetMouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    // Touch move handler for mobile
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0]
        targetMouseRef.current.x = (touch.clientX / window.innerWidth) * 2 - 1
        targetMouseRef.current.y = -(touch.clientY / window.innerHeight) * 2 + 1
      }
    }

    // Window resize handler
    const handleResize = () => {
      if (!camera || !renderer || !container) return
      
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    // Create atmospheric particles
    const particles = createParticles()

    // Animation loop
    const animate = () => {
      if (isDisposed) return
      
      animationIdRef.current = requestAnimationFrame(animate)

      // Smooth mouse movement
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05

      // Update parallax layers
      const time = Date.now() * 0.001
      layersRef.current.forEach((layer) => {
        // Parallax movement
        layer.model.position.x = layer.basePosition.x + mouseRef.current.x * layer.parallaxFactor * 2
        layer.model.position.y = layer.basePosition.y + mouseRef.current.y * layer.parallaxFactor

        // Rotation
        layer.model.rotation.y += layer.rotationSpeed * 0.01

        // Floating animation
        if (layer.floatAmplitude && layer.floatSpeed) {
          layer.model.position.y = layer.basePosition.y + 
            Math.sin(time * layer.floatSpeed) * layer.floatAmplitude +
            mouseRef.current.y * layer.parallaxFactor
        }
      })

      // Animate particles
      if (particles) {
        particles.rotation.y += 0.0005
        particles.rotation.x = mouseRef.current.y * 0.1
      }

      // Camera parallax
      camera.position.x = mouseRef.current.x * 0.5
      camera.position.y = 2 + mouseRef.current.y * 0.3
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    // Setup
    setupLighting()
    loadModels()
    
    // Event listeners
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('resize', handleResize)
    
    // Start animation
    animate()

    // Cleanup
    return () => {
      isDisposed = true
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('resize', handleResize)
      
      if (renderer) {
        renderer.dispose()
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
      }
      
      if (scene) {
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose()
            if (object.material instanceof THREE.Material) {
              object.material.dispose()
            }
          }
        })
      }
    }
  }, [])

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 overflow-hidden">
      <div 
        ref={containerRef} 
        className="absolute inset-0"
      />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            </div>
            <div className="mt-6 text-white font-bold text-lg">Initializing Professional Rendering</div>
            <div className="text-blue-400 text-sm mt-2">Loading 3D Assets...</div>
          </div>
        </div>
      )}
      
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      
      <div className="absolute top-10 left-10 text-white z-20 pointer-events-none">
        <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Parallax 3D Experience
        </h1>
        <p className="text-lg opacity-80">Move your mouse to explore the depth</p>
      </div>
    </div>
  )
}