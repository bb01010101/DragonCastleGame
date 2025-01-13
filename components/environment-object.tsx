import { useRef, useState } from 'react'
import { Mesh } from 'three'
import { BLOCK_SIZE } from '../constants'

interface EnvironmentObjectProps {
  id: string
  type: string
  position: { x: number; y: number; z: number }
  onDestroy?: (id: string, type: string) => void
}

const TREE_COLORS = [
  '#2d5a27',
  '#1e4d2b',
  '#133337',
  '#1d4d4f'
]

export function EnvironmentObject({ id, type, position, onDestroy }: EnvironmentObjectProps) {
  const meshRef = useRef<Mesh>(null)
  const [health, setHealth] = useState(100)
  const [treeColor] = useState(() => TREE_COLORS[Math.floor(Math.random() * TREE_COLORS.length)])

  const handleClick = () => {
    if (!onDestroy) return
    
    setHealth(prev => {
      const newHealth = prev - 20
      if (newHealth <= 0) {
        onDestroy(id, type)
        return 0
      }
      return newHealth
    })
  }

  if (type === 'tree') {
    return (
      <group position={[position.x, position.y, position.z]} onClick={handleClick}>
        {/* Tree trunk */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.2, 1.5, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        
        {/* Tree foliage layers */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <coneGeometry args={[1, 1.5, 8]} />
          <meshStandardMaterial color={treeColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, 2, 0]} castShadow>
          <coneGeometry args={[0.8, 1.2, 8]} />
          <meshStandardMaterial color={treeColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.5, 0]} castShadow>
          <coneGeometry args={[0.6, 1, 8]} />
          <meshStandardMaterial color={treeColor} roughness={0.7} />
        </mesh>

        {/* Invisible hit box */}
        <mesh ref={meshRef} visible={false}>
          <boxGeometry args={[2, 4, 2]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    )
  }

  if (type === 'rock') {
    return (
      <group position={[position.x, position.y, position.z]} onClick={handleClick}>
        <mesh castShadow receiveShadow>
          <octahedronGeometry args={[0.8]} />
          <meshStandardMaterial color="#808080" roughness={0.6} metalness={0.2} />
        </mesh>
      </group>
    )
  }

  if (type === 'wood-block') {
    return (
      <group position={[position.x, position.y, position.z]} onClick={handleClick}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} metalness={0.1} />
        </mesh>
      </group>
    )
  }

  if (type === 'stone-block') {
    return (
      <group position={[position.x, position.y, position.z]} onClick={handleClick}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE]} />
          <meshStandardMaterial color="#808080" roughness={0.6} metalness={0.2} />
        </mesh>
      </group>
    )
  }

  return null
} 