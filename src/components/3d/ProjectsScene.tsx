"use client"

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { gsap } from 'gsap'

interface ProjectsSceneProps {
  activeProject?: number
  className?: string
}

// Custom shader for holographic effect
const holographicVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    pos.y += sin(pos.x * 10.0 + uTime) * 0.02;
    pos.x += sin(pos.y * 10.0 + uTime) * 0.02;
    
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
  }
`

const holographicFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    // Create scan lines
    float scanLine = sin(vUv.y * 100.0 + uTime * 2.0) * 0.04 + 0.96;
    
    // Create gradient
    vec3 color = mix(uColor1, uColor2, vUv.y);
    
    // Add glow effect
    float glow = distance(vUv, vec2(0.5)) * 2.0;
    color = mix(color, vec3(1.0), (1.0 - glow) * 0.2);
    
    // Apply scan lines
    color *= scanLine;
    
    // Add transparency
    float alpha = 0.9 - (sin(uTime * 3.0) * 0.1);
    
    gl_FragColor = vec4(color, alpha);
  }
`

const PROJECT_MODELS = [
  { name: 'BoomBox', color1: new THREE.Color(0x8b5cf6), color2: new THREE.Color(0x06b6d4) },
  { name: 'DamagedHelmet', color1: new THREE.Color(0x06b6d4), color2: new THREE.Color(0x10b981) },
  { name: 'FlightHelmet', color1: new THREE.Color(0x10b981), color2: new THREE.Color(0xfbbf24) },
]

export default function ProjectsScene({ 
  activeProject = 0,
  className = '' 
}: ProjectsSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    composer: EffectComposer
    controls: OrbitControls
    models: THREE.Object3D[]
    currentModelIndex: number
    shaderMaterial: THREE.ShaderMaterial
  } | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    scene.background = null // Transparent background

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 2, 5)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.5
    containerRef.current.appendChild(renderer.domElement)

    // Post-processing setup
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // Bloom effect
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight),
      1.5, // strength
      0.4, // radius
      0.85  // threshold
    )
    composer.addPass(bloomPass)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false
    controls.enablePan = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 1

    // Custom shader material
    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: holographicVertexShader,
      fragmentShader: holographicFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(0x8b5cf6) },
        uColor2: { value: new THREE.Color(0x06b6d4) }
      },
      transparent: true,
      side: THREE.DoubleSide,
      wireframe: true
    })

    sceneRef.current = {
      scene,
      camera,
      renderer,
      composer,
      controls,
      models: [],
      currentModelIndex: 0,
      shaderMaterial
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x8b5cf6, 2, 10)
    pointLight.position.set(-5, 5, -5)
    scene.add(pointLight)

    // Initialize empty model slots
    PROJECT_MODELS.forEach((_, index) => {
      // Create an empty group as placeholder
      const placeholder = new THREE.Group()
      placeholder.position.x = (index - 1) * 5
      placeholder.visible = false // Start with all hidden
      scene.add(placeholder)
      sceneRef.current!.models.push(placeholder)
    })

    // Load actual models
    const loader = new GLTFLoader()
    PROJECT_MODELS.forEach((projectModel, index) => {
      const modelPath = `/2.0/${projectModel.name}/glTF/${projectModel.name}.gltf`
      
      loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene
          
          // Center and scale
          const box = new THREE.Box3().setFromObject(model)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z)
          const scale = 2 / maxDim
          
          model.scale.multiplyScalar(scale)
          model.position.sub(center.multiplyScalar(scale))
          model.position.x = (index - 1) * 5
          model.visible = index === 0

          // Apply holographic material to all meshes
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const hologramMaterial = shaderMaterial.clone()
              hologramMaterial.uniforms.uColor1.value = projectModel.color1
              hologramMaterial.uniforms.uColor2.value = projectModel.color2
              child.material = hologramMaterial
            }
          })

          // Replace placeholder with actual model
          if (sceneRef.current && sceneRef.current.models[index]) {
            scene.remove(sceneRef.current.models[index])
            sceneRef.current.models[index] = model
            scene.add(model)
          }
        },
        undefined,
        (error) => {
          console.warn(`Failed to load ${projectModel.name}, creating fallback`)
          
          // Create a simple holographic sphere as fallback
          const fallbackGeometry = new THREE.SphereGeometry(1, 32, 32)
          const fallbackMaterial = shaderMaterial.clone()
          fallbackMaterial.uniforms.uColor1.value = projectModel.color1
          fallbackMaterial.uniforms.uColor2.value = projectModel.color2
          fallbackMaterial.wireframe = true
          
          const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial)
          fallbackMesh.position.x = (index - 1) * 5
          fallbackMesh.visible = index === 0
          
          // Replace placeholder with fallback
          if (sceneRef.current && sceneRef.current.models[index]) {
            scene.remove(sceneRef.current.models[index])
            sceneRef.current.models[index] = fallbackMesh
            scene.add(fallbackMesh)
          }
        }
      )
    })

    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      
      if (sceneRef.current) {
        const elapsedTime = clock.getElapsedTime()
        
        // Update shader uniforms
        sceneRef.current.models.forEach((model) => {
          // Skip if model is just a placeholder group without children
          if (model.children.length === 0 && model.type === 'Group') return
          
          model.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
              child.material.uniforms.uTime.value = elapsedTime
            }
          })
          
          // Float animation only for loaded models
          if (model.visible) {
            model.position.y = Math.sin(elapsedTime + model.position.x) * 0.1
            model.rotation.y = elapsedTime * 0.2
          }
        })

        controls.update()
        composer.render()
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

    // Cleanup
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
  }, [])

  // Handle project switching with smooth transitions
  useEffect(() => {
    if (!sceneRef.current) return

    const targetIndex = activeProject % PROJECT_MODELS.length
    const currentIndex = sceneRef.current.currentModelIndex

    if (targetIndex !== currentIndex) {
      const timeline = gsap.timeline()

      // Hide current model
      if (sceneRef.current.models[currentIndex]) {
        timeline.to(sceneRef.current.models[currentIndex].scale, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => {
            if (sceneRef.current?.models[currentIndex]) {
              sceneRef.current.models[currentIndex].visible = false
            }
          }
        })
      }

      // Show new model
      if (sceneRef.current.models[targetIndex]) {
        // Check if it's a loaded model (not empty placeholder)
        if (sceneRef.current.models[targetIndex].children.length > 0 || sceneRef.current.models[targetIndex].type !== 'Group') {
          sceneRef.current.models[targetIndex].visible = true
          sceneRef.current.models[targetIndex].scale.set(0, 0, 0)
          
          timeline.to(sceneRef.current.models[targetIndex].scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.5,
            ease: "elastic.out(1, 0.5)"
          })
        }
      }

      // Move camera
      timeline.to(sceneRef.current.camera.position, {
        x: (targetIndex - 1) * 2,
        duration: 1,
        ease: "power2.inOut"
      }, 0)

      sceneRef.current.currentModelIndex = targetIndex
    }
  }, [activeProject])

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div 
        ref={containerRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
    </div>
  )
}