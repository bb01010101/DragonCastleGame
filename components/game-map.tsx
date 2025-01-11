'use client'

import { useMemo } from 'react'
import { Plane } from '@react-three/drei'
import * as THREE from 'three'
import { createNoise2D } from 'simplex-noise'

export const BIOMES = {
  DEEP_WATER: { color: '#1a5f7a', height: 0.2, resource: 'fish' },
  WATER: { color: '#2389da', height: 0.3, resource: 'fish' },
  BEACH: { color: '#f6d7b0', height: 0.35, resource: null },
  GRASSLAND: { color: '#90C77D', height: 0.45, resource: 'food' },
  FOREST: { color: '#2F6E31', height: 0.6, resource: 'wood' },
  DENSE_FOREST: { color: '#1B4D22', height: 0.7, resource: 'wood' },
  MOUNTAINS: { color: '#898989', height: 0.8, resource: 'stone' },
  SNOW_PEAKS: { color: '#FFFFFF', height: 0.85, resource: null },
  GOLD_DEPOSIT: { color: '#FFD700', height: 0.5, resource: 'gold' }
}

export function GameMap() {
  const mapSize = 200
  const scale = 30

  const mapData = useMemo(() => {
    const data = new Uint8Array(mapSize * mapSize * 4)
    const noise2D = createNoise2D()
    
    for (let y = 0; y < mapSize; y++) {
      for (let x = 0; x < mapSize; x++) {
        const i = (y * mapSize + x) * 4
        
        const nx = x / mapSize - 0.5
        const ny = y / mapSize - 0.5
        
        const elevation = (
          noise2D(nx * scale, ny * scale) * 0.5 +
          noise2D(nx * scale * 2, ny * scale * 2) * 0.25 +
          noise2D(nx * scale * 4, ny * scale * 4) * 0.125
        ) + 0.5

        const moisture = (
          noise2D(nx * scale + 1000, ny * scale + 1000) * 0.5 +
          noise2D(nx * scale * 2 + 1000, ny * scale * 2 + 1000) * 0.25
        ) + 0.5

        let biomeColor
        if (elevation < BIOMES.DEEP_WATER.height) {
          biomeColor = BIOMES.DEEP_WATER.color
        } else if (elevation < BIOMES.WATER.height) {
          biomeColor = BIOMES.WATER.color
        } else if (elevation < BIOMES.BEACH.height) {
          biomeColor = BIOMES.BEACH.color
        } else if (elevation < BIOMES.GRASSLAND.height) {
          biomeColor = moisture < 0.5 ? BIOMES.GRASSLAND.color : BIOMES.FOREST.color
        } else if (elevation < BIOMES.FOREST.height) {
          biomeColor = moisture < 0.6 ? BIOMES.FOREST.color : BIOMES.DENSE_FOREST.color
        } else if (elevation < BIOMES.MOUNTAINS.height) {
          biomeColor = BIOMES.MOUNTAINS.color
        } else {
          biomeColor = BIOMES.SNOW_PEAKS.color
        }

        if (elevation > BIOMES.GRASSLAND.height && elevation < BIOMES.MOUNTAINS.height && Math.random() < 0.01) {
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

  return (
    <Plane 
      args={[mapSize, mapSize]} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]}
      receiveShadow
    >
      <meshStandardMaterial map={texture} />
    </Plane>
  )
}
