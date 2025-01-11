'use client'

import { Canvas } from '@react-three/fiber'
import { OrthographicCamera, Stats } from '@react-three/drei'
import { useState, useCallback, Suspense } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import dynamic from 'next/dynamic'
import { GameMap } from './components/game-map'
import { ResourcePanel } from './components/resource-panel'
import { BuildMenu } from './components/build-menu'
import { MiniMap } from './components/mini-map'
import { Player } from './components/player'
import { useGameState } from './hooks/use-game-state'

// Disable SSR for Canvas
const CanvasWrapper = dynamic(() => Promise.resolve(Canvas), {
  ssr: false
})

export default function GameCanvas() {
  const [selectedTool, setSelectedTool] = useState<'build' | 'attack' | 'gather'>('gather')
  const { resources, addResources, spendResources } = useGameState()
  
  const handleCollectResource = useCallback((type: string, amount: number) => {
    addResources({ [type]: amount })
  }, [addResources])

  return (
    <div className="w-full h-screen relative bg-green-600">
      <CanvasWrapper
        style={{ background: '#4CAF50' }}
        camera={{
          position: [0, 20, 20],
          near: 0.1,
          far: 1000,
          up: [0, 1, 0],
          zoom: 40
        }}
      >
        <OrthographicCamera 
          makeDefault 
          position={[0, 20, 20]}
          zoom={40}
        />
        <color attach="background" args={['#4CAF50']} />
        <ambientLight intensity={1.0} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <Suspense fallback={null}>
          <GameMap />
          <Player onCollectResource={handleCollectResource} />
        </Suspense>
        <Stats />
      </CanvasWrapper>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <Card className="p-4 pointer-events-auto bg-black/50 text-white">
          <ResourcePanel resources={resources} />
        </Card>

        <Card className="p-4 pointer-events-auto bg-black/50">
          <div className="flex gap-2">
            <Select value={selectedTool} onValueChange={(value: 'build' | 'attack' | 'gather') => setSelectedTool(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select tool" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gather">Gather Resources</SelectItem>
                <SelectItem value="build">Build</SelectItem>
                <SelectItem value="attack">Attack</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary">Menu</Button>
          </div>
        </Card>
      </div>

      {selectedTool === 'build' && (
        <div className="absolute bottom-4 left-4 right-4">
          <BuildMenu resources={resources} onBuild={spendResources} />
        </div>
      )}

      <div className="absolute bottom-4 right-4 w-48 h-48 bg-black/20 rounded">
        <MiniMap />
      </div>

      {/* Movement Controls Help */}
      <div className="absolute bottom-4 left-4 text-sm text-white bg-black/50 p-2 rounded">
        WASD or Arrow Keys to move, Click to gather resources
      </div>
    </div>
  )
}
