"use client"

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'

interface NavigationOrbProps {
  currentSection: string
  className?: string
}

const SECTION_COLORS: Record<string, { primary: string; secondary: string }> = {
  hero: { primary: '#8b5cf6', secondary: '#ec4899' },
  projects: { primary: '#06b6d4', secondary: '#3b82f6' },
  experience: { primary: '#10b981', secondary: '#06b6d4' },
  skills: { primary: '#f97316', secondary: '#fbbf24' },
  contact: { primary: '#ec4899', secondary: '#8b5cf6' }
}

export default function NavigationOrb({ currentSection, className = '' }: NavigationOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    orb: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshPhysicalMaterial>
    particles: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>
    model: THREE.Object3D | null
  } | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    )
    camera.position.z = 3

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)

    // Create morphing orb
    const geometry = new THREE.IcosahedronGeometry(0.5, 2)
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(SECTION_COLORS[currentSection]?.primary || '#8b5cf6'),
      emissive: new THREE.Color(SECTION_COLORS[currentSection]?.primary || '#8b5cf6'),
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8,
      envMapIntensity: 1
    })
    const orb = new THREE.Mesh(geometry, material)
    scene.add(orb)

    // Add particles around orb
    const particlesGeometry = new THREE.BufferGeometry()
    const particleCount = 100
    const positions = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      const angle = (i / 3) * 0.1
      const radius = 0.8 + Math.random() * 0.5
      
      positions[i] = Math.cos(angle) * radius
      positions[i + 1] = Math.sin(angle) * radius
      positions[i + 2] = (Math.random() - 0.5) * 0.5
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: new THREE.Color(SECTION_COLORS[currentSection]?.secondary || '#ec4899'),
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    // Lighting
    const light = new THREE.PointLight(
      SECTION_COLORS[currentSection]?.primary || '#8b5cf6',
      2,
      5
    )
    light.position.set(1, 1, 2)
    scene.add(light)

    // Load mini model based on section
    const loader = new GLTFLoader()
    let model: THREE.Object3D | null = null
    
    const modelMap: Record<string, string> = {
      hero: '/2.0/IridescenceSuzanne/glTF-Binary/IridescenceSuzanne.glb',
      projects: '/2.0/AnimatedMorphCube/glTF/AnimatedMorphCube.gltf',
      experience: '/2.0/Lantern/glTF-Binary/Lantern.glb',
      skills: '/2.0/BoomBox/glTF-Binary/BoomBox.glb',
      contact: '/2.0/Duck/glTF-Binary/Duck.glb'
    }

    if (modelMap[currentSection]) {
      loader.load(
        modelMap[currentSection],
        (gltf) => {
          model = gltf.scene
          
          // Scale to fit
          const box = new THREE.Box3().setFromObject(model)
          const size = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z)
          const scale = 0.3 / maxDim
          
          model.scale.multiplyScalar(scale)
          model.position.set(0, 0, 0)
          
          // Make it glow
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material.emissive = new THREE.Color(SECTION_COLORS[currentSection]?.primary || '#8b5cf6')
              child.material.emissiveIntensity = 0.3
            }
          })
          
          scene.add(model)
          sceneRef.current!.model = model
        }
      )
    }

    sceneRef.current = {
      scene,
      camera,
      renderer,
      orb,
      particles,
      model
    }

    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      
      if (sceneRef.current) {
        const elapsedTime = clock.getElapsedTime()
        
        // Morph orb
        sceneRef.current.orb.rotation.x = elapsedTime * 0.5
        sceneRef.current.orb.rotation.y = elapsedTime * 0.3
        
        // Pulsing effect
        const scale = 1 + Math.sin(elapsedTime * 2) * 0.1
        sceneRef.current.orb.scale.set(scale, scale, scale)
        
        // Rotate particles
        sceneRef.current.particles.rotation.z = elapsedTime * 0.2
        
        // Rotate model if exists
        if (sceneRef.current.model) {
          sceneRef.current.model.rotation.y = elapsedTime
        }
        
        sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera)
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

  // Handle section changes
  useEffect(() => {
    if (!sceneRef.current) return

    const colors = SECTION_COLORS[currentSection] || SECTION_COLORS.hero

    // Animate color transition
    gsap.to(sceneRef.current.orb.material.color, {
      r: new THREE.Color(colors.primary).r,
      g: new THREE.Color(colors.primary).g,
      b: new THREE.Color(colors.primary).b,
      duration: 1,
      ease: "power2.inOut"
    })

    gsap.to(sceneRef.current.orb.material.emissive, {
      r: new THREE.Color(colors.primary).r,
      g: new THREE.Color(colors.primary).g,
      b: new THREE.Color(colors.primary).b,
      duration: 1,
      ease: "power2.inOut"
    })

    gsap.to(sceneRef.current.particles.material.color, {
      r: new THREE.Color(colors.secondary).r,
      g: new THREE.Color(colors.secondary).g,
      b: new THREE.Color(colors.secondary).b,
      duration: 1,
      ease: "power2.inOut"
    })
  }, [currentSection])

  return (
    <div 
      ref={containerRef}
      className={`${className}`}
      style={{ width: '100px', height: '100px' }}
    />
  )
}