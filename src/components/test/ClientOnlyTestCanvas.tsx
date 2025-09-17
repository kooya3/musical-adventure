"use client"

import dynamic from 'next/dynamic'

const TestCanvas = dynamic(() => import('./TestCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-gray-400">Loading 3D Canvas...</div>
    </div>
  )
})

export default function ClientOnlyTestCanvas() {
  return <TestCanvas />
}