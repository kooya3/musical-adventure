"use client"

import React from "react"
import { motion } from "framer-motion"
import { useResponsive } from "@/hooks/useResponsive"
import { SITE_CONFIG, ANIMATIONS } from "@/lib/constants"

// Simple CSS-based 3D animations for now - we'll enhance with R3F later
function FloatingElement({ 
  position, 
  size = 60, 
  color = "#4f46e5",
  delay = 0 
}: { 
  position: { top: string, left: string }
  size?: number
  color?: string
  delay?: number
}) {
  return (
    <motion.div
      className="absolute rounded-lg opacity-20"
      style={{
        top: position.top,
        left: position.left,
        width: size,
        height: size,
        backgroundColor: color,
      }}
      animate={{
        y: [0, -20, 0],
        rotateX: [0, 360],
        rotateY: [0, -360],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  )
}

function MainVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
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
        {/* Inner glow effect */}
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

      {/* Floating geometric elements */}
      <FloatingElement 
        position={{ top: "20%", left: "15%" }} 
        color="#ec4899" 
        size={40}
        delay={0}
      />
      <FloatingElement 
        position={{ top: "70%", left: "80%" }} 
        color="#06b6d4" 
        size={55}
        delay={1}
      />
      <FloatingElement 
        position={{ top: "30%", left: "85%" }} 
        color="#f59e0b" 
        size={35}
        delay={2}
      />
      <FloatingElement 
        position={{ top: "80%", left: "20%" }} 
        color="#10b981" 
        size={45}
        delay={1.5}
      />
      <FloatingElement 
        position={{ top: "15%", left: "70%" }} 
        color="#8b5cf6" 
        size={30}
        delay={2.5}
      />

      {/* Animated code symbols */}
      <motion.div
        className="absolute text-6xl font-mono text-blue-400 opacity-10"
        style={{ top: "25%", left: "25%" }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        &lt;/&gt;
      </motion.div>
      <motion.div
        className="absolute text-4xl font-mono text-purple-400 opacity-10"
        style={{ top: "60%", right: "25%" }}
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        {}
      </motion.div>
    </div>
  )
}

export default function HeroScene() {
  const { isMobile } = useResponsive()

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background with animated gradient */}
      <motion.div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0f0f23 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f0f23 100%)"
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

      {/* Animated particles background */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => {
          // Use deterministic positioning based on index to avoid hydration mismatch
          const leftPercent = (i * 7.3 + 15) % 100
          const topPercent = (i * 11.7 + 25) % 100
          const duration = 3 + (i % 4)
          const delay = (i * 0.3) % 3
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.1, 0.7, 0.1],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: "easeInOut"
              }}
            />
          )
        })}
      </div>
      
      {/* 3D Visual Area */}
      {!isMobile && (
        <div className="absolute inset-0">
          <MainVisual />
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
                    Full-Stack Developer
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
                  Crafting exceptional web experiences with modern technologies. 
                  4+ years of turning ideas into scalable, interactive applications.
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
                <motion.a 
                  href="/Elyees_Tatua_CV_2025.pdf"
                  download="Elyees_Tatua_CV_2025.pdf"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-300"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(99, 102, 241, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Download CV
                </motion.a>
                <motion.a
                  href="mailto:elyees.dev@gmail.com?subject=Hello%20from%20your%20Portfolio!&body=Hi%20Elyees,%0D%0A%0D%0AI%20found%20your%20portfolio%20and%20would%20love%20to%20connect!"
                  className="inline-block px-8 py-3 border-2 border-white/20 text-white hover:border-white/40 hover:bg-white/10 font-semibold rounded-full transition-all duration-300"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get In Touch
                </motion.a>
              </motion.div>

              {/* Achievement badge with enhanced animation */}
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
                  Davis & Shirtliff AI Hackathon Winner
                </span>
              </motion.div>
            </motion.div>

            {/* Mobile visual */}
            {isMobile && (
              <motion.div
                className="relative h-64 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: 1.2,
                  duration: ANIMATIONS.duration.slow 
                }}
              >
                <motion.div
                  className="w-32 h-32 rounded-full"
                  style={{
                    background: "radial-gradient(circle, #6366f1 0%, #4338ca 100%)",
                    boxShadow: "0 0 50px #6366f1",
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </motion.div>
            )}
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
          <span className="text-sm uppercase tracking-wider">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/60 to-transparent"></div>
        </motion.div>
      </motion.div>
    </section>
  )
}