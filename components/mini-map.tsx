'use client'

import { Canvas } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'

function MiniMapContent() {
  return (
    <>
      <OrthographicCamera
        position={[0, 50, 0]}
        zoom={5}
        near={0.1}
        far={1000}
      />
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <ambientLight intensity={1} />
    </>
  )
}

export function MiniMap() {
  return (
    <div className="w-full h-full bg-black/20 rounded overflow-hidden">
      <Canvas
        camera={{ position: [0, 50, 0], near: 0.1, far: 1000, up: [0, 1, 0] }}
        style={{ width: '100%', height: '100%' }}
      >
        <MiniMapContent />
      </Canvas>
    </div>
  )
}
