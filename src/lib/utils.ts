import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function lerp(start: number, end: number, factor: number): number {
  return start * (1 - factor) + end * factor
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function map(
  value: number,
  start1: number,
  stop1: number,
  start2: number,
  stop2: number
): number {
  return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function isMobile(): boolean {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

export function getDevicePixelRatio(): number {
  if (typeof window === "undefined") return 1
  return Math.min(window.devicePixelRatio || 1, 2)
}

export function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return false
  
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    return !!(gl && gl instanceof WebGLRenderingContext)
  } catch (e) {
    return false
  }
}

export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export function getRandomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function getRandomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// Performance monitoring utilities
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  if (typeof performance === "undefined") return fn()
  
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  console.log(`${name} took ${(end - start).toFixed(2)}ms`)
  return result
}

export function getWebGLInfo(): {
  renderer: string
  vendor: string
  maxTextureSize: number
  maxVertexUniforms: number
  maxFragmentUniforms: number
} | null {
  if (!isWebGLSupported()) return null
  
  const canvas = document.createElement("canvas")
  const gl = canvas.getContext("webgl") as WebGLRenderingContext | null
  
  if (!gl) return null
  
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
  
  return {
    renderer: debugInfo 
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) 
      : "Unknown",
    vendor: debugInfo 
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) 
      : "Unknown",
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
    maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
  }
}