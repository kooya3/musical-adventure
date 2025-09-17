"use client"

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Github, Globe, ChevronRight, Code2, Sparkles } from 'lucide-react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { gsap } from 'gsap'
import PortalAssetGallery from '@/components/3d/PortalAssetGallery'
import { HyperText } from '@/components/magicui/hyper-text'
import { LineShadowText } from '@/components/magicui/line-shadow-text'

export interface ProjectData {
  id: string
  title: string
  description: string
  longDescription: string
  image: string
  tags: string[]
  liveUrl?: string
  githubUrl?: string
  demoUrl?: string
  features?: string[]
  techStack?: string[]
  role?: string
  team?: string
  duration?: string
  challenges?: string[]
  solutions?: string[]
  impact?: string
  metrics?: {
    label: string
    value: string
  }[]
  gallery?: string[]
  color: {
    primary: string
    secondary: string
  }
}

interface ProjectPortalProps {
  project: ProjectData | null
  isOpen: boolean
  onClose: () => void
}

export default function ProjectPortal({ project, isOpen, onClose }: ProjectPortalProps) {
  const portalRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const threeRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    particles: THREE.Points
  } | null>(null)
  const animationFrameRef = useRef<number>()

  // Initialize Three.js background
  useEffect(() => {
    if (!isOpen || !sceneRef.current || !project) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    sceneRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5

    // Create particle system with project colors
    const particlesGeometry = new THREE.BufferGeometry()
    const particleCount = 1000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    const color1 = new THREE.Color(project.color.primary)
    const color2 = new THREE.Color(project.color.secondary)
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Create a spiral formation
      const angle = (i / 3) * 0.1
      const radius = (i / 3) * 0.01
      
      positions[i] = Math.cos(angle) * radius * 10
      positions[i + 1] = (Math.random() - 0.5) * 10
      positions[i + 2] = Math.sin(angle) * radius * 10
      
      const mixFactor = Math.random()
      const mixedColor = color1.clone().lerp(color2, mixFactor)
      colors[i] = mixedColor.r
      colors[i + 1] = mixedColor.g
      colors[i + 2] = mixedColor.b
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    // Add dynamic lighting
    const light1 = new THREE.PointLight(project.color.primary, 2, 10)
    light1.position.set(5, 5, 5)
    scene.add(light1)

    const light2 = new THREE.PointLight(project.color.secondary, 2, 10)
    light2.position.set(-5, -5, -5)
    scene.add(light2)

    threeRef.current = {
      scene,
      camera,
      renderer,
      controls,
      particles
    }

    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      
      if (threeRef.current) {
        const elapsedTime = clock.getElapsedTime()
        
        // Rotate particles
        threeRef.current.particles.rotation.y = elapsedTime * 0.1
        threeRef.current.particles.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2
        
        // Animate lights
        light1.position.x = Math.cos(elapsedTime) * 5
        light1.position.z = Math.sin(elapsedTime) * 5
        
        light2.position.x = Math.sin(elapsedTime) * 5
        light2.position.z = Math.cos(elapsedTime) * 5
        
        threeRef.current.controls.update()
        threeRef.current.renderer.render(threeRef.current.scene, threeRef.current.camera)
      }
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (threeRef.current) {
        threeRef.current.camera.aspect = window.innerWidth / window.innerHeight
        threeRef.current.camera.updateProjectionMatrix()
        threeRef.current.renderer.setSize(window.innerWidth, window.innerHeight)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (threeRef.current) {
        threeRef.current.renderer.dispose()
        sceneRef.current?.removeChild(threeRef.current.renderer.domElement)
      }
    }
  }, [isOpen, project])

  // Portal opening animation
  useEffect(() => {
    if (isOpen && portalRef.current) {
      gsap.fromTo(
        portalRef.current,
        {
          clipPath: 'circle(0% at 50% 50%)',
        },
        {
          clipPath: 'circle(150% at 50% 50%)',
          duration: 1,
          ease: 'power2.inOut'
        }
      )
    }
  }, [isOpen])

  if (!project) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={portalRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${project.color.primary}20, ${project.color.secondary}20)`,
          }}
        >
          {/* 3D Background */}
          <div ref={sceneRef} className="absolute inset-0" />
          
          {/* Floating 3D Assets Gallery */}
          <PortalAssetGallery 
            projectId={project.id}
            isActive={isOpen}
            primaryColor={project.color.primary}
            secondaryColor={project.color.secondary}
          />

          {/* Content Overlay */}
          <div className="absolute inset-0 overflow-y-auto">
            <div className="min-h-screen px-4 py-20">
              <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-between items-start mb-12"
                >
                  <div>
                    <HyperText
                      className="text-6xl font-bold text-white mb-4"
                      duration={1200}
                      animateOnHover={false}
                      startOnView={false}
                    >
                      {project.title}
                    </HyperText>
                    <p className="text-xl text-white/80 max-w-2xl">
                      {project.longDescription}
                    </p>
                  </div>
                  
                  <button
                    onClick={onClose}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Left Column - Project Details */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 space-y-8"
                  >
                    {/* Features */}
                    {project.features && (
                      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                          <Sparkles className="w-6 h-6" style={{ color: project.color.primary }} />
                          <LineShadowText shadowColor={project.color.primary}>
                            Key Features
                          </LineShadowText>
                        </h3>
                        <ul className="space-y-3">
                          {project.features.map((feature, index) => (
                            <motion.li
                              key={index}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                              className="flex items-start gap-3 text-white/80"
                            >
                              <ChevronRight className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: project.color.secondary }} />
                              <span>{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tech Stack */}
                    {project.techStack && (
                      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                          <Code2 className="w-6 h-6" style={{ color: project.color.primary }} />
                          <LineShadowText shadowColor={project.color.secondary}>
                            Tech Stack
                          </LineShadowText>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.map((tech, index) => (
                            <motion.span
                              key={index}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.6 + index * 0.05 }}
                              className="px-3 py-1 bg-white/10 rounded-full text-white/90 text-sm"
                              style={{ 
                                borderColor: project.color.primary,
                                borderWidth: '1px',
                                borderStyle: 'solid'
                              }}
                            >
                              {tech}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Challenges & Solutions */}
                    {project.challenges && project.solutions && (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                          <h3 className="text-xl font-bold text-white mb-4">Challenges</h3>
                          <ul className="space-y-2">
                            {project.challenges.map((challenge, index) => (
                              <li key={index} className="text-white/70 text-sm">
                                • {challenge}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                          <h3 className="text-xl font-bold text-white mb-4">Solutions</h3>
                          <ul className="space-y-2">
                            {project.solutions.map((solution, index) => (
                              <li key={index} className="text-white/70 text-sm">
                                • {solution}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Right Column - Project Info */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Actions */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-white/10 to-white/5 rounded-xl hover:from-white/20 hover:to-white/10 transition-all"
                        >
                          <span className="text-white font-medium">View Live</span>
                          <ExternalLink className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                        >
                          <span className="text-white font-medium">Source Code</span>
                          <Github className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                        >
                          <span className="text-white font-medium">Demo</span>
                          <Globe className="w-5 h-5 text-white" />
                        </a>
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
                      {project.role && (
                        <div>
                          <p className="text-white/60 text-sm">Role</p>
                          <p className="text-white font-medium">{project.role}</p>
                        </div>
                      )}
                      {project.team && (
                        <div>
                          <p className="text-white/60 text-sm">Team</p>
                          <p className="text-white font-medium">{project.team}</p>
                        </div>
                      )}
                      {project.duration && (
                        <div>
                          <p className="text-white/60 text-sm">Duration</p>
                          <p className="text-white font-medium">{project.duration}</p>
                        </div>
                      )}
                    </div>

                    {/* Metrics */}
                    {project.metrics && (
                      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4">Impact</h3>
                        <div className="space-y-3">
                          {project.metrics.map((metric, index) => (
                            <div key={index}>
                              <p className="text-white/60 text-sm">{metric.label}</p>
                              <p className="text-2xl font-bold" style={{ color: project.color.primary }}>
                                {metric.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white/5 border border-white/20 rounded-full text-white/70 text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}