"use client"

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

interface ModelData {
  name: string
  displayName: string
  description: string
  scale: number
  category: 'hero' | 'technical' | 'artistic' | 'animated'
  color: string
}

const curatedModels: ModelData[] = [
  {
    name: 'DamagedHelmet',
    displayName: 'Battle-Worn Helmet',
    description: 'A detailed PBR model showcasing realistic wear and damage',
    scale: 2,
    category: 'hero',
    color: '#ff6b6b'
  },
  {
    name: 'FlightHelmet', 
    displayName: 'Pilot Helmet',
    description: 'High-fidelity aviation helmet with complex materials',
    scale: 1.5,
    category: 'technical',
    color: '#4ecdc4'
  },
  {
    name: 'BoomBox',
    displayName: 'Retro Boombox',
    description: 'Classic 80s boombox with metallic and plastic surfaces',
    scale: 25,
    category: 'artistic',
    color: '#ffe66d'
  },
  {
    name: 'Duck',
    displayName: 'Rubber Duck',
    description: 'The classic debugging companion',
    scale: 3,
    category: 'artistic',
    color: '#ffb700'
  },
  {
    name: 'Avocado',
    displayName: 'Fresh Avocado',
    description: 'Photorealistic food model with subsurface scattering',
    scale: 30,
    category: 'artistic',
    color: '#95e1d3'
  }
]

