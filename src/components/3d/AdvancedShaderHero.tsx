"use client"

import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'

// Shader for premium gradient effect
const vertexShader = `
  varying vec2 vUv;
  varying float vZ;
  uniform float uTime;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.z += sin(pos.x * 2.0 + uTime) * 0.1;
    pos.z += cos(pos.y * 2.0 + uTime) * 0.1;
    vZ = pos.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vZ;
  
  vec3 colorA = vec3(0.545, 0.361, 0.965); // Violet
  vec3 colorB = vec3(1.0, 1.0, 1.0); // White
  vec3 colorC = vec3(0.302, 0.125, 0.604); // Deep purple
  
  void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center);
    float wave = sin(dist * 10.0 - uTime * 2.0) * 0.5 + 0.5;
    
    vec3 color = mix(colorA, colorB, wave);
    color = mix(color, colorC, dist);
    
    // Mouse interaction
    float mouseDist = distance(vUv, uMouse);
    float mouseEffect = smoothstep(0.3, 0.0, mouseDist);
    color += mouseEffect * vec3(0.2, 0.1, 0.3);
    
    gl_FragColor = vec4(color, 0.8);
  }
`

interface MeshGradientProps {
  speed?: number
  opacity?: number
  wireframe?: boolean
  scale?: number
}

function MeshGradient({ speed = 1, opacity = 0.5, wireframe = false, scale = 1 }: MeshGradientProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  
  useEffect(() => {
    if (!materialRef.current) return
    
    const animate = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value += 0.01 * speed
      }
      requestAnimationFrame(animate)
    }
    animate()
  }, [speed])
  
  return (
    <mesh ref={meshRef} scale={scale}>
      <planeGeometry args={[10, 10, 50, 50]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) }
        }}
        wireframe={wireframe}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default function AdvancedShaderHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const [isHovered, setIsHovered] = useState(false)
  const { scrollY } = useScroll()
  
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 1.1])
  
  useEffect(() => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    let animationId: number
    
    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene
    
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 5
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    
    // Create multiple gradient layers
    const gradients: THREE.Mesh[] = []
    
    // Layer 1 - Base gradient
    const gradient1 = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 15, 40, 40),
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) }
        },
        transparent: true,
        opacity: 0.3,
        wireframe: false
      })
    )
    gradient1.position.z = -2
    scene.add(gradient1)
    gradients.push(gradient1)
    
    // Layer 2 - Wireframe overlay
    const gradient2 = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12, 30, 30),
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) }
        },
        transparent: true,
        opacity: 0.2,
        wireframe: true
      })
    )
    gradient2.position.z = -1
    gradient2.rotation.z = Math.PI / 8
    scene.add(gradient2)
    gradients.push(gradient2)
    
    // Layer 3 - Fast moving accent
    const gradient3 = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8, 20, 20),
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) }
        },
        transparent: true,
        opacity: 0.15,
        wireframe: false
      })
    )
    gradient3.position.z = 0
    gradient3.rotation.z = -Math.PI / 6
    scene.add(gradient3)
    gradients.push(gradient3)
    
    // Animation loop
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      
      // Update shader uniforms
      gradients.forEach((gradient, index) => {
        const material = gradient.material as THREE.ShaderMaterial
        material.uniforms.uTime.value += 0.005 * (index + 1)
        material.uniforms.uMouse.value.x = mousePosition.x
        material.uniforms.uMouse.value.y = mousePosition.y
        
        // Subtle rotation
        gradient.rotation.z += 0.001 * (index % 2 === 0 ? 1 : -1)
      })
      
      // Camera parallax
      camera.position.x = (mousePosition.x - 0.5) * 0.5
      camera.position.y = (mousePosition.y - 0.5) * 0.5
      camera.lookAt(0, 0, 0)
      
      renderer.render(scene, camera)
    }
    
    animate()
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [mousePosition])
  
  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: 1 - (e.clientY / window.innerHeight)
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Shader Background */}
      <motion.div 
        className="absolute inset-0"
        style={{ opacity, scale }}
      >
        <div ref={containerRef} className="absolute inset-0" />
      </motion.div>
      
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-2xl font-light text-white"
        >
          <span className="font-[300]">Advanced</span>
          <span className="font-[700] text-violet-500">Tech</span>
        </motion.div>
        
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden md:flex space-x-8"
        >
          {['Experience', 'Technology', 'Gallery'].map((item, index) => (
            <button
              key={item}
              className="text-white/70 hover:text-white text-sm font-light transition-colors duration-200 relative group"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-violet-500 group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </motion.nav>
        
        {/* Login Button with Gooey Effect */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="relative px-6 py-2.5 bg-white text-black rounded-full font-medium text-sm overflow-hidden group"
        >
          <span className="relative z-10 flex items-center gap-2">
            Login
            <motion.svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              animate={{ x: isHovered ? 3 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </span>
          
          {/* Gooey Background */}
          <motion.div
            className="absolute inset-0 bg-violet-500"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isHovered ? 1 : 0,
              opacity: isHovered ? 1 : 0
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ borderRadius: '100px' }}
          />
        </motion.button>
      </header>
      
      {/* Hero Content */}
      <main className="relative z-10 px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="absolute bottom-20 left-8 max-w-2xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-8"
            >
              <span className="text-2xl">✨</span>
              <span className="text-white/80 text-xs font-light">New Experience Available</span>
            </motion.div>
            
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight mb-6"
            >
              <span className="block">Experience</span>
              <span className="block">
                <span className="font-['Instrument_Serif'] italic font-normal text-violet-400">Beautiful</span>
                {' '}Shaders
              </span>
              <span className="block">& Advanced Tech</span>
            </motion.h1>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-white/60 text-sm font-light leading-relaxed mb-8 max-w-md"
            >
              Immerse yourself in cutting-edge visual technology. 
              Our advanced shader systems create interactive experiences 
              that respond to your every movement.
            </motion.p>
            
            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex gap-4"
            >
              <button className="px-8 py-3 border border-white/20 text-white rounded-full text-sm font-light hover:bg-white/10 transition-colors duration-300">
                View Gallery
              </button>
              <button className="px-8 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors duration-300">
                Start Experience
              </button>
            </motion.div>
          </div>
          
          {/* Floating Interactive Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="absolute bottom-20 right-8"
          >
            <div className="relative w-32 h-32">
              {/* Rotating Text */}
              <svg className="absolute inset-0 w-full h-full animate-spin-slow">
                <defs>
                  <path
                    id="circle"
                    d="M 64, 64 m -50, 0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0"
                  />
                </defs>
                <text className="fill-white/40 text-[10px] uppercase tracking-[0.3em] font-light">
                  <textPath href="#circle">
                    Scroll to Explore • Interactive Experience •
                  </textPath>
                </text>
              </svg>
              
              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="w-12 h-12 rounded-full border border-violet-500/50 flex items-center justify-center"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5V19M12 19L5 12M12 19L19 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-violet-400"
                    />
                  </svg>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* Glass Morphism Overlay Effects */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Custom CSS */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  )
}