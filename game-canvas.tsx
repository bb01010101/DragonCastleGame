'use client'

import { Canvas } from '@react-three/fiber'
import { OrthographicCamera, Stats } from '@react-three/drei'
import { useState, useCallback, Suspense, useEffect } from 'react'
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
  const [selectedTool, setSelectedTool] = useState<'build' | 'gather'>('gather')
  const [selectedBlockType, setSelectedBlockType] = useState<'wood-block' | 'stone-block' | null>(null)
  const [lastBlockType, setLastBlockType] = useState<'wood-block' | 'stone-block'>('wood-block')
  const { resources, addResources, spendResources } = useGameState()
  
  const handleCollectResource = useCallback((type: string, amount: number) => {
    addResources({ [type]: amount })
  }, [addResources])

  const handleBlockSelect = useCallback((type: 'wood-block' | 'stone-block') => {
    setSelectedBlockType(type)
    setLastBlockType(type)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyQ':
          setSelectedTool(prev => {
            const newTool = prev === 'gather' ? 'build' : 'gather'
            if (newTool === 'build') {
              setSelectedBlockType(lastBlockType)
            } else {
              setSelectedBlockType(null)
            }
            return newTool
          })
          break
        case 'Digit1':
          if (selectedTool === 'build') {
            setSelectedBlockType('wood-block')
            setLastBlockType('wood-block')
          }
          break
        case 'Digit2':
          if (selectedTool === 'build') {
            setSelectedBlockType('stone-block')
            setLastBlockType('stone-block')
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedTool, lastBlockType])

  return (
    <div className="w-full h-screen relative">
      <CanvasWrapper
        style={{ background: '#4CAF50' }}
        camera={{
          position: [0, 20, 20],
          near: 0.1,
          far: 1000,
          up: [0, 1, 0],
          zoom: 40
        }}
        onCreated={({ gl }) => {
          gl.domElement.style.touchAction = 'none'
        }}
        raycaster={{
          computeOffsets: (e) => ({
            offsetX: e.clientX,
            offsetY: e.clientY
          })
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
          <GameMap onCollectResource={handleCollectResource} />
          <Player 
            onCollectResource={handleCollectResource}
            selectedTool={selectedTool}
            selectedBlockType={selectedBlockType}
            setSelectedBlockType={setSelectedBlockType}
            resources={resources}
            spendResources={spendResources}
          />
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
            <Select value={selectedTool} onValueChange={(value: 'build' | 'gather') => {
              setSelectedTool(value)
              if (value !== 'build') setSelectedBlockType(null)
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select tool" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gather">Gather Resources (Q)</SelectItem>
                <SelectItem value="build">Build (Q)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary">Menu</Button>
          </div>
        </Card>
      </div>

      {selectedTool === 'build' && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <BuildMenu 
            resources={resources} 
            onBlockSelect={handleBlockSelect}
            selectedBlockType={selectedBlockType}
          />
        </div>
      )}

      <div className="absolute bottom-4 right-4 w-48 h-48 bg-black/20 rounded">
        <MiniMap />
      </div>

      {/* Movement Controls Help */}
      <div className="absolute bottom-4 left-4 text-sm text-white bg-black/50 p-2 rounded">
        Move cursor to guide character
        <br />
        Space + {selectedTool === 'gather' ? 'aim at resources to gather' : 'aim to place blocks'}
        <br />
        Q to toggle mode, 1-2 for block types
      </div>
    </div>
  )
}
