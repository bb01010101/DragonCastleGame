import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface EnvironmentObjectProps {
  position: [number, number, number]
  type: 'tree' | 'rock'
  onDestroy: (position: [number, number, number], type: string) => void
}

export function EnvironmentObject({ position, type, onDestroy }: EnvironmentObjectProps) {
  const meshRef = useRef<Mesh>(null)
  const [health, setHealth] = useState(type === 'rock' ? 100 : 50)
  const [isBeingHit, setIsBeingHit] = useState(false)

  // Set userData when mesh is created
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData.type = type
    }
  }, [type])

  const handleHit = () => {
    if (health <= 0) return
    
    setIsBeingHit(true)
    setHealth(prev => {
      const damage = type === 'rock' ? 10 : 25
      const newHealth = prev - damage
      if (newHealth <= 0) {
        onDestroy(position, type)
      }
      return newHealth
    })
    
    setTimeout(() => setIsBeingHit(false), 200)
  }

  useFrame(() => {
    if (meshRef.current && isBeingHit) {
      meshRef.current.scale.x = 1.1
      meshRef.current.scale.y = 0.9
    } else if (meshRef.current) {
      meshRef.current.scale.x = 1
      meshRef.current.scale.y = 1
    }
  })

  if (health <= 0) return null

  return (
    <group position={position}>
      {type === 'tree' ? (
        <>
          <mesh ref={meshRef} position={[0, 1, 0]} userData={{ type }}>
            <cylinderGeometry args={[0.2, 0.3, 2]} />
            <meshStandardMaterial color="#4b3621" />
          </mesh>
          <mesh position={[0, 2.5, 0]} userData={{ type }}>
            <coneGeometry args={[1, 2]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        </>
      ) : (
        <mesh ref={meshRef} userData={{ type }}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color="#808080" />
        </mesh>
      )}
      <mesh
        position={[0, 3, 0]}
        onClick={handleHit}
      >
        <boxGeometry args={[2, 3, 2]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
} 