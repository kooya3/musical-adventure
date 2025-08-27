/**
 * Dynamic glTF 2.0 Model Registry System
 * Auto-discovers and manages 3D assets from the Khronos glTF Sample Models repository
 */

import { performanceOptimizer } from './performance-config'

export interface ModelInfo {
  name: string
  screenshot: string
  variants: {
    [key: string]: string
  }
  category?: ModelCategory
  complexity?: ModelComplexity
  tags?: string[]
  description?: string
}

export enum ModelCategory {
  HERO = 'hero',           // Main showcase models
  TECHNICAL = 'technical', // Technical demonstrations
  ARTISTIC = 'artistic',   // Artistic/creative models
  ANIMATED = 'animated',   // Animated models
  MATERIAL = 'material',   // Material showcase models
  SIMPLE = 'simple',       // Simple/basic models
  ADVANCED = 'advanced'    // Advanced feature demonstrations
}

export enum ModelComplexity {
  LOW = 'low',       // < 10k vertices
  MEDIUM = 'medium', // 10k - 100k vertices
  HIGH = 'high',     // 100k - 1M vertices
  ULTRA = 'ultra'    // > 1M vertices
}

export interface ModelVariantConfig {
  priority: number
  deviceSupport: 'all' | 'desktop' | 'mobile' | 'high-end'
  compressionLevel: 'none' | 'low' | 'medium' | 'high'
  fileSize: 'small' | 'medium' | 'large'
}

// Variant selection priority based on performance characteristics
export const VARIANT_CONFIGS: Record<string, ModelVariantConfig> = {
  'glTF-Draco': {
    priority: 1,
    deviceSupport: 'all',
    compressionLevel: 'high',
    fileSize: 'small'
  },
  'glTF-Binary': {
    priority: 2,
    deviceSupport: 'all',
    compressionLevel: 'medium',
    fileSize: 'medium'
  },
  'glTF-Quantized': {
    priority: 3,
    deviceSupport: 'high-end',
    compressionLevel: 'medium',
    fileSize: 'small'
  },
  'glTF': {
    priority: 4,
    deviceSupport: 'desktop',
    compressionLevel: 'none',
    fileSize: 'large'
  },
  'glTF-Embedded': {
    priority: 5,
    deviceSupport: 'all',
    compressionLevel: 'none',
    fileSize: 'large'
  },
  'glTF-KTX-BasisU': {
    priority: 6,
    deviceSupport: 'high-end',
    compressionLevel: 'high',
    fileSize: 'small'
  }
}

// Curated model selections for different use cases
export const MODEL_COLLECTIONS = {
  hero: [
    'DamagedHelmet',
    'FlightHelmet',
    'SciFiHelmet',
    'AntiqueCamera',
    'BoomBox'
  ],
  
  artistic: [
    'Avocado',
    'Duck',
    'Lantern',
    'Fox',
    'Corset',
    'GlamVelvetSofa'
  ],
  
  technical: [
    'GearboxAssy',
    '2CylinderEngine',
    'ReciprocatingSaw',
    'Buggy',
    'ToyCar'
  ],
  
  animated: [
    'AnimatedCube',
    'AnimatedMorphCube',
    'AnimatedMorphSphere',
    'CesiumMan',
    'Fox',
    'BrainStem'
  ],
  
  materials: [
    'MetalRoughSpheres',
    'ClearCoatTest',
    'TransmissionTest',
    'IridescenceLamp',
    'SheenCloth'
  ],
  
  simple: [
    'Box',
    'Cube',
    'Triangle',
    'BoxTextured',
    'SimpleMeshes'
  ]
}

class ModelRegistry {
  private models: Map<string, ModelInfo> = new Map()
  private initialized = false
  
