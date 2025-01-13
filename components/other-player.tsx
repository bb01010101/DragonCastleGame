import { useRef } from 'react'
import { Mesh } from 'three'
import { Html } from '@react-three/drei'

interface OtherPlayerProps {
  position: { x: number; y: number; z: number }
  rotation: number
  username: string
  tool: 'build' | 'gather'
}

export function OtherPlayer({ position, rotation, username, tool }: OtherPlayerProps) {
  const playerRef = useRef<Mesh>(null)
  const fistRef = useRef<Mesh>(null)

  return (
    <group position={[position.x, position.y, position.z]} rotation-y={rotation}>
      {/* Player body */}
      <mesh ref={playerRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Player fist */}
      <mesh ref={fistRef} position={[1, 0.5, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="brown" />
      </mesh>

      {/* Username label */}
      <Html position={[0, 2, 0]} center>
        <div className="bg-black/50 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
          {username}
          <span className="ml-2 text-xs">
            {tool === 'gather' ? '⛏️' : '🏗️'}
          </span>
        </div>
      </Html>
    </group>
  )
} 