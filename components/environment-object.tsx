import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Group } from 'three'

interface EnvironmentObjectProps {
  position: [number, number, number]
  type: 'tree' | 'rock' | 'wood-block' | 'stone-block'
  onDestroy: (position: [number, number, number], type: string) => void
  onCollectResource: (type: string, amount: number) => void
}

const TREE_COLORS = [
  '#1B4D3E', // Dark forest green
  '#2D5A27', // Pine green
  '#1D6F42', // Forest green
  '#2E8B57', // Sea green
]

export function EnvironmentObject({ position, type, onDestroy, onCollectResource }: EnvironmentObjectProps) {
  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)
  const [health, setHealth] = useState(type === 'rock' || type === 'stone-block' ? 100 : 50)
  const [isBeingHit, setIsBeingHit] = useState(false)
  const [hitDirection, setHitDirection] = useState(1)
  const [treeColor] = useState(() => TREE_COLORS[Math.floor(Math.random() * TREE_COLORS.length)])

  // Set userData when mesh is created
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.userData.type = type
    }
  }, [type])

  const handleHit = () => {
    if (health <= 0) return
    
    setIsBeingHit(true)
    setHitDirection(Math.random() > 0.5 ? 1 : -1)
    setHealth(prev => {
      const damage = type === 'rock' || type === 'stone-block' ? 10 : 25
      const newHealth = prev - damage
      if (newHealth <= 0) {
        onDestroy(position, type)
      }
      return newHealth
    })
    
    setTimeout(() => setIsBeingHit(false), 200)
  }

  useFrame(() => {
    if (groupRef.current && isBeingHit) {
      // Random wobble animation
      groupRef.current.rotation.z = Math.sin(Date.now() * 0.05) * 0.1 * hitDirection
      groupRef.current.position.y = Math.abs(Math.sin(Date.now() * 0.05)) * 0.1
    } else if (groupRef.current) {
      groupRef.current.rotation.z = 0
      groupRef.current.position.y = 0
    }
  })

  if (health <= 0) return null

  return (
    <group ref={groupRef} position={position}>
      {type === 'tree' ? (
        <>
          {/* Tree trunk */}
          <mesh position={[0, 0.75, 0]} userData={{ type }}>
            <cylinderGeometry args={[0.2, 0.3, 1.5]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Tree foliage layers */}
          <mesh position={[0, 1.75, 0]} userData={{ type }}>
            <coneGeometry args={[1.2, 1.5]} />
            <meshStandardMaterial color={treeColor} />
          </mesh>
          <mesh position={[0, 2.5, 0]} userData={{ type }}>
            <coneGeometry args={[0.9, 1.2]} />
            <meshStandardMaterial color={treeColor} />
          </mesh>
          <mesh position={[0, 3.1, 0]} userData={{ type }}>
            <coneGeometry args={[0.6, 1]} />
            <meshStandardMaterial color={treeColor} />
          </mesh>
        </>
      ) : type === 'rock' ? (
        <mesh ref={meshRef} userData={{ type }}>
          <octahedronGeometry args={[0.8]} />
          <meshStandardMaterial 
            color="#808080"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      ) : (
        // Wood or stone block
        <mesh ref={meshRef} userData={{ type }}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color={type === 'wood-block' ? '#8B4513' : '#808080'}
            roughness={type === 'wood-block' ? 1 : 0.8}
            metalness={type === 'wood-block' ? 0 : 0.2}
          />
        </mesh>
      )}
      {/* Invisible hit box */}
      <mesh
        scale={type === 'tree' ? [2.4, 4, 2.4] : [1.5, 1.5, 1.5]}
        position={type === 'tree' ? [0, 2, 0] : [0, 0, 0]}
        onClick={handleHit}
      >
        <boxGeometry />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
} 