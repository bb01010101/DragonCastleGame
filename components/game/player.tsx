'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Raycaster, Mesh, Plane, Vector2 } from 'three'
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
  const [username] = useState('Player1')
  const { camera, gl } = useThree()
  const raycaster = useRef(new Raycaster())
  const targetPosition = useRef(new Vector3(0, 0.5, 0))
  const mouse = useRef(new Vector2())

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Get mouse position
      const rect = gl.domElement.getBoundingClientRect()
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Update raycaster
      raycaster.current.setFromCamera(mouse.current, camera)

      // Find intersection with ground plane (y = 0)
      const plane = new Plane(new Vector3(0, 1, 0), 0)
      const target = new Vector3()
      raycaster.current.ray.intersectPlane(plane, target)

      if (target) {
        target.y = 0.5 // Keep constant height
        targetPosition.current = target
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [camera, gl])

  useFrame(() => {
    if (meshRef.current && targetPosition.current) {
      const currentPos = new Vector3(position[0], position[1], position[2])
      const direction = new Vector3()
      direction.subVectors(targetPosition.current, currentPos)
      
      // Only move if we're not very close to the target
      if (direction.length() > 0.1) {
        direction.normalize()
        const speed = 0.15 // Adjust speed as needed
        direction.multiplyScalar(speed)
        
        const newPos = new Vector3()
        newPos.addVectors(currentPos, direction)
        setPosition([newPos.x, newPos.y, newPos.z])

        // Update camera to follow player
        camera.position.x = newPos.x
        camera.position.z = newPos.z + 20
        camera.lookAt(newPos.x, 0, newPos.z)
      }
    }
  })

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
        point.y = 0.5
        
        point.x = Math.round(point.x)
        point.z = Math.round(point.z)
        
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