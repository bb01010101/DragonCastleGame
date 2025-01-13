'use client'

import { EnvironmentObject } from './environment-object'

interface Resource {
  id: string
  type: string
  position: { x: number; y: number; z: number }
}

interface Block {
  id: string
  type: string
  position: { x: number; y: number; z: number }
}

interface GameMapProps {
  resources: Resource[]
  blocks: Block[]
  onCollectResource: (id: string, type: string) => void
  onDestroyBlock: (id: string) => void
}

export function GameMap({ resources, blocks, onCollectResource, onDestroyBlock }: GameMapProps) {
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.8} />
      </mesh>

      {/* Resources */}
      {resources.map((resource) => (
        <EnvironmentObject
          key={resource.id}
          id={resource.id}
          type={resource.type}
          position={resource.position}
          onDestroy={onCollectResource}
        />
      ))}

      {/* Blocks */}
      {blocks.map((block) => (
        <EnvironmentObject
          key={block.id}
          id={block.id}
          type={block.type}
          position={block.position}
          onDestroy={onDestroyBlock}
        />
      ))}
    </group>
  )
}
