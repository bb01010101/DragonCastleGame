import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Player } from './player'
import { OtherPlayer } from './other-player'
import { PlayMenu } from './play-menu'
import { BuildMenu } from './build-menu'
import { ResourcePanel } from './resource-panel'
import { GameMap } from './game-map'
import { useSocket } from '../hooks/use-socket'
import { useGameState } from '../hooks/use-game-state'

export function GameCanvas() {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu')
  const [username, setUsername] = useState('')
  const [selectedTool, setSelectedTool] = useState<'gather' | 'build'>('gather')
  const [selectedBlockType, setSelectedBlockType] = useState<'wood-block' | 'stone-block' | null>(null)
  const { resources, addResources, spendResources } = useGameState()
  const { 
    connected,
    players, 
    resources: gameResources,
    blocks: gameBlocks,
    updatePosition, 
    updateTool, 
    collectResource, 
    placeBlock, 
    destroyBlock 
  } = useSocket(username)

  const handleUsernameChange = (newUsername: string) => {
    setUsername(newUsername)
  }

  const handlePlay = () => {
    if (!username.trim()) return
    setGameState('playing')
  }

  const handleSandboxMode = () => {
    if (!username.trim()) return
    setGameState('playing')
  }

  const handleCollectResource = (id: string, type: string) => {
    collectResource(id)
    addResources({ [type]: 1 })
  }

  const handleDestroyBlock = (id: string) => {
    destroyBlock(id)
  }

  const handleBlockSelect = (blockType: 'wood-block' | 'stone-block' | null) => {
    setSelectedTool('build')
    setSelectedBlockType(blockType)
    updateTool('build', blockType)
  }

  if (gameState === 'menu') {
    return (
      <PlayMenu 
        onPlay={handlePlay}
        onSandboxMode={handleSandboxMode}
        username={username}
        onUsernameChange={handleUsernameChange}
      />
    )
  }

  if (!connected) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <p className="text-lg">Connecting to server...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Canvas shadows>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} castShadow />
        <OrbitControls />
        
        <GameMap
          resources={gameResources}
          blocks={gameBlocks}
          onCollectResource={handleCollectResource}
          onDestroyBlock={handleDestroyBlock}
        />

        <Player
          selectedTool={selectedTool}
          selectedBlockType={selectedBlockType}
          resources={resources}
          onCollectResource={handleCollectResource}
          spendResources={spendResources}
          onMove={updatePosition}
          onPlaceBlock={placeBlock}
          onDestroyBlock={handleDestroyBlock}
        />

        {players.map((player) => (
          <OtherPlayer
            key={player.id}
            position={player.position}
            rotation={player.rotation}
            username={player.username}
            tool={player.tool}
          />
        ))}
      </Canvas>

      <div className="fixed top-4 right-4">
        <ResourcePanel resources={resources} />
      </div>

      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2">
        <BuildMenu
          resources={resources}
          selectedBlockType={selectedBlockType}
          onBlockSelect={handleBlockSelect}
        />
      </div>
    </>
  )
} 