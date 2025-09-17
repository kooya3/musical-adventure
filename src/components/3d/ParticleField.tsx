"use client"

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'

interface ParticleFieldProps {
  count?: number
  mouseInteraction?: boolean
}

export default function ParticleField({ 
  count = 2000,
  mouseInteraction = true 
}: ParticleFieldProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    particles: THREE.Points
    mouse: THREE.Vector2
  } | null>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 50

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mountRef.current.appendChild(renderer.domElement)

    // Create particle system
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const randomness = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // Sphere distribution
      const radius = Math.random() * 100
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos((Math.random() * 2) - 1)
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
      
      // Random movement factors
      randomness[i3] = Math.random() - 0.5
      randomness[i3 + 1] = Math.random() - 0.5
      randomness[i3 + 2] = Math.random() - 0.5
      
      // Color gradient from purple to cyan
      const color = new THREE.Color()
      const hue = 0.7 + (Math.random() * 0.3)
      color.setHSL(hue, 1, 0.6)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
      
      scales[i] = Math.random() * 2
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1))
    geometry.setAttribute('randomness', new THREE.BufferAttribute(randomness, 3))

    // Custom shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        
        attribute float scale;
        attribute vec3 randomness;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          vec3 pos = position;
          
          // Subtle wave motion
          pos.x += sin(uTime * 0.5 + randomness.x * 10.0) * randomness.x * 0.5;
          pos.y += cos(uTime * 0.5 + randomness.y * 10.0) * randomness.y * 0.5;
          pos.z += sin(uTime * 0.5 + randomness.z * 10.0) * randomness.z * 0.5;
          
          // Mouse repulsion
          vec2 mouseOffset = uMouse * 50.0;
          float dist = distance(pos.xy, mouseOffset);
          if (dist < 20.0) {
            vec2 direction = normalize(pos.xy - mouseOffset);
            pos.xy += direction * (20.0 - dist) * 0.5;
          }
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = scale * 300.0 / -mvPosition.z;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          // Circular particle shape
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          // Soft edges
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    const mouse = new THREE.Vector2()
    sceneRef.current = { scene, camera, renderer, particles, mouse }

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      if (!sceneRef.current || !mouseInteraction) return
      
      sceneRef.current.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      sceneRef.current.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      
      if (material.uniforms.uMouse) {
        gsap.to(material.uniforms.uMouse.value, {
          x: sceneRef.current.mouse.x,
          y: sceneRef.current.mouse.y,
          duration: 0.5
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      requestAnimationFrame(animate)
      
      const elapsedTime = clock.getElapsedTime()
      
      // Update time uniform
      material.uniforms.uTime.value = elapsedTime
      
      // Very subtle particle system rotation
      particles.rotation.y = elapsedTime * 0.01  // Much slower
      particles.rotation.x = Math.sin(elapsedTime * 0.1) * 0.02  // Much subtler
      
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!sceneRef.current) return
      
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      
      renderer.dispose()
      geometry.dispose()
      material.dispose()
    }
  }, [count, mouseInteraction])

  return (
    <div 
      ref={mountRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}