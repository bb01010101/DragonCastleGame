'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Raycaster, Mesh } from 'three'
import { BLOCK_SIZE } from '../constants'
import { checkCollision } from '../utils/collision'

const MOVEMENT_SPEED = 0.1
const INTERACTION_DISTANCE = 2
const BOUNDARY_RADIUS = 50
const DEATH_TIMER = 5000 // 5 seconds in milliseconds
const SPAWN_POSITION = new Vector3(0, 0, 0)

export function Player({ 
  onCollectResource, 
  selectedTool,
  selectedBlockType,
  setSelectedBlockType 
}: { 
  onCollectResource: (type: string, amount: number) => void
  selectedTool: 'build' | 'gather'
  selectedBlockType: string | null
  setSelectedBlockType: (type: string | null) => void
}) {
  const playerRef = useRef<Mesh>(null)
  const targetPosition = useRef(new Vector3(0, 0, 0))
  const { camera, raycaster, pointer } = useThree()
  const [outOfBoundsTime, setOutOfBoundsTime] = useState<number | null>(null)
  const [deathTimerVisible, setDeathTimerVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState(DEATH_TIMER / 1000)

  const respawnPlayer = () => {
    if (playerRef.current) {
      playerRef.current.position.copy(SPAWN_POSITION)
      targetPosition.current.copy(SPAWN_POSITION)
      setOutOfBoundsTime(null)
      setDeathTimerVisible(false)
      setTimeLeft(DEATH_TIMER / 1000)
    }
  }

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.position.set(0, 0, 0)
    }
  }, [])

  useFrame((state, delta) => {
    if (!playerRef.current) return

    // Update target position based on mouse position
    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(state.scene.children, true)
    
    if (intersects.length > 0) {
      const point = intersects[0].point
      targetPosition.current.set(point.x, 0, point.z)
    }

    // Move player towards target position
    const direction = targetPosition.current.clone().sub(playerRef.current.position)
    if (direction.length() > 0.1) {
      direction.normalize()
      const newPosition = playerRef.current.position.clone()
      newPosition.add(direction.multiplyScalar(MOVEMENT_SPEED))
      
      // Check for collisions before moving
      if (!checkCollision(newPosition)) {
        playerRef.current.position.copy(newPosition)
      }

      // Update player rotation to face movement direction
      const angle = Math.atan2(direction.x, direction.z)
      playerRef.current.rotation.y = angle
    }

    // Check if player is outside boundary
    const distanceFromCenter = playerRef.current.position.length()
    if (distanceFromCenter > BOUNDARY_RADIUS) {
      if (!outOfBoundsTime) {
        setOutOfBoundsTime(Date.now())
        setDeathTimerVisible(true)
      } else {
        const timeOutside = Date.now() - outOfBoundsTime
        setTimeLeft(Math.max(0, Math.ceil((DEATH_TIMER - timeOutside) / 1000)))
        
        if (timeOutside >= DEATH_TIMER) {
          respawnPlayer()
        }
      }
    } else {
      if (outOfBoundsTime) {
        setOutOfBoundsTime(null)
        setDeathTimerVisible(false)
        setTimeLeft(DEATH_TIMER / 1000)
      }
    }

    // Update camera position to follow player
    camera.position.x = playerRef.current.position.x
    camera.position.z = playerRef.current.position.z + 20
    camera.lookAt(playerRef.current.position)
  })

  // Handle mouse click for resource gathering or block placement
  useEffect(() => {
    const handleClick = () => {
      if (!playerRef.current) return

      const raycaster = new Raycaster()
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects([], true)

      if (intersects.length > 0) {
        const intersection = intersects[0]
        const distance = intersection.point.distanceTo(playerRef.current.position)

        if (distance <= INTERACTION_DISTANCE) {
          if (selectedTool === 'gather') {
            const resourceType = intersection.object.userData.type
            if (resourceType) {
              onCollectResource(resourceType, 1)
            }
          } else if (selectedTool === 'build' && selectedBlockType) {
            const position = intersection.point
            position.x = Math.round(position.x / BLOCK_SIZE) * BLOCK_SIZE
            position.z = Math.round(position.z / BLOCK_SIZE) * BLOCK_SIZE
          }
        }
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [camera, pointer, selectedTool, selectedBlockType, onCollectResource])

  return (
    <>
      <mesh ref={playerRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      
      {/* Boundary visualization */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <ringGeometry args={[BOUNDARY_RADIUS - 0.1, BOUNDARY_RADIUS, 64]} />
        <meshBasicMaterial color="#FF0000" opacity={0.5} transparent />
      </mesh>

      {/* Death Timer UI */}
      {deathTimerVisible && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/80 text-white px-4 py-2 rounded-lg text-xl font-bold">
          Return to boundary! Dying in {timeLeft}s
        </div>
      )}
    </>
  )
}
