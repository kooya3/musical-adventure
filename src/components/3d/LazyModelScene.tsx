"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import ErrorBoundary from '@/components/ErrorBoundary'

// Lazy load the 3D model component
const InteractiveModelScene = dynamic(
  () => import('./InteractiveModelScene'),
  {
    ssr: false,
    loading: () => <ModelLoader />
  }
)

function ModelLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="relative w-24 h-24 mx-auto mb-4">
          <motion.div
            className="absolute inset-0 border-4 border-purple-500/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 border-4 border-t-purple-500 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="text-white/60 text-sm">Loading 3D Model...</p>
      </motion.div>
    </div>
  )
}

interface LazyModelSceneProps {
  modelName?: string
  className?: string
}

export default function LazyModelScene({ 
  modelName = 'BoomBox',
  className = '' 
}: LazyModelSceneProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ModelLoader />}>
        <InteractiveModelScene 
          modelName={modelName}
          className={className}
        />
      </Suspense>
    </ErrorBoundary>
  )
}