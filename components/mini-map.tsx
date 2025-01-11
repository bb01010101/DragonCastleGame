'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'

export function MiniMap() {
  const { scene, gl } = useThree()
  const miniMapCamera = useRef<THREE.OrthographicCamera>(null)
  const playerRef = useRef<THREE.Mesh | null>(null)

  useEffect(() => {
    // Find the player mesh in the scene
    scene.traverse((object) => {
      if (object.type === 'Mesh' && object.material.color?.r === 1) {
        playerRef.current = object as THREE.Mesh
      }
    })
  }, [scene])

  useFrame(() => {
    if (miniMapCamera.current && playerRef.current) {
      // Update minimap camera position to follow player from top-down view
      miniMapCamera.current.position.x = playerRef.current.position.x
      miniMapCamera.current.position.z = playerRef.current.position.z
    }
  })

  return (
    <>
      <OrthographicCamera
        ref={miniMapCamera}
        makeDefault={false}
        position={[0, 50, 0]}
        zoom={5}
        near={0.1}
        far={1000}
      />
      
      {/* Player marker on minimap */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </>
  )
}
