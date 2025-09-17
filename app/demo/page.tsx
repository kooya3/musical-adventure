"use client"

import React from 'react'
import ClientOnlyModelShowcase from '@/components/3d/ClientOnlyModelShowcase'
import ClientOnlyAdvancedModelViewer from '@/components/3d/ClientOnlyAdvancedModelViewer'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-16">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Advanced 3D Model System
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Showcasing our efficient glTF 2.0 rendering system with intelligent model selection, 
            performance optimization, and beautiful presentations.
          </p>
        </div>

        {/* Featured Model */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Featured Model</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <div className="h-96">
                <ClientOnlyAdvancedModelViewer
                  modelName="DamagedHelmet"
                  environment="studio"
                  enableControls={true}
                  autoRotate={true}
                  enableShadows={true}
                  showStats={true}
                  className="w-full h-full rounded-xl overflow-hidden"
                />
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Damaged Helmet</h3>
                <p className="text-gray-400">
                  A battle-worn space helmet showcasing advanced PBR materials, 
                  realistic weathering effects, and high-quality texturing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Model Collections */}
        <div className="space-y-20">
          <ClientOnlyModelShowcase
            title="Hero Models Collection"
            subtitle="Premium quality models perfect for main showcases and hero sections"
            columns={3}
            showFilter={true}
            showStats={false}
            maxModels={9}
          />
        </div>

        {/* System Features */}
        <div className="mt-20 pt-16 border-t border-gray-700/50">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">System Features</h2>
            <p className="text-gray-400 text-lg">Advanced capabilities for efficient 3D rendering</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Model Registry",
                description: "Auto-discovery and categorization of 100+ glTF 2.0 models with intelligent metadata",
                icon: "🎨"
              },
              {
                title: "Device-Aware Loading",
                description: "Automatic selection of optimal model variants based on device capabilities",
                icon: "📱"
              },
              {
                title: "Performance Optimization",
                description: "Dynamic quality adjustment and memory management for smooth rendering",
                icon: "⚡"
              },
              {
                title: "Advanced Caching",
                description: "Efficient model caching and cloning system with memory disposal",
                icon: "💾"
              },
              {
                title: "Progress Tracking",
                description: "Real-time loading progress with detailed stage information",
                icon: "📊"
              },
              {
                title: "Error Recovery",
                description: "Graceful fallbacks and error handling for robust user experience",
                icon: "🛡️"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Technical Stats */}
        <div className="mt-16 text-center">
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6">System Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Available Models", value: "100+", icon: "🎯" },
                { label: "Model Categories", value: "7", icon: "📁" },
                { label: "Supported Formats", value: "6", icon: "🔧" },
                { label: "Performance Profiles", value: "3", icon: "⚙️" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-blue-400 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}