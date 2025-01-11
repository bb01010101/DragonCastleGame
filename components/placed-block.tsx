import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface PlacedBlockProps {
  position: [number, number, number]
  type: 'wood-block' | 'stone-block'
  onDestroy: (position: [number, number, number], type: string) => void
}

export function PlacedBlock({ position, type, onDestroy }: PlacedBlockProps) {
  const meshRef = useRef<Mesh>(null)
  const [health, setHealth] = useState(type === 'stone-block' ? 100 : 50)
  const [isBeingHit, setIsBeingHit] = useState(false)

  const handleHit = () => {
    if (health <= 0) return
    
    setIsBeingHit(true)
    setHealth(prev => {
      const damage = type === 'stone-block' ? 10 : 25
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
      {type === 'wood-block' ? (
        <mesh ref={meshRef} onClick={handleHit}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      ) : (
        <mesh ref={meshRef} onClick={handleHit}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#808080" />
        </mesh>
      )}
    </group>
  )
} 