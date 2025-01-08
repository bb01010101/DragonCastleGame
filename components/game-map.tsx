'use client'

import { useMemo, useEffect, useRef } from 'react'
import { Plane } from '@react-three/drei'
import * as THREE from 'three'
import { createNoise2D } from 'simplex-noise'

export const BIOMES = {
  WATER: { color: '#1e3799', resource: null },
  BEACH: { color: '#fad390', resource: null },
  PLAINS: { color: '#78e08f', resource: 'food' },
  FOREST: { color: '#38ada9', resource: 'wood' },
  MOUNTAINS: { color: '#b8e994', resource: 'stone' },
  GOLD_DEPOSIT: { color: '#f6b93b', resource: 'gold' }
} as const

export function GameMap() {
  const mapSize = 100
  const planeRef = useRef<THREE.Mesh>(null)

  const mapData = useMemo(() => {
    const data = new Uint8Array(mapSize * mapSize * 4)
    
    const noise2D1 = createNoise2D()
    const noise2D2 = createNoise2D()
    
    for (let y = 0; y < mapSize; y++) {
      for (let x = 0; x < mapSize; x++) {
        const i = (y * mapSize + x) * 4
        
        const nx = x / mapSize - 0.5
        const ny = y / mapSize - 0.5
        
        const elevation = (
          noise2D1(nx * 3, ny * 3) +
          noise2D1(nx * 6, ny * 6) * 0.5 +
          noise2D1(nx * 12, ny * 12) * 0.25
        ) / 1.75
        
        const moisture = (
          noise2D2(nx * 4, ny * 4) +
          noise2D2(nx * 8, ny * 8) * 0.5
        ) / 1.5
        
        let biomeColor
        if (elevation < -0.2) {
          biomeColor = BIOMES.WATER.color
        } else if (elevation < -0.1) {
          biomeColor = BIOMES.BEACH.color
        } else if (elevation < 0.1) {
          biomeColor = moisture < 0 ? BIOMES.PLAINS.color : BIOMES.FOREST.color
        } else {
          biomeColor = BIOMES.MOUNTAINS.color
        }
        
        if (elevation > 0.1 && Math.random() < 0.02) {
          biomeColor = BIOMES.GOLD_DEPOSIT.color
        }
        
        const color = new THREE.Color(biomeColor)
        data[i] = Math.floor(color.r * 255)
        data[i + 1] = Math.floor(color.g * 255)
        data[i + 2] = Math.floor(color.b * 255)
        data[i + 3] = 255
      }
    }
    
    return data
  }, [])

  const texture = useMemo(() => {
    const tex = new THREE.DataTexture(mapData, mapSize, mapSize, THREE.RGBAFormat)
    tex.needsUpdate = true
    return tex
  }, [mapData])

  useEffect(() => {
    if (planeRef.current) {
      const material = planeRef.current.material as THREE.MeshStandardMaterial
      if (material) {
        material.map = texture
        material.needsUpdate = true
      }
    }
  }, [texture])

  return (
    <Plane ref={planeRef} args={[mapSize, mapSize]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <meshStandardMaterial />
    </Plane>
  )
}