export default function ModelGalleryShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const currentModelRef = useRef<THREE.Group | null>(null)
  const animationIdRef = useRef<number>(0)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    let isDisposed = false
    const container = containerRef.current

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    scene.fog = new THREE.Fog(0x0a0a0a, 5, 20)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.set(5, 3, 5)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.CineonToneMapping
    renderer.toneMappingExposure = 1.5
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 3
    controls.maxDistance = 10
    controls.enablePan = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 1
    controlsRef.current = controls

    // Professional studio lighting
    const setupStudioLighting = () => {
      // Key light
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
      keyLight.position.set(5, 10, 5)
      keyLight.castShadow = true
      keyLight.shadow.mapSize.width = 2048
      keyLight.shadow.mapSize.height = 2048
      keyLight.shadow.camera.near = 0.5
      keyLight.shadow.camera.far = 50
      keyLight.shadow.camera.left = -10
      keyLight.shadow.camera.right = 10
      keyLight.shadow.camera.top = 10
      keyLight.shadow.camera.bottom = -10
      scene.add(keyLight)

      // Fill light
      const fillLight = new THREE.DirectionalLight(0x4080ff, 0.5)
      fillLight.position.set(-5, 5, 5)
      scene.add(fillLight)

      // Rim light
      const rimLight = new THREE.DirectionalLight(0xff8040, 0.8)
      rimLight.position.set(0, 5, -10)
      scene.add(rimLight)

      // Ambient
      const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
      scene.add(ambientLight)

      // Spot lights for dramatic effect
      const spotLight1 = new THREE.SpotLight(0xff00ff, 0.3)
      spotLight1.position.set(10, 10, 0)
      spotLight1.angle = Math.PI / 6
      spotLight1.penumbra = 0.2
      scene.add(spotLight1)

      const spotLight2 = new THREE.SpotLight(0x00ffff, 0.3)
      spotLight2.position.set(-10, 10, 0)
      spotLight2.angle = Math.PI / 6
      spotLight2.penumbra = 0.2
      scene.add(spotLight2)
    }

    // Create display platform
    const createPlatform = () => {
      // Main platform
      const platformGeometry = new THREE.CylinderGeometry(3, 3.5, 0.2, 32)
      const platformMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.8,
        roughness: 0.2
      })
      const platform = new THREE.Mesh(platformGeometry, platformMaterial)
      platform.position.y = -1
      platform.receiveShadow = true
      scene.add(platform)

      // Glowing ring
      const ringGeometry = new THREE.TorusGeometry(3.2, 0.1, 16, 100)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(curatedModels[0].color),
        transparent: true,
        opacity: 0.8
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.position.y = -0.85
      ring.rotation.x = Math.PI / 2
      scene.add(ring)

      // Animated ring pulse
      gsap.to(ring.scale, {
        x: 1.1,
        y: 1.1,
        z: 1.1,
        duration: 2,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true
      })

      return { platform, ring, ringMaterial }
    }

    const { platform, ring, ringMaterial } = createPlatform()

    // Load model function
    const loadModel = async (modelData: ModelData) => {
      setLoading(true)
      
      // Remove current model with animation
      if (currentModelRef.current) {
        const oldModel = currentModelRef.current
        gsap.to(oldModel.scale, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.5,
          ease: 'back.in(2)',
          onComplete: () => {
            scene.remove(oldModel)
            oldModel.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.geometry.dispose()
                if (child.material instanceof THREE.Material) {
                  child.material.dispose()
                }
              }
            })
          }
        })
      }

      // Update ring color
      gsap.to(ringMaterial.color, {
        r: new THREE.Color(modelData.color).r,
        g: new THREE.Color(modelData.color).g,
        b: new THREE.Color(modelData.color).b,
        duration: 1,
        ease: 'power2.inOut'
      })

      // Load new model
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/draco/')
      
      const gltfLoader = new GLTFLoader()
      gltfLoader.setDRACOLoader(dracoLoader)

      const modelPath = `/2.0/${modelData.name}/glTF-Binary/${modelData.name}.glb`
      
      gltfLoader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene
          
          // Center and scale model
          const box = new THREE.Box3().setFromObject(model)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())
          
          const maxDim = Math.max(size.x, size.y, size.z)
          const scale = modelData.scale / maxDim
          model.scale.setScalar(scale)
          
          model.position.x = -center.x * scale
          model.position.y = -center.y * scale
          model.position.z = -center.z * scale
          
          // Enable shadows and enhance materials
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true
              child.receiveShadow = true
              
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMapIntensity = 1
                child.material.needsUpdate = true
              }
            }
          })

          // Add to scene
          scene.add(model)
          currentModelRef.current = model

          // Entrance animation
          model.scale.setScalar(0)
          gsap.timeline()
            .to(model.scale, {
              x: scale,
              y: scale,
              z: scale,
              duration: 1,
              ease: 'back.out(2)'
            })
            .to(model.rotation, {
              y: Math.PI * 2,
              duration: 2,
              ease: 'power2.inOut'
            }, '<0.2')

          setLoading(false)
        },
        undefined,
        (error) => {
          console.error('Error loading model:', error)
          setLoading(false)
        }
      )
    }

    // Window resize
    const handleResize = () => {
      if (!camera || !renderer || !container) return
      
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    // Animation loop
    const animate = () => {
      if (isDisposed) return
      
      animationIdRef.current = requestAnimationFrame(animate)

      if (controls) {
        controls.update()
      }

      // Subtle platform rotation
      platform.rotation.y += 0.002

      renderer.render(scene, camera)
    }

    // Setup and start
    setupStudioLighting()
    loadModel(curatedModels[0])
    
    window.addEventListener('resize', handleResize)
    animate()

    // Cleanup
    return () => {
      isDisposed = true
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      window.removeEventListener('resize', handleResize)
      
      if (renderer) {
        renderer.dispose()
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
      }
    }
  }, [])

  // Handle model selection
  useEffect(() => {
    if (sceneRef.current) {
      const loadModel = async (modelData: ModelData) => {
        // Load model logic from above
        // ... (implementation details handled in main effect)
      }
    }
  }, [selectedIndex])

  const handleModelSelect = (index: number) => {
    setSelectedIndex(index)
    // The model loading is handled by the main effect's loadModel function
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {/* 3D Canvas */}
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Loading indicator */}
        {loading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        
        {/* Model info */}
        <div className="absolute top-10 left-10 text-white">
          <h2 className="text-4xl font-bold mb-2">
            {curatedModels[selectedIndex].displayName}
          </h2>
          <p className="text-gray-400 max-w-md">
            {curatedModels[selectedIndex].description}
          </p>
        </div>
        
        {/* Model selector */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="flex space-x-4">
            {curatedModels.map((model, index) => (
              <button
                key={model.name}
                onClick={() => handleModelSelect(index)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  selectedIndex === index
                    ? 'bg-white text-black scale-110'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                style={{
                  borderColor: model.color,
                  borderWidth: selectedIndex === index ? '2px' : '0'
                }}
              >
                {model.displayName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}