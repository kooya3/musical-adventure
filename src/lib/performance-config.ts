/**
 * Performance configuration for 3D rendering
 * Optimizes rendering settings based on device capabilities
 */

export interface PerformanceConfig {
  shadows: boolean
  dpr: [number, number]
  antialias: boolean
  powerPreference: 'default' | 'high-performance' | 'low-power'
  alpha: boolean
  stencil: boolean
  depth: boolean
  logarithmicDepthBuffer: boolean
  maxLights: number
  shadowMapSize: number
  environmentResolution: number
  modelScale: number
}

export interface DeviceCapabilities {
  isLowEnd: boolean
  isMobile: boolean
  hasWebGL2: boolean
  maxTextureSize: number
  renderer: string
  vendorPrefix: string
}

class PerformanceOptimizer {
  private capabilities: DeviceCapabilities | null = null

  getDeviceCapabilities(): DeviceCapabilities {
    if (this.capabilities) return this.capabilities

    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    
    if (!gl) {
      this.capabilities = {
        isLowEnd: true,
        isMobile: true,
        hasWebGL2: false,
        maxTextureSize: 512,
        renderer: 'unknown',
        vendorPrefix: 'unknown'
      }
      return this.capabilities
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown'
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown'
    
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
    const hasWebGL2 = !!(canvas.getContext('webgl2'))
    
    // Detect mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    // Detect low-end devices based on various factors
    const isLowEnd = (
      maxTextureSize < 2048 ||
      !hasWebGL2 ||
      navigator.hardwareConcurrency <= 2 ||
      (isMobile && !renderer.toLowerCase().includes('adreno 6')) ||
      renderer.toLowerCase().includes('powervr') ||
      renderer.toLowerCase().includes('mali-4')
    )

    this.capabilities = {
      isLowEnd,
      isMobile,
      hasWebGL2,
      maxTextureSize,
      renderer,
      vendorPrefix: vendor
    }

    return this.capabilities
  }

  getOptimalConfig(): PerformanceConfig {
    const capabilities = this.getDeviceCapabilities()
    
    if (capabilities.isLowEnd) {
      return {
        shadows: false,
        dpr: [1, 1],
        antialias: false,
        powerPreference: 'low-power',
        alpha: true,
        stencil: false,
        depth: true,
        logarithmicDepthBuffer: false,
        maxLights: 2,
        shadowMapSize: 256,
        environmentResolution: 256,
        modelScale: 0.8
      }
    }

    if (capabilities.isMobile) {
      return {
        shadows: true,
        dpr: [1, 1.5],
        antialias: true,
        powerPreference: 'default',
        alpha: true,
        stencil: false,
        depth: true,
        logarithmicDepthBuffer: false,
        maxLights: 4,
        shadowMapSize: 512,
        environmentResolution: 512,
        modelScale: 0.9
      }
    }

    // Desktop high-performance config
    return {
      shadows: true,
      dpr: [1, 2],
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
      stencil: true,
      depth: true,
      logarithmicDepthBuffer: capabilities.hasWebGL2,
      maxLights: 8,
      shadowMapSize: 1024,
      environmentResolution: 1024,
      modelScale: 1
    }
  }

  getLoadingStrategy(): 'eager' | 'lazy' | 'progressive' {
    const capabilities = this.getDeviceCapabilities()
    
    if (capabilities.isLowEnd) return 'lazy'
    if (capabilities.isMobile) return 'progressive'
    return 'eager'
  }

  shouldUseCompressedTextures(): boolean {
    const capabilities = this.getDeviceCapabilities()
    return capabilities.isMobile || capabilities.isLowEnd
  }

  getModelLOD(): 'low' | 'medium' | 'high' {
    const capabilities = this.getDeviceCapabilities()
    
    if (capabilities.isLowEnd) return 'low'
    if (capabilities.isMobile) return 'medium'
    return 'high'
  }

  logPerformanceInfo(): void {
    const capabilities = this.getDeviceCapabilities()
    const config = this.getOptimalConfig()
    
    console.log('🎮 3D Performance Configuration:', {
      device: {
        isLowEnd: capabilities.isLowEnd,
        isMobile: capabilities.isMobile,
        hasWebGL2: capabilities.hasWebGL2,
        renderer: capabilities.renderer,
        maxTextureSize: capabilities.maxTextureSize
      },
      rendering: {
        shadows: config.shadows,
        dpr: config.dpr,
        antialias: config.antialias,
        powerPreference: config.powerPreference
      },
      optimization: {
        loadingStrategy: this.getLoadingStrategy(),
        compressedTextures: this.shouldUseCompressedTextures(),
        modelLOD: this.getModelLOD()
      }
    })
  }
}

// Singleton instance
export const performanceOptimizer = new PerformanceOptimizer()

// Utility function to get performance config
export const getPerformanceConfig = (): PerformanceConfig => {
  return performanceOptimizer.getOptimalConfig()
}

// Enhanced model configurations with performance variants
export const getOptimalModelVariant = (modelName: string): string => {
  const lod = performanceOptimizer.getModelLOD()
  const useCompressed = performanceOptimizer.shouldUseCompressedTextures()
  
  // Priority: Draco (compressed) > Binary > Standard glTF
  if (useCompressed && lod !== 'low') {
    return 'glTF-Draco'
  }
  
  if (lod === 'high') {
    return 'glTF'
  }
  
  return 'glTF-Binary'
}

// Animation performance settings
export const getAnimationConfig = () => {
  const capabilities = performanceOptimizer.getDeviceCapabilities()
  
  return {
    enabled: !capabilities.isLowEnd,
    quality: capabilities.isLowEnd ? 'low' : capabilities.isMobile ? 'medium' : 'high',
    fps: capabilities.isLowEnd ? 30 : 60,
    complexity: capabilities.isLowEnd ? 'simple' : 'full'
  }
}