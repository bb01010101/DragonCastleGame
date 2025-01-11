'use client'

import { useCallback, useState } from 'react'
import { EnvironmentObject } from './environment-object'
import { PlacedBlock } from './placed-block'
import { useGameState } from '@/hooks/use-game-state'

interface MapObject {
  type: 'tree' | 'rock' | 'wood-block' | 'stone-block'
  position: [number, number, number]
  id: string
}

export function GameMap() {
  const { addResources } = useGameState()
  const [mapObjects, setMapObjects] = useState<MapObject[]>(() => {
    const objects: MapObject[] = []
    // Generate random trees and rocks
    for (let i = 0; i < 50; i++) {
      const x = Math.floor(Math.random() * 40) - 20
      const z = Math.floor(Math.random() * 40) - 20
      objects.push({
        type: Math.random() > 0.5 ? 'tree' : 'rock',
        position: [x, 0, z],
        id: `${i}`
      })
    }
    return objects
  })

  const handleObjectDestroy = useCallback((position: [number, number, number], type: string) => {
    setMapObjects(prev => prev.filter(obj => 
      obj.position[0] !== position[0] || 
      obj.position[2] !== position[2]
    ))
    
    if (type === 'tree' || type === 'wood-block') {
      addResources({ wood: 10 })
    } else if (type === 'rock' || type === 'stone-block') {
      addResources({ stone: 10 })
    }
  }, [addResources])

  const handleBlockPlace = useCallback((type: 'wood-block' | 'stone-block', position: [number, number, number]) => {
    setMapObjects(prev => [...prev, {
      type,
      position,
      id: Date.now().toString()
    }])
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
