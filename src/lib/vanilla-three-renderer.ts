import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import gsap from 'gsap'

export interface SceneConfig {
  container: HTMLElement
  modelPath?: string
  enableOrbitControls?: boolean
  enablePostProcessing?: boolean
  parallaxIntensity?: number
  autoRotate?: boolean
  cameraPosition?: [number, number, number]
  ambientLightIntensity?: number
  directionalLightIntensity?: number
}

export class ProfessionalRenderer {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private composer?: EffectComposer
  private controls?: OrbitControls
  private gltfLoader: GLTFLoader
  private dracoLoader: DRACOLoader
  private models: Map<string, THREE.Group> = new Map()
  private animationMixers: THREE.AnimationMixer[] = []
  private clock: THREE.Clock = new THREE.Clock()
  private container: HTMLElement
  private parallaxIntensity: number = 0.5
  private mouseX: number = 0
  private mouseY: number = 0
  private targetMouseX: number = 0
  private targetMouseY: number = 0
  private isDisposed: boolean = false

  constructor(config: SceneConfig) {
    this.container = config.container
    this.parallaxIntensity = config.parallaxIntensity || 0.5

    // Initialize scene
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(0x000000, 10, 50)

    // Initialize camera
    const aspect = this.container.clientWidth / this.container.clientHeight
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100)
    const [x, y, z] = config.cameraPosition || [5, 3, 5]
    this.camera.position.set(x, y, z)

    // Initialize renderer with professional settings
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    })
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.container.appendChild(this.renderer.domElement)

    // Initialize loaders
    this.dracoLoader = new DRACOLoader()
    this.dracoLoader.setDecoderPath('/draco/')
    
    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.setDRACOLoader(this.dracoLoader)

    // Setup lighting
    this.setupLighting(config)

    // Setup controls if enabled
    if (config.enableOrbitControls) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.05
      this.controls.autoRotate = config.autoRotate || false
      this.controls.autoRotateSpeed = 0.5
    }

    // Setup post-processing if enabled
    if (config.enablePostProcessing) {
      this.setupPostProcessing()
    }

    // Setup event listeners
    this.setupEventListeners()

    // Load initial model if provided
    if (config.modelPath) {
      this.loadModel(config.modelPath)
    }

    // Start animation loop
    this.animate()
  }

  private setupLighting(config: SceneConfig): void {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, config.ambientLightIntensity || 0.4)
    this.scene.add(ambientLight)

    // Main directional light with shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, config.directionalLightIntensity || 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -10
    directionalLight.shadow.camera.right = 10
    directionalLight.shadow.camera.top = 10
    directionalLight.shadow.camera.bottom = -10
    this.scene.add(directionalLight)

    // Rim light for better silhouettes
    const rimLight = new THREE.DirectionalLight(0x4444ff, 0.3)
    rimLight.position.set(-5, 5, -5)
    this.scene.add(rimLight)

    // Fill light to soften shadows
    const fillLight = new THREE.PointLight(0xffaa00, 0.2, 20)
    fillLight.position.set(-5, 2, 5)
    this.scene.add(fillLight)
  }

  private setupPostProcessing(): void {
    this.composer = new EffectComposer(this.renderer)
    
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
      0.5,  // Bloom strength
      0.4,  // Bloom radius
      0.85  // Bloom threshold
    )
    this.composer.addPass(bloomPass)

    const outputPass = new OutputPass()
    this.composer.addPass(outputPass)
  }

  private setupEventListeners(): void {
    // Mouse move for parallax
    this.container.addEventListener('mousemove', this.onMouseMove.bind(this))
    
    // Window resize
    window.addEventListener('resize', this.onResize.bind(this))
    
    // Touch events for mobile
    this.container.addEventListener('touchmove', this.onTouchMove.bind(this))
  }

  private onMouseMove(event: MouseEvent): void {
    const rect = this.container.getBoundingClientRect()
    this.targetMouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.targetMouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  private onTouchMove(event: TouchEvent): void {
    if (event.touches.length > 0) {
      const rect = this.container.getBoundingClientRect()
      const touch = event.touches[0]
      this.targetMouseX = ((touch.clientX - rect.left) / rect.width) * 2 - 1
      this.targetMouseY = -((touch.clientY - rect.top) / rect.height) * 2 + 1
    }
  }

  private onResize(): void {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
    
    if (this.composer) {
      this.composer.setSize(width, height)
    }
  }

  public async loadModel(
    path: string,
    options: {
      scale?: number
      position?: [number, number, number]
      rotation?: [number, number, number]
      animation?: boolean
    } = {}
  ): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        path,
        (gltf) => {
          const model = gltf.scene
          
          // Apply transformations
          if (options.scale) {
            model.scale.setScalar(options.scale)
          }
          
          if (options.position) {
            model.position.set(...options.position)
          }
          
          if (options.rotation) {
            model.rotation.set(...options.rotation)
          }

          // Enable shadows
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true
              child.receiveShadow = true
              
              // Improve material quality
              if (child.material) {
                if (child.material instanceof THREE.MeshStandardMaterial) {
                  child.material.envMapIntensity = 0.5
                }
              }
            }
          })

          // Handle animations
          if (gltf.animations.length > 0 && options.animation !== false) {
            const mixer = new THREE.AnimationMixer(model)
            gltf.animations.forEach(clip => {
              mixer.clipAction(clip).play()
            })
            this.animationMixers.push(mixer)
          }

          // Add to scene and store
          this.scene.add(model)
          this.models.set(path, model)
          
          resolve(model)
        },
        (progress) => {
          console.log(`Loading ${path}: ${(progress.loaded / progress.total * 100).toFixed(2)}%`)
        },
        (error) => {
          console.error(`Error loading ${path}:`, error)
          reject(error)
        }
      )
    })
  }

  public animateModelEntrance(model: THREE.Group, duration: number = 1.5): void {
    // Store original values
    const originalScale = model.scale.x
    const originalY = model.position.y

    // Set initial state
    model.scale.setScalar(0)
    model.position.y -= 2

    // Animate entrance
    gsap.timeline()
      .to(model.scale, {
        x: originalScale,
        y: originalScale, 
        z: originalScale,
        duration: duration,
        ease: 'back.out(1.7)'
      })
      .to(model.position, {
        y: originalY,
        duration: duration,
        ease: 'power2.out'
      }, '<')
      .to(model.rotation, {
        y: Math.PI * 2,
        duration: duration * 1.5,
        ease: 'power2.inOut'
      }, '<')
  }

  private animate(): void {
    if (this.isDisposed) return

    requestAnimationFrame(this.animate.bind(this))

    const delta = this.clock.getDelta()

    // Smooth parallax mouse movement
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05

    // Apply parallax to camera
    if (!this.controls || !this.controls.enabled) {
      this.camera.position.x += this.mouseX * this.parallaxIntensity * 0.1
      this.camera.position.y += this.mouseY * this.parallaxIntensity * 0.1
      this.camera.lookAt(0, 0, 0)
    }

    // Update controls
    if (this.controls) {
      this.controls.update()
    }

    // Update animation mixers
    this.animationMixers.forEach(mixer => mixer.update(delta))

    // Apply subtle rotation to models
    this.models.forEach((model, key) => {
      if (key.includes('rotate')) {
        model.rotation.y += delta * 0.5
      }
    })

    // Render
    if (this.composer) {
      this.composer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  }

  public dispose(): void {
    this.isDisposed = true
    
    // Clean up Three.js resources
    this.renderer.dispose()
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        if (object.material instanceof THREE.Material) {
          object.material.dispose()
        }
      }
    })
    
    // Remove DOM element
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.onResize)
  }
}