import { extend } from '@react-three/fiber'
import * as THREE from 'three'

// Extend R3F with Three.js types
extend(THREE)

// Declare global types for Three.js JSX elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any
      boxGeometry: any
      sphereGeometry: any
      meshStandardMaterial: any
      meshDistortMaterial: any
      instancedMesh: any
      ambientLight: any
      pointLight: any
      spotLight: any
      perspectiveCamera: any
    }
  }
}

export {}