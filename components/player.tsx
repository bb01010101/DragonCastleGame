'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sphere, Html } from '@react-three/drei'
import * as THREE from 'three'
import { BIOMES } from './game-map'

interface PlayerProps {
  onCollectResource: (type: string, amount: number) => void
}

export function Player({ onCollectResource }: PlayerProps) {
  const playerRef = useRef<THREE.Mesh>(null)
  const { camera, scene, gl } = useThree()
  const keysPressed = useRef<{ [key: string]: boolean }>({})
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 0.5, 0))
  const [showResourceMessage, setShowResourceMessage] = useState(false)
  const [nearbyResource, setNearbyResource] = useState<string | null>(null)
  
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
  
  const checkNearbyResources = useCallback(() => {
    if (!playerRef.current) return

    const raycaster = new THREE.Raycaster()
    raycaster.set(
      new THREE.Vector3(playerRef.current.position.x, 10, playerRef.current.position.z),
      new THREE.Vector3(0, -1, 0)
    )
    const intersects = raycaster.intersectObjects(scene.children, true)
    
    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object as THREE.Mesh
      const material = intersectedObject.material as THREE.MeshStandardMaterial
      if (material && material.map) {
        const uv = intersects[0].uv
        if (uv) {
          const pixelBuffer = new Uint8Array(4)
          const renderTarget = gl.getRenderTarget()
          gl.readRenderTargetPixels(
            renderTarget,
            Math.floor(uv.x * gl.domElement.width),
            Math.floor(uv.y * gl.domElement.height),
            1,
            1,
            pixelBuffer
          )
          const color = `#${pixelBuffer[0].toString(16).padStart(2, '0')}${pixelBuffer[1].toString(16).padStart(2, '0')}${pixelBuffer[2].toString(16).padStart(2, '0')}`
          
          const nearbyBiome = Object.entries(BIOMES).find(([_, biome]) => biome.color === color)
          
          if (nearbyBiome && nearbyBiome[1].resource) {
            setNearbyResource(nearbyBiome[1].resource)
            setShowResourceMessage(true)
          } else {
            setShowResourceMessage(false)
            setNearbyResource(null)
          }
        }
      }
    }
  }, [scene, gl])
  
  useFrame((state, delta) => {
    if (!playerRef.current) return
    
    const speed = 10
    const movement = new THREE.Vector3(0, 0, 0)
    
    if (keysPressed.current['w'] || keysPressed.current['arrowup']) movement.z -= 1
    if (keysPressed.current['s'] || keysPressed.current['arrowdown']) movement.z += 1
    if (keysPressed.current['a'] || keysPressed.current['arrowleft']) movement.x -= 1
    if (keysPressed.current['d'] || keysPressed.current['arrowright']) movement.x += 1
    
    if (movement.length() > 0) {
      movement.normalize().multiplyScalar(speed * delta)
      playerRef.current.position.add(movement)
      camera.position.set(
        playerRef.current.position.x,
        camera.position.y,
        playerRef.current.position.z + 10
      )
      setPlayerPosition(playerRef.current.position.clone())
      
      // Check for nearby resources after movement
      checkNearbyResources()
    }
  })
  
  const handleClick = () => {
    if (nearbyResource) {
      onCollectResource(nearbyResource, 1)
      setShowResourceMessage(false)
    }
  }
  
  return (
    <group onClick={handleClick}>
      <Sphere ref={playerRef} args={[0.5]} position={playerPosition}>
        <meshStandardMaterial color="#ff0000" />
      </Sphere>
      {showResourceMessage && nearbyResource && (
        <Html position={[playerPosition.x, playerPosition.y + 1, playerPosition.z]}>
          <div className="bg-white p-2 rounded text-black text-sm">
            Click to collect {nearbyResource}
          </div>
        </Html>
      )}
    </group>
  )
}
