'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Raycaster, Mesh } from 'three'
import { BLOCK_SIZE } from '../constants'
import { checkCollision } from '../utils/collision'

const MOVEMENT_SPEED = 0.1
const INTERACTION_DISTANCE = 2

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

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.position.set(0, 0, 0)
    }
  }, [])

  useFrame((state) => {
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
      const intersects = raycaster.intersectObjects([], true) // Add relevant objects to check intersection with

      if (intersects.length > 0) {
        const intersection = intersects[0]
        const distance = intersection.point.distanceTo(playerRef.current.position)

        if (distance <= INTERACTION_DISTANCE) {
          if (selectedTool === 'gather') {
            // Handle resource gathering
            const resourceType = intersection.object.userData.type
            if (resourceType) {
              onCollectResource(resourceType, 1)
            }
          } else if (selectedTool === 'build' && selectedBlockType) {
            // Handle block placement
            const position = intersection.point
            position.x = Math.round(position.x / BLOCK_SIZE) * BLOCK_SIZE
            position.z = Math.round(position.z / BLOCK_SIZE) * BLOCK_SIZE
            // Add block placement logic here
          }
        }
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [camera, pointer, selectedTool, selectedBlockType, onCollectResource])

  return (
    <mesh ref={playerRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#FF0000" />
    </mesh>
  )
}
