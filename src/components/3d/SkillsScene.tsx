"use client"

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { gsap } from 'gsap'

interface SkillsSceneProps {
  activeSkill?: string
  className?: string
}

const skillOrbVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uActive;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    vec3 pos = position;
    
    // Breathing effect
    float breathing = sin(uTime * 2.0) * 0.05 * uActive;
    pos *= 1.0 + breathing;
    
    // Distortion
    pos.x += sin(pos.y * 10.0 + uTime) * 0.02 * uActive;
    pos.y += sin(pos.z * 10.0 + uTime) * 0.02 * uActive;
    pos.z += sin(pos.x * 10.0 + uTime) * 0.02 * uActive;
    
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
  }
`

const skillOrbFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uActive;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Fresnel effect
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = 1.0 - max(0.0, dot(vNormal, viewDirection));
    fresnel = pow(fresnel, 2.0);
    
    // Core color
    vec3 color = uColor;
    
    // Add rim lighting
    color = mix(color, vec3(1.0), fresnel * 0.5);
    
    // Pulse effect
    float pulse = sin(uTime * 3.0) * 0.2 + 0.8;
    color *= pulse;
    
    // Active state glow
    float glow = uActive * 0.5;
    color = mix(color, vec3(1.0), glow);
    
    // Holographic bands
    float bands = sin(vPosition.y * 50.0 + uTime * 2.0) * 0.1 + 0.9;
    color *= bands;
    
    float alpha = 0.8 + fresnel * 0.2;
    
    gl_FragColor = vec4(color, alpha);
  }
`

const SKILLS_DATA = [
  { name: 'React', color: new THREE.Color(0x61dafb), category: 'frontend' },
  { name: 'Next.js', color: new THREE.Color(0xffffff), category: 'frontend' },
  { name: 'TypeScript', color: new THREE.Color(0x3178c6), category: 'frontend' },
  { name: 'Three.js', color: new THREE.Color(0x049ef4), category: 'frontend' },
  { name: 'Node.js', color: new THREE.Color(0x339933), category: 'backend' },
  { name: 'Python', color: new THREE.Color(0x3776ab), category: 'backend' },
  { name: 'MongoDB', color: new THREE.Color(0x47a248), category: 'backend' },
  { name: 'PostgreSQL', color: new THREE.Color(0x336791), category: 'backend' },
  { name: 'Docker', color: new THREE.Color(0x2496ed), category: 'tools' },
  { name: 'AWS', color: new THREE.Color(0xff9900), category: 'tools' },
  { name: 'Git', color: new THREE.Color(0xf05032), category: 'tools' },
  { name: 'AI/ML', color: new THREE.Color(0x8b5cf6), category: 'special' }
]