  async initialize(): Promise<void> {
    if (this.initialized) return
    
    try {
      // Load the model index from the glTF Sample Models repository
      const response = await fetch('/2.0/model-index.json')
      if (!response.ok) {
        throw new Error(`Failed to load model index: ${response.statusText}`)
      }
      
      const modelIndex: ModelInfo[] = await response.json()
      
      // Process and categorize each model
      modelIndex.forEach(model => {
        const enhancedModel = this.enhanceModelInfo(model)
        this.models.set(model.name, enhancedModel)
      })
      
      this.initialized = true
      console.log(`🎨 Model Registry initialized with ${this.models.size} models`)
    } catch (error) {
      console.error('Failed to initialize model registry:', error)
      this.initializeFallbackModels()
    }
  }
  
  private enhanceModelInfo(model: ModelInfo): ModelInfo {
    const enhanced: ModelInfo = {
      ...model,
      category: this.categorizeModel(model.name),
      complexity: this.assessComplexity(model.name),
      tags: this.generateTags(model.name),
      description: this.generateDescription(model.name)
    }
    
    return enhanced
  }
  
  private categorizeModel(name: string): ModelCategory {
    // Categorize based on name patterns and known characteristics
    if (MODEL_COLLECTIONS.hero.includes(name)) return ModelCategory.HERO
    if (MODEL_COLLECTIONS.animated.includes(name)) return ModelCategory.ANIMATED
    if (MODEL_COLLECTIONS.technical.includes(name)) return ModelCategory.TECHNICAL
    if (MODEL_COLLECTIONS.materials.includes(name)) return ModelCategory.MATERIAL
    if (MODEL_COLLECTIONS.artistic.includes(name)) return ModelCategory.ARTISTIC
    if (MODEL_COLLECTIONS.simple.includes(name)) return ModelCategory.SIMPLE
    
    // Pattern-based categorization
    if (name.includes('Test') || name.includes('Sphere')) return ModelCategory.MATERIAL
    if (name.includes('Animated') || name.includes('Morph')) return ModelCategory.ANIMATED
    if (name.includes('Engine') || name.includes('Gear') || name.includes('Car')) return ModelCategory.TECHNICAL
    
    return ModelCategory.SIMPLE
  }
  
  private assessComplexity(name: string): ModelComplexity {
    // Assess complexity based on known model characteristics
    const highComplexity = ['Sponza', 'GlamVelvetSofa', 'StainedGlassLamp', 'FlightHelmet']
    const mediumComplexity = ['DamagedHelmet', 'BoomBox', 'SciFiHelmet', 'AntiqueCamera']
    const lowComplexity = ['Box', 'Cube', 'Triangle', 'Duck', 'Avocado']
    
    if (highComplexity.includes(name)) return ModelComplexity.HIGH
    if (mediumComplexity.includes(name)) return ModelComplexity.MEDIUM
    if (lowComplexity.includes(name)) return ModelComplexity.LOW
    
    return ModelComplexity.MEDIUM
  }
  
  private generateTags(name: string): string[] {
    const tags: string[] = []
    
    // Add category-based tags
    if (name.includes('Helmet')) tags.push('helmet', 'protective-gear')
    if (name.includes('Car') || name.includes('Vehicle')) tags.push('vehicle', 'transportation')
    if (name.includes('Engine')) tags.push('mechanical', 'engineering')
    if (name.includes('Sphere')) tags.push('geometric', 'primitive')
    if (name.includes('Test')) tags.push('demo', 'testing')
    if (name.includes('Animated')) tags.push('animation', 'movement')
    if (name.includes('Material')) tags.push('material', 'shader')
    
    return tags
  }
  
  private generateDescription(name: string): string {
    // Generate user-friendly descriptions
    const descriptions: Record<string, string> = {
      'DamagedHelmet': 'A battle-worn space helmet showcasing PBR materials and weathering effects',
      'FlightHelmet': 'A detailed pilot helmet with complex materials and realistic texturing',
      'BoomBox': 'A retro portable stereo with emissive displays and metallic surfaces',
      'Avocado': 'A photorealistic avocado demonstrating organic surface materials',
      'Duck': 'A classic rubber duck model, perfect for testing basic rendering',
      'Fox': 'An animated fox character with rigged animations',
      'AntiqueCamera': 'A vintage camera showcasing worn metal and leather materials',
      'GearboxAssy': 'A mechanical gearbox assembly demonstrating technical modeling',
      '2CylinderEngine': 'A detailed two-cylinder engine with moving parts'
    }
    
    return descriptions[name] || `3D model: ${name.replace(/([A-Z])/g, ' $1').trim()}`
  }
  
