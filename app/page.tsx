"use client"

import React, { useState, useEffect } from "react"
import SimpleFallbackScene from "@/components/scenes/SimpleFallbackScene"
import NavigationMenu from "@/components/ui/NavigationMenu" 
import Loader from "@/components/ui/Loader"
import SmoothScroll from "@/components/layout/SmoothScroll"
// import ModelGallery from "@/components/3d/ModelGallery"
// import ModelViewer from "@/components/3d/ModelViewer"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [isContentReady, setIsContentReady] = useState(false)

  useEffect(() => {
    // Simulate initial loading time for assets
    const timer = setTimeout(() => {
      setIsContentReady(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <SmoothScroll>
      <Loader isLoading={isLoading} onComplete={handleLoadingComplete} />
      
      {isContentReady && (
        <>
          <NavigationMenu />
          
          <main className="relative">
            {/* Hero Section */}
            <section id="home">
              <SimpleFallbackScene />
            </section>

            {/* About Section with 3D Model */}
            <section 
              id="about" 
              className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden"
            >
              <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="text-center lg:text-left">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      About Me
                    </h2>
                    <div className="space-y-6 text-lg text-gray-300 max-w-2xl">
                      <p>
                        I'm a passionate Frontend Software Engineer with 4+ years of experience 
                        crafting exceptional web experiences. My journey spans from traditional 
                        web development to cutting-edge 3D interactive applications.
                      </p>
                      <p>
                        From winning hackathons to contributing to Y Combinator startups, 
                        I bring a unique blend of technical expertise and creative vision 
                        to every project.
                      </p>
                      <div className="flex flex-wrap gap-3 pt-4">
                        {['React', 'Next.js', 'Three.js', 'TypeScript', 'WebGL'].map((tech) => (
                          <span 
                            key={tech}
                            className="px-4 py-2 bg-blue-600/20 text-blue-300 text-sm font-medium rounded-full border border-blue-500/20"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="relative h-96 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
                    <div className="text-center text-gray-400">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🥑</span>
                      </div>
                      <p className="text-sm font-medium">3D Avocado Model</p>
                      <p className="text-xs opacity-75">Loading 3D experience...</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Skills Section with Flight Helmet */}
            <section 
              id="skills" 
              className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900 relative"
            >
              <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Technical Skills
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
                    Cutting-edge technologies and frameworks powering modern web experiences
                  </p>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="relative h-96 order-2 lg:order-1 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
                    <div className="text-center text-gray-400">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🪖</span>
                      </div>
                      <p className="text-sm font-medium">3D Flight Helmet Model</p>
                      <p className="text-xs opacity-75">Loading 3D experience...</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8 order-1 lg:order-2">
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { name: 'React/Next.js', level: 95, color: 'from-blue-500 to-cyan-500' },
                        { name: 'Three.js/WebGL', level: 85, color: 'from-green-500 to-emerald-500' },
                        { name: 'TypeScript', level: 90, color: 'from-blue-600 to-blue-400' },
                        { name: 'Node.js', level: 80, color: 'from-green-600 to-lime-500' },
                      ].map((skill) => (
                        <div key={skill.name} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-medium">{skill.name}</span>
                            <span className="text-gray-400 text-sm">{skill.level}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`bg-gradient-to-r ${skill.color} h-2 rounded-full transition-all duration-1000`}
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Projects Section with Model Gallery */}
            <section 
              id="projects" 
              className="min-h-screen py-20 bg-gradient-to-br from-purple-900 to-slate-900"
            >
              <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    3D Model Showcase
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                    Explore these interactive glTF 2.0 models demonstrating real-time 3D rendering capabilities
                  </p>
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                    <span className="text-2xl">🎮</span>
                    <span className="text-yellow-300 font-medium">
                      Interactive • Drag to rotate • Scroll to zoom
                    </span>
                  </div>
                </div>
                
                {/* Placeholder for Model Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {[
                    { name: 'Damaged Helmet', icon: '🪖', description: 'Classic PBR showcase model with realistic materials and textures' },
                    { name: 'Flight Helmet', icon: '✈️', description: 'High-fidelity aviation helmet with detailed materials' },
                    { name: 'Retro Boom Box', icon: '📻', description: 'Vintage audio equipment with technical precision' },
                    { name: 'Avocado', icon: '🥑', description: 'Organic modeling with realistic surface details' },
                    { name: 'Classic Duck', icon: '🦆', description: 'Simple yet charming character model' }
                  ].map((model, index) => (
                    <div key={model.name} className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
                      <div className="relative h-64 md:h-80 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <div className="text-6xl mb-4">{model.icon}</div>
                          <div className="w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <div className="text-xs">Loading 3D model...</div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">{model.name}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{model.description}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="inline-block px-2 py-1 bg-blue-600/20 text-blue-300 text-xs font-medium rounded">
                            glTF-Binary
                          </span>
                          <span className="text-yellow-400 text-xs">⏳ Loading...</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Featured Project */}
                <div className="grid lg:grid-cols-2 gap-12 items-center mt-20 pt-16 border-t border-gray-700/50">
                  <div>
                    <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      🏆 Award-Winning Project
                    </h3>
                    <h4 className="text-2xl text-white font-semibold mb-4">
                      AI-Powered Product Manual System
                    </h4>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      Winner of the Davis & Shirtliff AI Hackathon. Built an intelligent system 
                      that transforms traditional product manuals into interactive, AI-powered 
                      experiences with 3D visualizations and smart search capabilities.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {['React', 'Three.js', 'OpenAI', 'Python', 'FastAPI'].map((tech) => (
                        <span 
                          key={tech}
                          className="px-3 py-1 bg-yellow-600/20 text-yellow-300 text-sm font-medium rounded-full border border-yellow-500/20"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="relative h-96 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
                    <div className="text-center text-gray-400">
                      <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📻</span>
                      </div>
                      <p className="text-sm font-medium">3D BoomBox Model</p>
                      <p className="text-xs opacity-75">Award-winning project showcase</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section with Duck Model */}
            <section 
              id="contact" 
              className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800"
            >
              <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="text-center lg:text-left">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Let's Connect
                    </h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 mb-8">
                      Ready to build something extraordinary together? Let's discuss your next 
                      project and bring innovative 3D web experiences to life.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
                      <a
                        href="https://github.com/kooya3"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                      >
                        GitHub
                      </a>
                      <a
                        href="https://linkedin.com/in/elyees-tatua"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3 border-2 border-white/20 text-white hover:border-white/40 hover:bg-white/10 font-semibold rounded-full transition-all duration-300"
                      >
                        LinkedIn
                      </a>
                    </div>
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 font-medium">
                        Available for new projects
                      </span>
                    </div>
                  </div>
                  <div className="relative h-96 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
                    <div className="text-center text-gray-400">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🦆</span>
                      </div>
                      <p className="text-sm font-medium">3D Duck Model</p>
                      <p className="text-xs opacity-75">Ready to connect!</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </>
      )}
    </SmoothScroll>
  )
}
