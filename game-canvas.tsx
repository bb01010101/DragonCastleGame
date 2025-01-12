'use client'

import { Canvas } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
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
import { PlayMenu } from './components/play-menu'

// Disable SSR for Canvas
const CanvasWrapper = dynamic(() => Promise.resolve(Canvas), {
  ssr: false
})

export default function GameCanvas() {
  const [selectedTool, setSelectedTool] = useState<'build' | 'gather'>('gather')
  const [selectedBlockType, setSelectedBlockType] = useState<'wood-block' | 'stone-block' | null>(null)
  const [lastBlockType, setLastBlockType] = useState<'wood-block' | 'stone-block'>('wood-block')
  const { resources, addResources, spendResources } = useGameState()
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu')
  
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

  const handlePlay = useCallback(() => {
    setGameState('playing')
  }, [])

  const handleSandboxMode = useCallback(() => {
    setGameState('playing')
  }, [])

  if (gameState === 'menu') {
    return (
      <div className="w-full h-screen relative select-none bg-[#2D5A27]">
        <PlayMenu onPlay={handlePlay} onSandboxMode={handleSandboxMode} />
      </div>
    )
  }

  return (
    <div className="w-full h-screen relative select-none">
      <CanvasWrapper
        style={{ background: '#2D5A27' }}
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
        <color attach="background" args={['#2D5A27']} />
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
      </CanvasWrapper>
      
      {/* Resource Counter */}
      <div className="absolute top-8 left-8 flex items-center gap-4 text-2xl font-bold">
        <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg">
          <span className="text-green-300">🌲</span>
          <span className="text-white">{resources.wood || 0}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg">
          <span className="text-gray-300">🪨</span>
          <span className="text-white">{resources.stone || 0}</span>
        </div>
      </div>

      {/* Tool Selection */}
      <div className="absolute top-8 right-8">
        <div className="bg-black/30 p-2 rounded-lg">
          <Select value={selectedTool} onValueChange={(value: 'build' | 'gather') => {
            setSelectedTool(value)
            if (value !== 'build') setSelectedBlockType(null)
          }}>
            <SelectTrigger className="w-[180px] bg-transparent border-none text-white">
              <SelectValue placeholder="Select tool" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gather">Destroy (Q)</SelectItem>
              <SelectItem value="build">Build (Q)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Build Menu */}
      {selectedTool === 'build' && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
          <BuildMenu 
            resources={resources} 
            onBlockSelect={handleBlockSelect}
            selectedBlockType={selectedBlockType}
          />
        </div>
      )}

      {/* Mini Map */}
      <div className="absolute bottom-8 right-8 w-48 h-48 bg-black/30 rounded-lg overflow-hidden">
        <MiniMap />
      </div>

      {/* Controls Help */}
      <div className="absolute bottom-8 left-8 text-sm text-white bg-black/30 p-3 rounded-lg">
        <div className="font-bold mb-1">Controls:</div>
        Move cursor to guide character
        <br />
        Space + {selectedTool === 'gather' ? 'aim at resources to gather' : 'aim to place blocks'}
        <br />
        Q to toggle mode, 1-2 for block types
      </div>
    </div>
  )
}
