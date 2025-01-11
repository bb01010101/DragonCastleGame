'use client'

import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sphere, Html } from '@react-three/drei'
import * as THREE from 'three'

interface PlayerProps {
  onCollectResource: (type: string, amount: number) => void
}

export function Player({ onCollectResource }: PlayerProps) {
  const playerRef = useRef<THREE.Mesh>(null)
  const { camera, scene } = useThree()
  const [isInitialized, setIsInitialized] = useState(false)
  const speed = 0.3
  const targetPosition = useRef(new THREE.Vector3(0, 1, 0))
  const keysPressed = useRef<{ [key: string]: boolean }>({})

  // Initialize player position
  useEffect(() => {
    if (playerRef.current && !isInitialized) {
      playerRef.current.position.set(0, 1, 0)
      camera.position.set(0, 20, 20)
      camera.lookAt(0, 0, 0)
      setIsInitialized(true)
    }
  }, [camera, isInitialized])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true
      e.preventDefault()
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    if (!playerRef.current || !isInitialized) return

    const movement = new THREE.Vector3(0, 0, 0)
    
    if (keysPressed.current['w'] || keysPressed.current['arrowup']) movement.z -= 1
    if (keysPressed.current['s'] || keysPressed.current['arrowdown']) movement.z += 1
    if (keysPressed.current['a'] || keysPressed.current['arrowleft']) movement.x -= 1
    if (keysPressed.current['d'] || keysPressed.current['arrowright']) movement.x += 1

    if (movement.length() > 0) {
      movement.normalize().multiplyScalar(speed)
      playerRef.current.position.add(movement)
      
      // Update target position for smooth camera following
      targetPosition.current.copy(playerRef.current.position)
      
      // Update camera position to follow player
      camera.position.x = targetPosition.current.x
      camera.position.z = targetPosition.current.z + 20
    }
  })

  return (
    <group position={[0, 1, 0]}>
      {/* Player shadow */}
      <mesh
        position={[0, -0.99, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="black" transparent opacity={0.3} />
      </mesh>

      {/* Player body */}
      <Sphere ref={playerRef} args={[0.5, 32, 32]} castShadow>
        <meshStandardMaterial 
          color="#3498db"
          emissive="#2980b9"
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.7}
        />
      </Sphere>

      {/* Player name */}
      <Html position={[0, 1.5, 0]} center>
        <div className="bg-black/50 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
          Player 1
        </div>
      </Html>
    </group>
  )
}