export default function SkillsScene({ 
  activeSkill = '',
  className = '' 
}: SkillsSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    skillOrbs: Array<{
      mesh: THREE.Mesh
      material: THREE.ShaderMaterial
      data: typeof SKILLS_DATA[0]
      targetPosition: THREE.Vector3
      orbitRadius: number
      orbitSpeed: number
      orbitOffset: number
    }>
    centralCore: THREE.Mesh
  } | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    scene.background = null

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 15)

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
    controls.autoRotateSpeed = 0.3

    // Central core
    const coreGeometry = new THREE.IcosahedronGeometry(1, 2)
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    })
    const centralCore = new THREE.Mesh(coreGeometry, coreMaterial)
    scene.add(centralCore)

    // Create skill orbs
    const skillOrbs: Array<{
      mesh: THREE.Mesh
      material: THREE.ShaderMaterial
      data: typeof SKILLS_DATA[0]
      targetPosition: THREE.Vector3
      orbitRadius: number
      orbitSpeed: number
      orbitOffset: number
    }> = []

    SKILLS_DATA.forEach((skill, index) => {
      // Create orb geometry
      const geometry = new THREE.SphereGeometry(0.6, 32, 32)
      
      // Custom shader material
      const material = new THREE.ShaderMaterial({
        vertexShader: skillOrbVertexShader,
        fragmentShader: skillOrbFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: skill.color },
          uActive: { value: 0 }
        },
        transparent: true
      })
      
      const mesh = new THREE.Mesh(geometry, material)
      
      // Calculate orbital parameters
      const layer = Math.floor(index / 4)
      const angleInLayer = (index % 4) * (Math.PI * 2 / 4)
      const orbitRadius = 4 + layer * 2
      const orbitSpeed = 0.5 - layer * 0.1
      const orbitOffset = Math.random() * Math.PI * 2
      
      // Initial position
      mesh.position.set(
        Math.cos(angleInLayer) * orbitRadius,
        Math.sin(angleInLayer) * 2,
        Math.sin(angleInLayer) * orbitRadius
      )
      
      scene.add(mesh)
      
      skillOrbs.push({
        mesh,
        material,
        data: skill,
        targetPosition: mesh.position.clone(),
        orbitRadius,
        orbitSpeed,
        orbitOffset
      })
    })

    // Connection lines between orbs
    const connectionMaterial = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.1
    })

    skillOrbs.forEach((orb, i) => {
      skillOrbs.slice(i + 1).forEach((otherOrb) => {
        if (orb.data.category === otherOrb.data.category) {
          const points = [orb.mesh.position, otherOrb.mesh.position]
          const geometry = new THREE.BufferGeometry().setFromPoints(points)
          const line = new THREE.Line(geometry, connectionMaterial)
          scene.add(line)
        }
      })
    })

    // Particle field
    const particlesGeometry = new THREE.BufferGeometry()
    const particleCount = 200
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 15
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      
      positions[i] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i + 2] = radius * Math.cos(phi)
      
      const color = new THREE.Color(0x8b5cf6)
      colors[i] = color.r
      colors[i + 1] = color.g
      colors[i + 2] = color.b
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.5
    })
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0x8b5cf6, 2, 20)
    pointLight1.position.set(5, 5, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 20)
    pointLight2.position.set(-5, -5, -5)
    scene.add(pointLight2)

    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      skillOrbs,
      centralCore
    }

    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      
      if (sceneRef.current) {
        const elapsedTime = clock.getElapsedTime()
        
        // Update central core
        sceneRef.current.centralCore.rotation.x = elapsedTime * 0.5
        sceneRef.current.centralCore.rotation.y = elapsedTime * 0.3
        const coreScale = 1 + Math.sin(elapsedTime * 2) * 0.1
        sceneRef.current.centralCore.scale.set(coreScale, coreScale, coreScale)
        
        // Update skill orbs
        sceneRef.current.skillOrbs.forEach((orb) => {
          // Update shader uniforms
          orb.material.uniforms.uTime.value = elapsedTime
          
          // Orbital motion
          const angle = elapsedTime * orb.orbitSpeed + orb.orbitOffset
          orb.mesh.position.x = Math.cos(angle) * orb.orbitRadius
          orb.mesh.position.z = Math.sin(angle) * orb.orbitRadius
          orb.mesh.position.y = Math.sin(angle * 2) * 1.5
          
          // Self rotation
          orb.mesh.rotation.x = elapsedTime * 0.5
          orb.mesh.rotation.y = elapsedTime * 0.3
        })
        
        // Rotate particles
        particles.rotation.y = elapsedTime * 0.05
        
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

  // Handle active skill changes
  useEffect(() => {
    if (!sceneRef.current) return

    sceneRef.current.skillOrbs.forEach((orb) => {
      const isActive = orb.data.name.toLowerCase() === activeSkill.toLowerCase()
      
      gsap.to(orb.material.uniforms.uActive, {
        value: isActive ? 1 : 0,
        duration: 0.5,
        ease: "power2.inOut"
      })
      
      gsap.to(orb.mesh.scale, {
        x: isActive ? 1.5 : 1,
        y: isActive ? 1.5 : 1,
        z: isActive ? 1.5 : 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)"
      })
    })
  }, [activeSkill])

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div 
        ref={containerRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/50 pointer-events-none" />
    </div>
  )
}