/**
 * glTF Model Loader and Manager
 * Handles loading, caching, and management of glTF 2.0 models from the sample repository
 */

import * as THREE from 'three'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export interface ModelConfig {
  name: string
  path: string
  variant: 'glTF' | 'glTF-Binary' | 'glTF-Draco' | 'glTF-Embedded'
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  animations?: boolean
  preload?: boolean
}

export interface LoadedModel {
  gltf: GLTF
  config: ModelConfig
  boundingBox: THREE.Box3
  size: THREE.Vector3
  animations: THREE.AnimationClip[]
  materials: THREE.Material[]
}

export interface ModelLoadProgress {
  modelName: string
  loaded: number
  total: number
  percentage: number
}

class GLTFModelLoader {
  private loader!: GLTFLoader
  private dracoLoader!: DRACOLoader
  private loadedModels: Map<string, LoadedModel> = new Map()
  private loadingPromises: Map<string, Promise<LoadedModel>> = new Map()
  private basePath: string
  
  constructor(basePath: string = '/2.0/') {
    this.basePath = basePath
    this.setupLoaders()
  }

  private setupLoaders(): void {
    // Initialize GLTF loader
    this.loader = new GLTFLoader()
    
    // Initialize DRACO loader for compressed models
    this.dracoLoader = new DRACOLoader()
    this.dracoLoader.setDecoderPath('/draco/')
    this.loader.setDRACOLoader(this.dracoLoader)
    
    // Set up loading manager for progress tracking
    const loadingManager = new THREE.LoadingManager()
    loadingManager.onProgress = (url, loaded, total) => {
      const modelName = this.extractModelName(url)
      if (modelName) {
        this.onLoadProgress?.(modelName, loaded, total)
      }
    }
    
    this.loader.manager = loadingManager
  }

  private extractModelName(url: string): string | null {
    const match = url.match(/2\.0\/([^\/]+)\//)
    return match ? match[1] : null
  }

  public onLoadProgress?: (modelName: string, loaded: number, total: number) => void
  public onLoadComplete?: (modelName: string, model: LoadedModel) => void
  public onLoadError?: (modelName: string, error: Error) => void

  /**
   * Load a glTF model with the specified configuration
   */
  async loadModel(config: ModelConfig): Promise<LoadedModel> {
    const cacheKey = `${config.name}_${config.variant}`
    
    // Return cached model if available
    if (this.loadedModels.has(cacheKey)) {
      return this.loadedModels.get(cacheKey)!
    }
    
    // Return existing loading promise if already in progress
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!
    }
    
    // Start loading
    const loadingPromise = this.performLoad(config, cacheKey)
    this.loadingPromises.set(cacheKey, loadingPromise)
    
    try {
      const result = await loadingPromise
      this.loadedModels.set(cacheKey, result)
      this.onLoadComplete?.(config.name, result)
      return result
    } catch (error) {
      this.onLoadError?.(config.name, error as Error)
      throw error
    } finally {
      this.loadingPromises.delete(cacheKey)
    }
  }

  private async performLoad(config: ModelConfig, cacheKey: string): Promise<LoadedModel> {
    const modelPath = this.buildModelPath(config)
    
    return new Promise<LoadedModel>((resolve, reject) => {
      this.loader.load(
        modelPath,
        (gltf) => {
          try {
            const processedModel = this.processLoadedModel(gltf, config)
            resolve(processedModel)
          } catch (error) {
            reject(new Error(`Failed to process model ${config.name}: ${error}`))
          }
        },
        (progress) => {
          const percentage = progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0
          this.onLoadProgress?.(config.name, progress.loaded, progress.total)
        },
        (error) => {
          reject(new Error(`Failed to load model ${config.name}: ${error}`))
        }
      )
    })
  }

