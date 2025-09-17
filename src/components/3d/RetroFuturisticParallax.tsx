"use client"

import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'

interface ParallaxLayerProps {
  children: React.ReactNode
  offset: number
  speed: number
  className?: string
}

function ParallaxLayer({ children, offset, speed, className = '' }: ParallaxLayerProps) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [offset, offset * speed])
  const springY = useSpring(y, { stiffness: 100, damping: 30, restDelta: 0.001 })
  
  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      style={{ y: springY }}
    >
      {children}
    </motion.div>
  )
}

export default function RetroFuturisticParallax() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(true)
  const { scrollY } = useScroll()
  
  // Transform scroll to rotation and scale values
  const rotateX = useTransform(scrollY, [0, 1000], [0, 20])
  const rotateY = useTransform(scrollY, [0, 1000], [0, -20])
  const scale = useTransform(scrollY, [0, 500], [1, 1.2])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    let animationId: number
    let renderer: THREE.WebGLRenderer | null = null
    let camera: THREE.PerspectiveCamera | null = null
    let scene: THREE.Scene | null = null

    const init = () => {
      // Scene setup with retro-futuristic aesthetics
      scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0x000033, 0.02)
      sceneRef.current = scene

      // Camera
      camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      )
      camera.position.z = 5

      // Renderer with neon glow settings
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      })
      renderer.setSize(container.clientWidth, container.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.5
      container.appendChild(renderer.domElement)

      // Retro grid floor
      const gridHelper = new THREE.GridHelper(100, 50, 0xff00ff, 0x00ffff)
      gridHelper.position.y = -2
      scene.add(gridHelper)

      // Neon lights
      const createNeonLight = (color: number, position: THREE.Vector3) => {
        if (!scene) return
        
        const light = new THREE.PointLight(color, 2, 100)
        light.position.copy(position)
        scene.add(light)

        // Light sphere for visual effect
        const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16)
        const sphereMaterial = new THREE.MeshBasicMaterial({ 
          color
        })
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
        sphere.position.copy(position)
        scene.add(sphere)

        return { light, sphere }
      }

      // Create multiple neon lights
      const lights = [
        createNeonLight(0xff00ff, new THREE.Vector3(-5, 2, -5)),
        createNeonLight(0x00ffff, new THREE.Vector3(5, 2, -5)),
        createNeonLight(0xffff00, new THREE.Vector3(0, 3, -8)),
        createNeonLight(0xff00ff, new THREE.Vector3(-3, 1, 0)),
        createNeonLight(0x00ff00, new THREE.Vector3(3, 1, 0))
      ]

      // Animate lights
      lights.forEach((lightObj, index) => {
        if (!lightObj) return
        gsap.to(lightObj.sphere.position, {
          y: lightObj.sphere.position.y + Math.random() * 2,
          duration: 2 + Math.random() * 2,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true,
          delay: index * 0.2
        })
      })

      // Create retro geometric shapes
      const createRetroShape = (
        geometry: THREE.BufferGeometry,
        position: THREE.Vector3,
        color: number
      ) => {
        const material = new THREE.MeshPhongMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.2,
          shininess: 100,
          specular: 0xffffff,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide
        })
        
        const edges = new THREE.EdgesGeometry(geometry)
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: 0xffffff,
          linewidth: 2
        })
        const wireframe = new THREE.LineSegments(edges, lineMaterial)
        
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.copy(position)
        mesh.add(wireframe)
        if (scene) scene.add(mesh)

        return mesh
      }

      // Add various retro shapes
      const shapes = [
        createRetroShape(
          new THREE.OctahedronGeometry(1),
          new THREE.Vector3(-3, 0, -3),
          0xff00ff
        ),
        createRetroShape(
          new THREE.TetrahedronGeometry(1.2),
          new THREE.Vector3(3, 0, -3),
          0x00ffff
        ),
        createRetroShape(
          new THREE.IcosahedronGeometry(0.8),
          new THREE.Vector3(0, 2, -5),
          0xffff00
        ),
        createRetroShape(
          new THREE.DodecahedronGeometry(0.7),
          new THREE.Vector3(-2, 1, -2),
          0xff00ff
        ),
        createRetroShape(
          new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16),
          new THREE.Vector3(2, 1, -2),
          0x00ff00
        )
      ]

      // Animate shapes with different patterns
      shapes.forEach((shape, index) => {
        // Rotation animation
        gsap.to(shape.rotation, {
          x: Math.PI * 2,
          y: Math.PI * 2,
          duration: 10 + index * 2,
          ease: 'none',
          repeat: -1
        })

        // Floating animation
        gsap.to(shape.position, {
          y: shape.position.y + 0.5,
          duration: 3 + Math.random() * 2,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true,
          delay: index * 0.3
        })

        // Scale pulse
        gsap.to(shape.scale, {
          x: 1.2,
          y: 1.2,
          z: 1.2,
          duration: 2,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true,
          delay: index * 0.2
        })
      })

      // Particle system for atmosphere
      const particlesGeometry = new THREE.BufferGeometry()
      const particleCount = 2000
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50

        // Neon colors
        const colorChoice = Math.random()
        if (colorChoice < 0.33) {
          colors[i * 3] = 1
          colors[i * 3 + 1] = 0
          colors[i * 3 + 2] = 1
        } else if (colorChoice < 0.66) {
          colors[i * 3] = 0
          colors[i * 3 + 1] = 1
          colors[i * 3 + 2] = 1
        } else {
          colors[i * 3] = 1
          colors[i * 3 + 1] = 1
          colors[i * 3 + 2] = 0
        }
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8
      })

      const particles = new THREE.Points(particlesGeometry, particlesMaterial)
      scene.add(particles)

      // Load a simple model as centerpiece
      const gltfLoader = new GLTFLoader()
      const modelPath = '/2.0/Duck/glTF/Duck.gltf'
      
      gltfLoader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene
          model.scale.setScalar(0.01)
          model.position.set(0, 0, 0)
          
          // Apply neon material to model
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const originalMaterial = child.material as THREE.MeshStandardMaterial
              child.material = new THREE.MeshPhongMaterial({
                color: 0xff00ff,
                emissive: 0xff00ff,
                emissiveIntensity: 0.3,
                shininess: 100,
                specular: 0xffffff
              })
            }
          })
          
          if (scene) scene.add(model)
          
          // Animate model
          gsap.to(model.rotation, {
            y: Math.PI * 2,
            duration: 20,
            ease: 'none',
            repeat: -1
          })
          
          setLoading(false)
        },
        undefined,
        (error) => {
          console.log('Model loading skipped, using shapes only')
          setLoading(false)
        }
      )

      // Animation loop
      const animate = () => {
        animationId = requestAnimationFrame(animate)

        if (!renderer || !scene || !camera) return

        // Mouse parallax effect on camera
        camera.position.x = mousePosition.x * 2
        camera.position.y = mousePosition.y * 2
        camera.lookAt(0, 0, 0)

        // Rotate particles
        particles.rotation.y += 0.001
        particles.rotation.x += 0.0005

        // Move grid based on time for infinite scroll effect
        gridHelper.position.z = (Date.now() * 0.001) % 10

        renderer.render(scene, camera)
      }

      animate()
    }

    init()

    // Handle resize
    const handleResize = () => {
      if (!camera || !renderer || !container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      if (renderer?.domElement?.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      renderer?.dispose()
    }
  }, [mousePosition])

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <motion.div
      className="relative w-full min-h-[200vh] bg-gradient-to-b from-black via-purple-950 to-black overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #1a0033 0%, #000000 100%)'
      }}
    >
      {/* 3D Scene Container */}
      <motion.div
        className="fixed inset-0 z-0"
        style={{
          rotateX,
          rotateY,
          scale,
          transformPerspective: 1000
        }}
      >
        <div ref={containerRef} className="w-full h-full" />
      </motion.div>

      {/* Parallax UI Layers */}
      <div className="relative z-10">
        {/* Hero Text - Slowest parallax */}
        <ParallaxLayer offset={0} speed={0.5}>
          <div className="flex items-center justify-center h-screen">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="text-center"
            >
              <h1 className="text-8xl md:text-9xl font-bold mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient">
                  RETRO
                </span>
              </h1>
              <h2 className="text-6xl md:text-7xl font-bold">
                <span className="text-white opacity-80 glitch-text">
                  FUTURISTIC
                </span>
              </h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-6 text-xl text-cyan-400 font-mono"
              >
                Experience the Parallax Dimension
              </motion.p>
            </motion.div>
          </div>
        </ParallaxLayer>

        {/* Mid layer - Medium speed */}
        <ParallaxLayer offset={100} speed={0.8} className="pointer-events-none">
          <div className="h-screen flex items-center justify-around">
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="w-32 h-32 border-4 border-cyan-400 rounded-lg transform rotate-45"
              style={{
                boxShadow: '0 0 30px #00ffff, inset 0 0 30px #00ffff'
              }}
            />
            <motion.div
              animate={{
                y: [0, 20, 0],
                rotate: [0, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="w-40 h-40 border-4 border-pink-500 rounded-full"
              style={{
                boxShadow: '0 0 30px #ff00ff, inset 0 0 30px #ff00ff'
              }}
            />
          </div>
        </ParallaxLayer>

        {/* Fast layer - Foreground elements */}
        <ParallaxLayer offset={200} speed={1.2} className="pointer-events-none">
          <div className="h-screen flex flex-col justify-center items-center space-y-8">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  x: [-100, 100, -100],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                style={{
                  maxWidth: `${50 + i * 10}%`
                }}
              />
            ))}
          </div>
        </ParallaxLayer>

        {/* Content sections */}
        <div className="relative pt-[100vh]">
          <section className="min-h-screen flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl text-center"
            >
              <h3 className="text-5xl font-bold text-white mb-6">
                Immersive 3D Experience
              </h3>
              <p className="text-xl text-cyan-300 font-mono leading-relaxed">
                Scroll through dimensions where retro aesthetics meet futuristic design.
                Every movement creates a new perspective in this parallax universe.
              </p>
            </motion.div>
          </section>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-cyan-400 font-mono">INITIALIZING DIMENSIONS...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .glitch-text {
          position: relative;
          text-shadow: 
            0.05em 0 0 rgba(255, 0, 0, .75),
            -0.025em -0.05em 0 rgba(0, 255, 0, .75),
            0.025em 0.05em 0 rgba(0, 0, 255, .75);
          animation: glitch 1s infinite;
        }

        @keyframes glitch {
          0% {
            text-shadow: 
              0.05em 0 0 rgba(255, 0, 0, .75),
              -0.05em -0.025em 0 rgba(0, 255, 0, .75),
              0.025em 0.05em 0 rgba(0, 0, 255, .75);
          }
          14% {
            text-shadow: 
              0.05em 0 0 rgba(255, 0, 0, .75),
              -0.05em -0.025em 0 rgba(0, 255, 0, .75),
              0.025em 0.05em 0 rgba(0, 0, 255, .75);
          }
          15% {
            text-shadow: 
              -0.05em -0.025em 0 rgba(255, 0, 0, .75),
              0.025em 0.025em 0 rgba(0, 255, 0, .75),
              -0.05em -0.05em 0 rgba(0, 0, 255, .75);
          }
          49% {
            text-shadow: 
              -0.05em -0.025em 0 rgba(255, 0, 0, .75),
              0.025em 0.025em 0 rgba(0, 255, 0, .75),
              -0.05em -0.05em 0 rgba(0, 0, 255, .75);
          }
          50% {
            text-shadow: 
              0.025em 0.05em 0 rgba(255, 0, 0, .75),
              0.05em 0 0 rgba(0, 255, 0, .75),
              0 -0.05em 0 rgba(0, 0, 255, .75);
          }
          99% {
            text-shadow: 
              0.025em 0.05em 0 rgba(255, 0, 0, .75),
              0.05em 0 0 rgba(0, 255, 0, .75),
              0 -0.05em 0 rgba(0, 0, 255, .75);
          }
          100% {
            text-shadow: 
              -0.025em 0 0 rgba(255, 0, 0, .75),
              -0.025em -0.025em 0 rgba(0, 255, 0, .75),
              -0.025em -0.05em 0 rgba(0, 0, 255, .75);
          }
        }
      `}</style>
    </motion.div>
  )
}