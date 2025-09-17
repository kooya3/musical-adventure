"use client"

import React from 'react'
import TestCanvas from '@/components/3d/TestCanvas'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          React Three Fiber Test
        </h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Basic Canvas Test</h2>
            <TestCanvas />
          </div>
          
          <div className="text-center text-gray-400">
            <p>If you see a rotating orange cube, React Three Fiber is working correctly!</p>
            <p className="text-sm mt-2">Check browser console for any errors.</p>
          </div>
        </div>
      </div>
    </div>
  )
}