  private initializeFallbackModels(): void {
    // Fallback models if the index fails to load
    const fallbackModels: ModelInfo[] = [
      {
        name: 'DamagedHelmet',
        screenshot: 'screenshot/screenshot.png',
        variants: { 'glTF-Binary': 'DamagedHelmet.glb' },
        category: ModelCategory.HERO,
        complexity: ModelComplexity.MEDIUM
      },
      {
        name: 'Duck',
        screenshot: 'screenshot/screenshot.png',
        variants: { 'glTF-Binary': 'Duck.glb' },
        category: ModelCategory.SIMPLE,
        complexity: ModelComplexity.LOW
      }
    ]
    
    fallbackModels.forEach(model => {
      this.models.set(model.name, model)
    })
    
    this.initialized = true
  }
  
  getModel(name: string): ModelInfo | null {
    return this.models.get(name) || null
  }
  
  getAllModels(): ModelInfo[] {
    return Array.from(this.models.values())
  }
  
  getModelsByCategory(category: ModelCategory): ModelInfo[] {
    return Array.from(this.models.values()).filter(model => model.category === category)
  }
  
  getOptimalVariant(model: ModelInfo): { variant: string; path: string } {
    const capabilities = performanceOptimizer.getDeviceCapabilities()
    const availableVariants = Object.keys(model.variants)
    
    // Sort variants by priority and device compatibility
    const sortedVariants = availableVariants
      .filter(variant => VARIANT_CONFIGS[variant])
      .sort((a, b) => {
        const aConfig = VARIANT_CONFIGS[a]
        const bConfig = VARIANT_CONFIGS[b]
        
        // Filter by device support
        if (capabilities.isMobile && aConfig.deviceSupport === 'desktop') return 1
        if (capabilities.isMobile && bConfig.deviceSupport === 'desktop') return -1
        if (capabilities.isLowEnd && aConfig.deviceSupport === 'high-end') return 1
        if (capabilities.isLowEnd && bConfig.deviceSupport === 'high-end') return -1
        
        return aConfig.priority - bConfig.priority
      })
    
    const selectedVariant = sortedVariants[0] || availableVariants[0]
    const path = `/2.0/${model.name}/${selectedVariant}/${model.variants[selectedVariant]}`
    
    return { variant: selectedVariant, path }
  }
  
  getRecommendedModels(category?: ModelCategory, complexity?: ModelComplexity, count: number = 5): ModelInfo[] {
    let filtered = Array.from(this.models.values())
    
    if (category) {
      filtered = filtered.filter(model => model.category === category)
    }
    
    if (complexity) {
      filtered = filtered.filter(model => model.complexity === complexity)
    }
    
    // Sort by category priority and return requested count
    return filtered
      .sort((a, b) => {
        // Prioritize hero models
        if (a.category === ModelCategory.HERO && b.category !== ModelCategory.HERO) return -1
        if (b.category === ModelCategory.HERO && a.category !== ModelCategory.HERO) return 1
        return 0
      })
      .slice(0, count)
  }
}

// Singleton instance
export const modelRegistry = new ModelRegistry()

// Utility functions for easy access
export const getModel = (name: string) => modelRegistry.getModel(name)
export const getAllModels = () => modelRegistry.getAllModels()
export const getModelsByCategory = (category: ModelCategory) => modelRegistry.getModelsByCategory(category)
export const getOptimalVariant = (model: ModelInfo) => modelRegistry.getOptimalVariant(model)
export const getRecommendedModels = (category?: ModelCategory, complexity?: ModelComplexity, count?: number) => 
  modelRegistry.getRecommendedModels(category, complexity, count)

// Initialize the registry
export const initializeModelRegistry = () => modelRegistry.initialize()