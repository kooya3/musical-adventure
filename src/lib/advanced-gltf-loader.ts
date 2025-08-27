/**
 * Advanced glTF 2.0 Loader System
 * High-performance, memory-efficient 3D model loading with smart caching
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { modelRegistry, ModelInfo, getOptimalVariant } from './model-registry'
import { performanceOptimizer } from './performance-config'

export interface LoadedModel {
  scene: THREE.Group
  animations: THREE.AnimationClip[]
  model: ModelInfo
  variant: string
  loadTime: number
  polyCount: number
  textureCount: number
  fileSize?: number
}

export interface LoadingProgress {
  name: string
  loaded: number
  total: number
  progress: number
  stage: LoadingStage
}

export enum LoadingStage {
  INITIALIZING = 'initializing',
  DOWNLOADING = 'downloading',
  PARSING = 'parsing',
  PROCESSING = 'processing',
  OPTIMIZING = 'optimizing',
  COMPLETE = 'complete',
  ERROR = 'error'
}

export interface ModelLoadOptions {
  enableDraco?: boolean
  enableKTX2?: boolean
  enableMeshopt?: boolean
  maxTextureSize?: number
  generateMipmaps?: boolean
  flipY?: boolean
  castShadow?: boolean
  receiveShadow?: boolean
  onProgress?: (progress: LoadingProgress) => void
  priority?: 'low' | 'normal' | 'high'
}

class AdvancedGLTFLoader {
  private loader: GLTFLoader
  private dracoLoader?: DRACOLoader
  private ktx2Loader?: KTX2Loader
  private cache: Map<string, LoadedModel> = new Map()
  private loadingQueue: Map<string, Promise<LoadedModel>> = new Map()
  private renderer?: THREE.WebGLRenderer
  private loadingStats = {
    totalLoaded: 0,
    totalRequests: 0,
    cacheHits: 0,
    averageLoadTime: 0
  }

  constructor() {
    this.loader = new GLTFLoader()
    this.setupLoaders()
  }

  private setupLoaders(): void {
    const capabilities = performanceOptimizer.getDeviceCapabilities()

    // Setup DRACO loader for compressed geometry
    if (capabilities.hasWebGL2) {
      this.dracoLoader = new DRACOLoader()
      this.dracoLoader.setDecoderPath('/draco/')
      this.dracoLoader.preload()
      this.loader.setDRACOLoader(this.dracoLoader)
    }

    // Setup KTX2 loader for compressed textures (high-end devices only)
    if (!capabilities.isLowEnd && capabilities.hasWebGL2) {
      this.ktx2Loader = new KTX2Loader()
      this.ktx2Loader.setTranscoderPath('/basis/')
      this.loader.setKTX2Loader(this.ktx2Loader)
    }

    // Setup Meshopt decoder for additional compression
    this.loader.setMeshoptDecoder(MeshoptDecoder)
  }

  setRenderer(renderer: THREE.WebGLRenderer): void {
    this.renderer = renderer
    if (this.ktx2Loader) {
      this.ktx2Loader.detectSupport(renderer)
    }
  }

  async loadModel(
    modelName: string, 
    options: ModelLoadOptions = {}
  ): Promise<LoadedModel> {
    const cacheKey = `${modelName}-${JSON.stringify(options)}`
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      this.loadingStats.cacheHits++
      return this.cache.get(cacheKey)!
    }

    // Check if already loading
    if (this.loadingQueue.has(cacheKey)) {
      return this.loadingQueue.get(cacheKey)!
    }

    // Start new loading process
    const loadPromise = this.performLoad(modelName, options)
    this.loadingQueue.set(cacheKey, loadPromise)

    try {
      const result = await loadPromise
      this.cache.set(cacheKey, result)
      this.updateLoadingStats(result.loadTime)
      return result
    } finally {
      this.loadingQueue.delete(cacheKey)
    }
  }

  private async performLoad(
    modelName: string,
    options: ModelLoadOptions
  ): Promise<LoadedModel> {
    const startTime = performance.now()
    this.loadingStats.totalRequests++

    // Get model info from registry
    await modelRegistry.initialize()
    const modelInfo = modelRegistry.getModel(modelName)
    if (!modelInfo) {
      throw new Error(`Model "${modelName}" not found in registry`)
    }

    // Get optimal variant for current device
    const { variant, path } = getOptimalVariant(modelInfo)
    
    // Setup progress tracking
    const progressCallback = (progress: ProgressEvent) => {
      const loadingProgress: LoadingProgress = {
        name: modelName,
        loaded: progress.loaded,
        total: progress.total,
        progress: progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0,
        stage: LoadingStage.DOWNLOADING
      }
      options.onProgress?.(loadingProgress)
    }

    try {
      // Update progress: Initializing
      options.onProgress?.({
        name: modelName,
        loaded: 0,
        total: 100,
        progress: 0,
        stage: LoadingStage.INITIALIZING
      })

      // Load the glTF model
      const gltf = await new Promise<any>((resolve, reject) => {
        this.loader.load(
          path,
          resolve,
          progressCallback,
          reject
        )
      })

      // Update progress: Processing
      options.onProgress?.({
        name: modelName,
        loaded: 80,
        total: 100,
        progress: 80,
        stage: LoadingStage.PROCESSING
      })

      // Process and optimize the loaded model
      const processedModel = await this.processModel(gltf, modelInfo, options)

      // Update progress: Complete
      options.onProgress?.({
        name: modelName,
        loaded: 100,
        total: 100,
        progress: 100,
        stage: LoadingStage.COMPLETE
      })

      const loadTime = performance.now() - startTime
      
      return {
        ...processedModel,
        model: modelInfo,
        variant,
        loadTime
      }

    } catch (error) {
      options.onProgress?.({
        name: modelName,
        loaded: 0,
        total: 100,
        progress: 0,
        stage: LoadingStage.ERROR
      })
      throw new Error(`Failed to load model "${modelName}": ${error}`)
    }
  }

  private async processModel(
    gltf: any,
    modelInfo: ModelInfo,
    options: ModelLoadOptions
  ): Promise<Omit<LoadedModel, 'model' | 'variant' | 'loadTime'>> {
    const scene = gltf.scene.clone()
    const animations = gltf.animations || []
    
    // Calculate model statistics
    let polyCount = 0
    let textureCount = 0
    const textures = new Set<THREE.Texture>()

    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // Count polygons
        const geometry = object.geometry
        if (geometry.index) {
          polyCount += geometry.index.count / 3
        } else if (geometry.attributes.position) {
          polyCount += geometry.attributes.position.count / 3
        }

        // Setup shadows
        if (options.castShadow !== false) {
          object.castShadow = true
        }
        if (options.receiveShadow !== false) {
          object.receiveShadow = true
        }

        // Count unique textures
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach(material => {
            if (material instanceof THREE.MeshStandardMaterial || 
                material instanceof THREE.MeshPhysicalMaterial) {
              if (material.map) textures.add(material.map)
              if (material.normalMap) textures.add(material.normalMap)
              if (material.roughnessMap) textures.add(material.roughnessMap)
              if (material.metalnessMap) textures.add(material.metalnessMap)
              if (material.aoMap) textures.add(material.aoMap)
              if (material.emissiveMap) textures.add(material.emissiveMap)
            }
          })
        }
      }
    })

    textureCount = textures.size

    // Apply texture optimizations
    if (options.maxTextureSize && this.renderer) {
      this.optimizeTextures(Array.from(textures), options.maxTextureSize)
    }

    // Apply performance optimizations based on device capabilities
    this.applyPerformanceOptimizations(scene)

    return {
      scene,
      animations,
      polyCount: Math.round(polyCount),
      textureCount
    }
  }

  private optimizeTextures(textures: THREE.Texture[], maxSize: number): void {
    textures.forEach(texture => {
      // Limit texture size
      if (texture.image && (texture.image.width > maxSize || texture.image.height > maxSize)) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        const scale = Math.min(maxSize / texture.image.width, maxSize / texture.image.height)
        
        canvas.width = Math.floor(texture.image.width * scale)
        canvas.height = Math.floor(texture.image.height * scale)
        
        ctx.drawImage(texture.image, 0, 0, canvas.width, canvas.height)
        texture.image = canvas
        texture.needsUpdate = true
      }

      // Apply performance-based texture settings
      const capabilities = performanceOptimizer.getDeviceCapabilities()
      if (capabilities.isLowEnd) {
        texture.generateMipmaps = false
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
      }
    })
  }

  private applyPerformanceOptimizations(scene: THREE.Group): void {
    const capabilities = performanceOptimizer.getDeviceCapabilities()
    
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // Frustum culling optimization
        object.frustumCulled = true

        // Apply LOD-based optimizations
        if (capabilities.isLowEnd) {
          // Reduce geometry complexity for low-end devices
          if (object.geometry && object.geometry.attributes.position.count > 10000) {
            // You could implement geometry simplification here
            console.log(`High-poly mesh detected: ${object.geometry.attributes.position.count} vertices`)
          }

          // Simplify materials for low-end devices
          if (object.material instanceof THREE.MeshStandardMaterial) {
            object.material.roughness = Math.max(0.1, object.material.roughness)
            object.material.metalness = Math.min(0.9, object.material.metalness)
          }
        }
      }
    })
  }

  cloneModel(modelName: string, options: ModelLoadOptions = {}): THREE.Group | null {
    const cacheKey = `${modelName}-${JSON.stringify(options)}`
    const cachedModel = this.cache.get(cacheKey)
    
    if (cachedModel) {
      return cachedModel.scene.clone()
    }
    
    return null
  }

  async preloadModels(modelNames: string[], options: ModelLoadOptions = {}): Promise<void> {
    const loadPromises = modelNames.map(name => 
      this.loadModel(name, { ...options, priority: 'low' })
        .catch(error => {
          console.warn(`Failed to preload model "${name}":`, error)
          return null
        })
    )
    
    await Promise.all(loadPromises)
    console.log(`🚀 Preloaded ${loadPromises.length} models`)
  }

  disposeModel(modelName: string, options: ModelLoadOptions = {}): void {
    const cacheKey = `${modelName}-${JSON.stringify(options)}`
    const model = this.cache.get(cacheKey)
    
    if (model) {
      // Dispose of geometries and materials
      model.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
      
      this.cache.delete(cacheKey)
    }
  }

  getLoadingStats() {
    return {
      ...this.loadingStats,
      cacheSize: this.cache.size,
      cacheHitRatio: this.loadingStats.totalRequests > 0 
        ? this.loadingStats.cacheHits / this.loadingStats.totalRequests * 100 
        : 0
    }
  }

  private updateLoadingStats(loadTime: number): void {
    this.loadingStats.totalLoaded++
    this.loadingStats.averageLoadTime = 
      (this.loadingStats.averageLoadTime * (this.loadingStats.totalLoaded - 1) + loadTime) / 
      this.loadingStats.totalLoaded
  }

  clearCache(): void {
    // Dispose of all cached models
    this.cache.forEach((model, key) => {
      this.disposeModel(key.split('-')[0])
    })
    this.cache.clear()
  }
}

// Singleton instance
export const advancedGLTFLoader = new AdvancedGLTFLoader()