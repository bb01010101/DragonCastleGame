'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Vector3 } from 'three'
import { MINING_RADIUS, BUILD_RADIUS, BLOCK_SIZE } from '../constants'

interface PlayerProps {
  position: Vector3
  onMove: (position: { x: number; y: number; z: number }, rotation: number) => void
  onCollectResource: (resourceId: string) => void
  onPlaceBlock: (block: { type: string; position: { x: number; y: number; z: number } }) => void
  onDestroyBlock: (blockId: string) => void
  selectedTool: 'build' | 'gather'
  selectedBlockType: 'wood-block' | 'stone-block' | null
  resources: any[]
  blocks: any[]
}

export function Player({
  position,
  onMove,
  onCollectResource,
  onPlaceBlock,
  onDestroyBlock,
  selectedTool,
  selectedBlockType,
  resources,
  blocks
}: PlayerProps) {
  const playerRef = useRef<THREE.Mesh>(null)
  const [isInRange, setIsInRange] = useState(false)
  const [targetPosition, setTargetPosition] = useState<Vector3 | null>(null)

  // Use the correct radius based on the selected tool
  const currentRadius = selectedTool === 'build' ? BUILD_RADIUS : MINING_RADIUS

  useFrame((state) => {
    if (!playerRef.current) return

    // ... rest of the component code using currentRadius for range checks ...
  })

  return (
    <group>
      <mesh ref={playerRef} position={position}>
        <boxGeometry args={[BLOCK_SIZE, BLOCK_SIZE * 2, BLOCK_SIZE]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      
      {/* Interaction radius visualization */}
      <mesh position={[position.x, 0.1, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, currentRadius, 32]} />
        <meshBasicMaterial 
          color={selectedTool === 'build' ? 'blue' : 'green'} 
          transparent 
          opacity={0.2} 
        />
      </mesh>

      {/* ... rest of the component JSX ... */}
    </group>
  )
}
