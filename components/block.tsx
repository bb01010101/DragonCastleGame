import { Vector3 } from 'three'

interface BlockProps {
  position: Vector3
  type: 'wood-block' | 'stone-block'
}

export function Block({ position, type }: BlockProps) {
  const color = type === 'wood-block' ? '#8B4513' : '#808080'

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
} 