'use client'

import { useCallback, useState, useEffect } from 'react'
import { EnvironmentObject } from './environment-object'
import { PlacedBlock } from './placed-block'
import { Vector3 } from 'three'

interface MapObject {
  type: 'tree' | 'rock' | 'wood-block' | 'stone-block'
  position: [number, number, number]
  id: string
}

interface GameMapProps {
  onCollectResource: (type: string, amount: number) => void
  placedBlocks: Array<{ position: Vector3 }>
}

const RESPAWN_TIME = 60000 // 1 minute in milliseconds
const MIN_DISTANCE_FROM_BLOCKS = 6
const MAP_SIZE = 40 // -20 to +20

export function GameMap({ onCollectResource, placedBlocks }: GameMapProps) {
  const [mapObjects, setMapObjects] = useState<MapObject[]>(() => {
    const objects: MapObject[] = []
    // Generate random trees and rocks
    for (let i = 0; i < 50; i++) {
      const x = Math.floor(Math.random() * MAP_SIZE) - MAP_SIZE/2
      const z = Math.floor(Math.random() * MAP_SIZE) - MAP_SIZE/2
      objects.push({
        type: Math.random() > 0.5 ? 'tree' : 'rock',
        position: [x, 0, z],
        id: `${i}`
      })
    }
    return objects
  })

  const [respawnQueue, setRespawnQueue] = useState<Array<{
    type: 'tree' | 'rock',
    respawnTime: number
  }>>([])

  // Check if position is valid for respawn
  const isValidPosition = useCallback((x: number, z: number): boolean => {
    // Check distance from placed blocks
    for (const block of placedBlocks) {
      const dx = Math.abs(x - block.position.x)
      const dz = Math.abs(z - block.position.z)
      if (dx < MIN_DISTANCE_FROM_BLOCKS && dz < MIN_DISTANCE_FROM_BLOCKS) {
        return false
      }
    }

    // Check distance from other objects
    for (const obj of mapObjects) {
      const dx = Math.abs(x - obj.position[0])
      const dz = Math.abs(z - obj.position[2])
      if (dx < 2 && dz < 2) { // Minimum spacing between objects
        return false
      }
    }

    return true
  }, [mapObjects, placedBlocks])

  // Find a valid spawn position
  const findSpawnPosition = useCallback((): [number, number] | null => {
    for (let attempts = 0; attempts < 100; attempts++) {
      const x = Math.floor(Math.random() * MAP_SIZE) - MAP_SIZE/2
      const z = Math.floor(Math.random() * MAP_SIZE) - MAP_SIZE/2
      if (isValidPosition(x, z)) {
        return [x, z]
      }
    }
    return null
  }, [isValidPosition])

  // Handle respawning
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const readyToSpawn = respawnQueue.filter(item => item.respawnTime <= now)
      
      if (readyToSpawn.length > 0) {
        const newObjects: MapObject[] = []
        
        for (const item of readyToSpawn) {
          const position = findSpawnPosition()
          if (position) {
            newObjects.push({
              type: item.type,
              position: [position[0], 0, position[1]],
              id: `${Date.now()}-${Math.random()}`
            })
          }
        }

        if (newObjects.length > 0) {
          setMapObjects(prev => [...prev, ...newObjects])
          setRespawnQueue(prev => prev.filter(item => item.respawnTime > now))
        }
      }
    }, 1000) // Check every second

    return () => clearInterval(interval)
  }, [respawnQueue, findSpawnPosition])

  const handleObjectDestroy = useCallback((position: [number, number, number], type: string) => {
    setMapObjects(prev => prev.filter(obj => 
      obj.position[0] !== position[0] || 
      obj.position[2] !== position[2]
    ))

    // Add to respawn queue if it's a natural resource
    if (type === 'tree' || type === 'rock') {
      setRespawnQueue(prev => [...prev, {
        type: type as 'tree' | 'rock',
        respawnTime: Date.now() + RESPAWN_TIME
      }])
    }
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3a5a40" />
      </mesh>
      
      {mapObjects.map((object) => (
        object.type === 'tree' || object.type === 'rock' ? (
          <EnvironmentObject
            key={object.id}
            type={object.type}
            position={object.position}
            onDestroy={handleObjectDestroy}
            onCollectResource={onCollectResource}
          />
        ) : (
          <PlacedBlock
            key={object.id}
            type={object.type}
            position={object.position}
            onDestroy={handleObjectDestroy}
          />
        )
      ))}
    </group>
  )
}