  private buildModelPath(config: ModelConfig): string {
    const { name, variant } = config
    let fileName: string
    
    switch (variant) {
      case 'glTF-Binary':
        fileName = `${name}.glb`
        break
      case 'glTF-Draco':
      case 'glTF-Embedded':
      case 'glTF':
      default:
        fileName = `${name}.gltf`
        break
    }
    
    return `${this.basePath}${name}/${variant}/${fileName}`
  }

  private processLoadedModel(gltf: GLTF, config: ModelConfig): LoadedModel {
    // Calculate bounding box and size
    const boundingBox = new THREE.Box3().setFromObject(gltf.scene)
    const size = boundingBox.getSize(new THREE.Vector3())
    
    // Apply transformations
    if (config.scale) {
      gltf.scene.scale.setScalar(config.scale)
    }
    
    if (config.position) {
      gltf.scene.position.set(...config.position)
    }
    
    if (config.rotation) {
      gltf.scene.rotation.set(...config.rotation)
    }
    
    // Collect materials for potential modification
    const materials: THREE.Material[] = []
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          materials.push(...child.material)
        } else {
          materials.push(child.material)
        }
      }
    })
    
    // Prepare animations
    const animations = gltf.animations || []
    
    return {
      gltf,
      config,
      boundingBox,
      size,
      animations,
      materials
    }
  }

  /**
   * Load multiple models in parallel
   */
  async loadModels(configs: ModelConfig[]): Promise<Map<string, LoadedModel>> {
    const loadPromises = configs.map(config => 
      this.loadModel(config).then(model => [config.name, model] as [string, LoadedModel])
    )
    
    const results = await Promise.all(loadPromises)
    return new Map(results)
  }

  /**
   * Get a loaded model by name
   */
  getModel(name: string, variant: string = 'glTF-Binary'): LoadedModel | null {
    const cacheKey = `${name}_${variant}`
    return this.loadedModels.get(cacheKey) || null
  }

  /**
   * Clone a loaded model for multiple instances
   */
  cloneModel(name: string, variant: string = 'glTF-Binary'): THREE.Group | null {
    const model = this.getModel(name, variant)
    if (!model) return null
    
    return model.gltf.scene.clone()
  }

  /**
   * Dispose of loaded models to free memory
   */
  disposeModel(name: string, variant: string = 'glTF-Binary'): void {
    const cacheKey = `${name}_${variant}`
    const model = this.loadedModels.get(cacheKey)
    
    if (model) {
      // Dispose geometries and materials
      model.gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose())
          } else {
            child.material?.dispose()
          }
        }
      })
      
      this.loadedModels.delete(cacheKey)
    }
  }

  /**
   * Dispose all loaded models
   */
  disposeAll(): void {
    for (const [key] of this.loadedModels) {
      const [name, variant] = key.split('_')
      this.disposeModel(name, variant)
    }
  }

  /**
   * Get loading statistics
   */
  getStats() {
    return {
      loadedCount: this.loadedModels.size,
      loadingCount: this.loadingPromises.size,
      loadedModels: Array.from(this.loadedModels.keys())
    }
  }
}

// Predefined model configurations for the portfolio
export const PORTFOLIO_MODELS: ModelConfig[] = [
  {
    name: 'DamagedHelmet',
    path: 'DamagedHelmet',
    variant: 'glTF-Binary',
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    animations: false,
    preload: true
  },
  {
    name: 'FlightHelmet',
    path: 'FlightHelmet',
    variant: 'glTF',
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    animations: false,
    preload: true
  },
  {
    name: 'BoomBox',
    path: 'BoomBox',
    variant: 'glTF-Draco',
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    animations: false,
    preload: false
  },
  {
    name: 'Avocado',
    path: 'Avocado',
    variant: 'glTF-Binary',
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    animations: false,
    preload: false
  },
  {
    name: 'Duck',
    path: 'Duck',
    variant: 'glTF-Binary',
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    animations: false,
    preload: false
  }
]

// Singleton instance
export const modelLoader = new GLTFModelLoader()