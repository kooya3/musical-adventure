"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorFallback 
            error={this.state.error} 
            resetError={() => this.setState({ hasError: false })}
          />
        )
      )
    }

    return this.props.children
  }
}

function ErrorFallback({ 
  error, 
  resetError 
}: { 
  error?: Error
  resetError: () => void 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
    >
      <div className="mb-4">
        <svg
          className="w-20 h-20 text-purple-500 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Oops! Something went wrong
      </h2>
      <p className="text-white/60 mb-6 max-w-md">
        {error?.message || 'The 3D content failed to load. Please try refreshing the page.'}
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={resetError}
        className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
      >
        Try Again
      </motion.button>
    </motion.div>
  )
}

export default ErrorBoundary