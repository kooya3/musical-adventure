"use client"

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { gsap } from 'gsap'

interface ExperienceSceneProps {
  activeExperience?: number
  className?: string
}

const timelineVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uProgress;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    
    // Wave effect along the timeline
    float wave = sin(pos.x * 5.0 + uTime * 2.0) * 0.1;
    pos.y += wave * uProgress;
    
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
  }
`

const timelineFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uProgress;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    // Energy flow effect
    float energy = sin(vUv.x * 20.0 - uTime * 3.0) * 0.5 + 0.5;
    
    // Gradient along timeline
    vec3 color = uColor;
    color = mix(color, vec3(1.0), energy * 0.3);
    
    // Pulsing glow
    float glow = sin(uTime * 2.0) * 0.2 + 0.8;
    
    // Progress highlight
    float highlight = smoothstep(0.0, uProgress, vUv.x);
    color = mix(color * 0.3, color, highlight);
    
    gl_FragColor = vec4(color * glow, 0.9);
  }
`

const EXPERIENCE_DATA = [
  { year: 2022, color: new THREE.Color(0x8b5cf6), progress: 0.25 },
  { year: 2023, color: new THREE.Color(0x06b6d4), progress: 0.5 },
  { year: 2024, color: new THREE.Color(0x10b981), progress: 0.75 },
  { year: 2025, color: new THREE.Color(0xfbbf24), progress: 1.0 }
]

export default function ExperienceScene({ 
  activeExperience = 0,
  className = '' 
}: ExperienceSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    timeline: THREE.Mesh
    nodes: THREE.Mesh[]
    connections: THREE.Line[]
    shaderMaterial: THREE.ShaderMaterial
  } | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    scene.background = null

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 5, 10)
    camera.lookAt(0, 0, 0)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false
    controls.enablePan = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5

    // Timeline shader material
    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: timelineVertexShader,
      fragmentShader: timelineFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x8b5cf6) },
        uProgress: { value: 0.25 }
      },
      transparent: true,
      side: THREE.DoubleSide
    })

    // Create timeline path
    const timelineGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-5, 0, 0),
        new THREE.Vector3(-2, 1, 1),
        new THREE.Vector3(0, 0, -1),
        new THREE.Vector3(2, -1, 1),
        new THREE.Vector3(5, 0, 0)
      ]),
      100,
      0.1,
      8,
      false
    )
    const timeline = new THREE.Mesh(timelineGeometry, shaderMaterial)
    scene.add(timeline)

    // Create experience nodes
    const nodes: THREE.Mesh[] = []
    const connections: THREE.Line[] = []
    
    EXPERIENCE_DATA.forEach((exp, index) => {
      // Node sphere
      const nodeGeometry = new THREE.SphereGeometry(0.3, 32, 32)
      const nodeMaterial = new THREE.MeshPhysicalMaterial({
        color: exp.color,
        emissive: exp.color,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.9
      })
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial)
      
      // Position along timeline
      const angle = (index / EXPERIENCE_DATA.length) * Math.PI * 2
      node.position.set(
        Math.cos(angle) * 4,
        Math.sin(angle) * 1,
        Math.sin(angle) * 2
      )
      
      scene.add(node)
      nodes.push(node)
      
      // Connection lines
      if (index > 0) {
        const points = [
          nodes[index - 1].position,
          node.position
        ]
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const lineMaterial = new THREE.LineBasicMaterial({
          color: exp.color,
          transparent: true,
          opacity: 0.3
        })
        const connection = new THREE.Line(lineGeometry, lineMaterial)
        scene.add(connection)
        connections.push(connection)
      }
    })

    // Add floating particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particleCount = 100
    const positions = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 15
      positions[i + 1] = (Math.random() - 0.5) * 10
      positions[i + 2] = (Math.random() - 0.5) * 15
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x8b5cf6,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    })
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x8b5cf6, 2, 15)
    pointLight.position.set(0, 5, 0)
    scene.add(pointLight)

    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      timeline,
      nodes,
      connections,
      shaderMaterial
    }

    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      
      if (sceneRef.current) {
        const elapsedTime = clock.getElapsedTime()
        
        // Update shader uniforms
        sceneRef.current.shaderMaterial.uniforms.uTime.value = elapsedTime
        
        // Animate nodes
        sceneRef.current.nodes.forEach((node, index) => {
          node.rotation.y = elapsedTime * 0.5
          node.position.y += Math.sin(elapsedTime + index) * 0.002
          
          // Pulse effect
          const scale = 1 + Math.sin(elapsedTime * 2 + index) * 0.1
          node.scale.set(scale, scale, scale)
        })
        
        // Rotate particles
        particles.rotation.y = elapsedTime * 0.1
        
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

  // Handle experience changes
  useEffect(() => {
    if (!sceneRef.current) return

    const targetIndex = Math.min(activeExperience, EXPERIENCE_DATA.length - 1)
    const experience = EXPERIENCE_DATA[targetIndex]

    // Animate progress and color
    gsap.to(sceneRef.current.shaderMaterial.uniforms.uProgress, {
      value: experience.progress,
      duration: 1,
      ease: "power2.inOut"
    })

    gsap.to(sceneRef.current.shaderMaterial.uniforms.uColor.value, {
      r: experience.color.r,
      g: experience.color.g,
      b: experience.color.b,
      duration: 1,
      ease: "power2.inOut"
    })

    // Highlight active node
    sceneRef.current.nodes.forEach((node, index) => {
      const isActive = index === targetIndex
      gsap.to(node.scale, {
        x: isActive ? 1.5 : 1,
        y: isActive ? 1.5 : 1,
        z: isActive ? 1.5 : 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)"
      })
    })

    // Camera movement
    const targetNode = sceneRef.current.nodes[targetIndex]
    if (targetNode) {
      gsap.to(sceneRef.current.camera.position, {
        x: targetNode.position.x * 0.5,
        y: targetNode.position.y + 5,
        z: targetNode.position.z + 10,
        duration: 1.5,
        ease: "power2.inOut"
      })
    }
  }, [activeExperience])

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div 
        ref={containerRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
    </div>
  )
}