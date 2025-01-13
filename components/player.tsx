'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Raycaster, Mesh } from 'three'
import { Html } from '@react-three/drei'
import { MINING_RADIUS, BUILD_RADIUS } from '../constants'

interface PlayerProps {
  onCollectResource: (type: string, amount: number) => void
  selectedTool: 'build' | 'gather'
  selectedBlockType: 'wood-block' | 'stone-block' | null
  setSelectedBlockType: (type: 'wood-block' | 'stone-block' | null) => void
  resources: Record<string, number>
  spendResources: (costs: Record<string, number>) => boolean
  onMove: (position: Vector3, rotation: number) => void
  onPlaceBlock: (position: Vector3, type: string) => void
  onDestroyBlock: (position: Vector3) => void
}

export function Player({ 
  onCollectResource, 
  selectedTool, 
  selectedBlockType,
  setSelectedBlockType,
  resources,
  spendResources,
  onMove,
  onPlaceBlock,
  onDestroyBlock
}: PlayerProps) {
  const playerRef = useRef<Mesh>(null)
  const fistRef = useRef<Mesh>(null)
  const [targetPosition, setTargetPosition] = useState(new Vector3(0, 0, 0))
  const [isPaused, setIsPaused] = useState(false)
  const [isInRange, setIsInRange] = useState(true)
  const [fistAnimation, setFistAnimation] = useState({
    isActive: false,
    progress: 0,
    direction: 1,
    targetObject: null as any
  })

  // Handle spacebar for pausing movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPaused(true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPaused(false)
        setFistAnimation(prev => ({ ...prev, isActive: false, progress: 0 }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Handle mouse movement and interaction
  useFrame(({ camera, pointer, raycaster }) => {
    if (!playerRef.current) return

    // Update player position
    if (!isPaused) {
      const plane = new Vector3(0, 0, 0)
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(camera.parent?.children || [], true)
      
      if (intersects.length > 0) {
        const point = intersects[0].point
        setTargetPosition(point)
      }

      const direction = targetPosition.clone().sub(playerRef.current.position)
      if (direction.length() > 0.1) {
        direction.normalize()
        playerRef.current.position.add(direction.multiplyScalar(0.1))
        
        // Rotate player to face movement direction
        const angle = Math.atan2(direction.x, direction.z)
        playerRef.current.rotation.y = -angle

        // Notify other players about movement
        onMove(playerRef.current.position, playerRef.current.rotation.y)
      }
    }

    // Handle fist animation and interaction
    if (fistRef.current && isPaused) {
      const localRaycaster = new Raycaster()
      const origin = playerRef.current.position.clone()
      origin.y += 0.5 // Adjust to fist height
      
      localRaycaster.set(origin, new Vector3(
        Math.cos(playerRef.current.rotation.y),
        0,
        -Math.sin(playerRef.current.rotation.y)
      ))

      const intersects = localRaycaster.intersectObjects(camera.parent?.children || [], true)
      const currentRadius = selectedTool === 'gather' ? MINING_RADIUS : BUILD_RADIUS
      
      if (intersects.length > 0 && intersects[0].distance <= currentRadius) {
        const hitObject = intersects[0].object
        const hitPosition = intersects[0].point
        setIsInRange(true)

        // Start or continue fist animation
        if (!fistAnimation.isActive || fistAnimation.targetObject !== hitObject) {
          setFistAnimation({
            isActive: true,
            progress: 0,
            direction: 1,
            targetObject: hitObject
          })

          // Handle resource collection or block placement
          if (selectedTool === 'gather') {
            const objectType = hitObject.userData?.type
            if (objectType === 'tree' || objectType === 'rock') {
              onCollectResource(objectType, 1)
              onDestroyBlock(hitPosition)
            }
          } else if (selectedTool === 'build' && selectedBlockType) {
            const cost = selectedBlockType === 'wood-block' ? { wood: 1 } : { stone: 1 }
            if (spendResources(cost)) {
              onPlaceBlock(hitPosition, selectedBlockType)
            }
          }
        }
      } else {
        setIsInRange(false)
        setFistAnimation(prev => ({ ...prev, isActive: false, progress: 0 }))
      }
    }

    // Animate fist
    if (fistRef.current && fistAnimation.isActive) {
      // Smooth sine wave animation
      const amplitude = 0.5
      const frequency = 3
      const progress = fistAnimation.progress + 0.05 * fistAnimation.direction

      if (progress >= 1) {
        setFistAnimation(prev => ({ ...prev, direction: -1 }))
      } else if (progress <= 0) {
        setFistAnimation(prev => ({ ...prev, direction: 1 }))
      } else {
        setFistAnimation(prev => ({ ...prev, progress }))
      }

      // Apply smooth movement to fist
      const offset = Math.sin(progress * Math.PI) * amplitude
      fistRef.current.position.set(
        1 + offset * Math.cos(playerRef.current?.rotation.y || 0),
        0.5,
        offset * -Math.sin(playerRef.current?.rotation.y || 0)
      )
    } else if (fistRef.current) {
      // Reset fist position when not animating
      fistRef.current.position.set(1, 0.5, 0)
    }
  })

  return (
    <group>
      {/* Player body */}
      <mesh ref={playerRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>

      {/* Player fist */}
      <mesh ref={fistRef} position={[1, 0.5, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="brown" />
      </mesh>

      {/* Interaction radius visualization */}
      <mesh position={playerRef.current?.position || [0, 0, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0, selectedTool === 'gather' ? MINING_RADIUS : BUILD_RADIUS, 32]} />
        <meshBasicMaterial 
          color={selectedTool === 'gather' ? '#ff6b6b' : '#4dabf7'} 
          opacity={0.2} 
          transparent 
        />
      </mesh>
    </group>
  )
}
