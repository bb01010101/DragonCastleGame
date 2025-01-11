'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Raycaster, Mesh } from 'three'
import { Text } from '@react-three/drei'

interface PlayerProps {
  onCollectResource: (type: string, amount: number) => void
  selectedTool: 'build' | 'gather'
  selectedBlockType: 'wood-block' | 'stone-block' | null
  setSelectedBlockType: (type: 'wood-block' | 'stone-block' | null) => void
}

export function Player({ 
  onCollectResource, 
  selectedTool,
  selectedBlockType,
  setSelectedBlockType 
}: PlayerProps) {
  const meshRef = useRef<Mesh>(null)
  const [position, setPosition] = useState<[number, number, number]>([0, 0.5, 0])
  const [username] = useState('Player1') // In a real app, this would come from auth
  const { camera } = useThree()
  const raycaster = useRef(new Raycaster())

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 0.5
      const [x, y, z] = position

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setPosition([x, y, z - speed])
          break
        case 's':
        case 'arrowdown':
          setPosition([x, y, z + speed])
          break
        case 'a':
        case 'arrowleft':
          setPosition([x - speed, y, z])
          break
        case 'd':
        case 'arrowright':
          setPosition([x + speed, y, z])
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [position])

  useEffect(() => {
    if (meshRef.current) {
      camera.position.x = position[0]
      camera.position.z = position[2] + 20
      camera.lookAt(new Vector3(position[0], 0, position[2]))
    }
  }, [camera, position])

  const handleClick = (event: any) => {
    event.stopPropagation()
    
    if (!meshRef.current) return

    raycaster.current.setFromCamera(event.point, camera)
    const intersects = raycaster.current.intersectObjects(meshRef.current.parent?.children || [], true)

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object

      if (selectedTool === 'gather') {
        const userData = clickedObject.userData
        if (userData.type === 'environment-object') {
          if (userData.damage) {
            userData.damage(25)
          }
        }
      } else if (selectedTool === 'build' && selectedBlockType) {
        const point = intersects[0].point
        point.y = 0.5 // Place blocks at ground level
        
        // Round to grid
        point.x = Math.round(point.x)
        point.z = Math.round(point.z)
        
        // Create new block at position
        const blockPosition: [number, number, number] = [point.x, point.y, point.z]
        meshRef.current.parent?.add(
          <mesh position={blockPosition}>
            {selectedBlockType === 'wood-block' ? (
              <>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#8B4513" />
              </>
            ) : (
              <>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color="#808080" />
              </>
            )}
          </mesh>
        )
        setSelectedBlockType(null)
      }
    }
  }

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onClick={handleClick}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      <Text
        position={[position[0], position[1] + 1.5, position[2]]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {username}
      </Text>
    </group>
  )
}
