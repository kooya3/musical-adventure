"use client"

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  PresentationControls,
  Float,
  Text,
  MeshReflectorMaterial,
  Sparkles,
  Stars
} from '@react-three/drei'
import * as THREE from 'three'
import { useResponsive } from '@/hooks/useResponsive'
import { SITE_CONFIG, ANIMATIONS } from '@/lib/constants'
import ModelViewer from '@/components/3d/ModelViewer'
import { useModels } from '@/contexts/ModelContext'

function FloatingModelScene() {
  const { state } = useModels()
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  // Only render if DamagedHelmet is loaded
  const isMainModelLoaded = state.loadedModels.has('DamagedHelmet')
  
  if (!isMainModelLoaded) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial 
            color="#6366f1" 
            emissive="#4338ca" 
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
        <Sparkles count={100} scale={4} size={2} speed={0.4} />
      </group>
    )
  }

  return (
    <group ref={groupRef}>
      <Float speed={1} rotationIntensity={0.3} floatIntensity={0.2}>
        <ModelViewer
          modelName="DamagedHelmet"
          variant="glTF-Binary"
          scale={2}
          autoRotate={false}
          enableControls={false}
          environment="sunset"
          showShadows={true}
        />
      </Float>
      
      {/* Ambient particles */}
      <Sparkles 
        count={50} 
        scale={6} 
        size={3} 
        speed={0.2} 
        color="#6366f1"
      />
    </group>
  )
}

function Scene3D() {
  return (
    <>
      <color attach="background" args={['transparent']} />
      
      {/* Lighting setup */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        color="#06b6d4"
      />

      {/* Environment */}
      <Environment preset="night" background={false} />
      <Stars radius={300} depth={60} count={1000} factor={7} />

      {/* Main model scene */}
      <FloatingModelScene />

      {/* Reflective ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={50}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.5}
        />
      </mesh>

      {/* Presentation controls for interaction */}
      <PresentationControls
        global
        config={{ mass: 2, tension: 500 }}
        snap={{ mass: 4, tension: 1500 }}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
      />
    </>
  )
}

export default function Enhanced3DHeroScene() {
  const { isMobile } = useResponsive()
  const { state } = useModels()
  const [show3D, setShow3D] = useState(false)

  useEffect(() => {
    // Show 3D scene after a delay to allow for initial page load
    const timer = setTimeout(() => {
      setShow3D(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Animated background gradient */}
      <motion.div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 255, 198, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, #0f0f23 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f0f23 100%)
          `
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear"
        }}
      />

      {/* 3D Scene */}
      {!isMobile && show3D && (
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [5, 2, 5], fov: 50 }}
            gl={{ 
              antialias: true,
              alpha: true,
              powerPreference: "high-performance"
            }}
            dpr={[1, 1.5]}
            shadows
          >
            <Scene3D />
          </Canvas>
        </div>
      )}

      {/* Mobile fallback or loading state */}
      {(isMobile || !show3D || state.isLoading) && (
        <div className="absolute inset-0">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Loading state */}
            {state.isLoading && (
              <motion.div
                className="text-center text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <div className="text-lg font-medium">Loading 3D Experience</div>
                <div className="text-sm opacity-75">
                  {state.loadedCount} / {state.totalModels} models loaded
                </div>
                <div className="w-64 bg-gray-700 rounded-full h-2 mt-2 mx-auto">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${state.totalModels > 0 ? (state.loadedCount / state.totalModels) * 100 : 0}%`
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Mobile/fallback visual */}
            {(isMobile || (!state.isLoading && !show3D)) && (
              <>
                {/* Central glowing orb */}
                <motion.div
                  className="relative w-48 h-48 rounded-full"
                  style={{
                    background: "radial-gradient(circle, #6366f1 0%, #4338ca 50%, #312e81 100%)",
                    boxShadow: "0 0 100px #6366f1, inset 0 0 50px #4338ca",
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <motion.div
                    className="absolute inset-4 rounded-full"
                    style={{
                      background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
                    }}
                    animate={{
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>

                {/* Floating code elements */}
                {[...Array(6)].map((_, i) => {
                  const symbols = ['<>', '{}', '[]', '/>', '()', '&&']
                  const positions = [
                    { top: '20%', left: '15%' },
                    { top: '70%', left: '80%' },
                    { top: '30%', left: '85%' },
                    { top: '80%', left: '20%' },
                    { top: '15%', left: '70%' },
                    { top: '60%', left: '10%' },
                  ]
                  
                  return (
                    <motion.div
                      key={i}
                      className="absolute text-3xl font-mono text-blue-400 opacity-20"
                      style={positions[i]}
                      animate={{
                        y: [0, -20, 0],
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 4 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "easeInOut"
                      }}
                    >
                      {symbols[i]}
                    </motion.div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* Content overlay */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="container mx-auto px-6 lg:px-8">
          <div className={`grid ${isMobile ? 'grid-cols-1 text-center' : 'lg:grid-cols-2'} gap-12 items-center`}>
            
            <motion.div
              className={`${isMobile ? 'order-2' : ''} space-y-8`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: ANIMATIONS.duration.slow,
                ease: ANIMATIONS.ease.smooth 
              }}
            >
              <div className="space-y-4">
                <motion.h1
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.2,
                    duration: ANIMATIONS.duration.medium 
                  }}
                >
                  <span className="block">Hi, I'm</span>
                  <motion.span 
                    className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    Elyees Tatua
                  </motion.span>
                </motion.h1>

                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.4,
                    duration: ANIMATIONS.duration.medium 
                  }}
                >
                  <p className="text-xl md:text-2xl text-gray-300 font-light">
                    Frontend Software Engineer
                  </p>
                  <p className="text-lg md:text-xl text-gray-400">
                    3D Web Experience Developer
                  </p>
                </motion.div>

                <motion.p
                  className="text-gray-400 text-lg max-w-lg leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.6,
                    duration: ANIMATIONS.duration.medium 
                  }}
                >
                  Crafting immersive web experiences with cutting-edge 3D technologies 
                  and modern frameworks. Bringing digital ideas to life.
                </motion.p>
              </div>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.8,
                  duration: ANIMATIONS.duration.medium 
                }}
              >
                <motion.button 
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-300"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(99, 102, 241, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore 3D Gallery
                </motion.button>
                <motion.button 
                  className="px-8 py-3 border-2 border-white/20 text-white hover:border-white/40 hover:bg-white/10 font-semibold rounded-full transition-all duration-300"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Projects
                </motion.button>
              </motion.div>

              {/* Achievement badge */}
              <motion.div
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: 1,
                  duration: ANIMATIONS.duration.medium 
                }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.span 
                  className="text-2xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🏆
                </motion.span>
                <span className="text-yellow-300 font-medium">
                  AI Hackathon Winner • 3D Web Specialist
                </span>
              </motion.div>
            </motion.div>

            {/* Right side - Reserved for 3D or mobile visual */}
            <div className="relative h-64 lg:h-full">
              {/* This space is taken by the 3D canvas on desktop */}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: 1.5,
          duration: ANIMATIONS.duration.medium 
        }}
      >
        <motion.div 
          className="flex flex-col items-center space-y-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-sm uppercase tracking-wider">Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/60 to-transparent"></div>
        </motion.div>
      </motion.div>
    </section>
  )
}