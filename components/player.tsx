'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sphere, Html } from '@react-three/drei'
import * as THREE from 'three'

interface PlayerProps {
  onCollectResource: (type: string, amount: number) => void
}

export function Player({ onCollectResource }: PlayerProps) {
  const playerRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()
  const speed = 0.5
  const targetPosition = useRef(new THREE.Vector3(0, 0.5, 0))
  const keysPressed = useRef<{ [key: string]: boolean }>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true
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
    if (!playerRef.current) return

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
    }

    // Smooth camera following
    camera.position.x += (targetPosition.current.x - camera.position.x) * 0.1
    camera.position.z += (targetPosition.current.z + 10 - camera.position.z) * 0.1
  })

  return (
    <group>
      {/* Player shadow */}
      <mesh
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[0.3, 32]} />
        <meshBasicMaterial color="black" transparent opacity={0.3} />
      </mesh>

      {/* Player body */}
      <Sphere ref={playerRef} args={[0.3, 32, 32]} position={[0, 0.5, 0]} castShadow>
        <meshStandardMaterial color="#3498db" />
      </Sphere>

      {/* Player name */}
      <Html position={[0, 1.2, 0]}>
        <div className="bg-black/50 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
          Player 1
        </div>
      </Html>
    </group>
  )
}
