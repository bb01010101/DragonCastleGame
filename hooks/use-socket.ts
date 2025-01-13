import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { Vector3 } from 'three'

interface Player {
  id: string
  position: { x: number; y: number; z: number }
  rotation: number
  username: string
  tool: 'build' | 'gather'
  blockType: 'wood-block' | 'stone-block' | null
}

interface GameState {
  players: Player[]
  resources: Array<{ type: string; position: { x: number; y: number; z: number } }>
  blocks: Array<{ type: string; position: { x: number; y: number; z: number } }>
}

export function useSocket(username: string) {
  const socketRef = useRef<Socket>()
  const playersRef = useRef<Map<string, Player>>(new Map())
  const resourcesRef = useRef<Map<string, any>>(new Map())
  const blocksRef = useRef<Map<string, any>>(new Map())

  const connect = useCallback(() => {
    socketRef.current = io('http://localhost:3001')
    
    socketRef.current.on('connect', () => {
      console.log('Connected to server')
      socketRef.current?.emit('join', username)
    })

    socketRef.current.on('gameState', (state: GameState) => {
      state.players.forEach(player => {
        if (player.id !== socketRef.current?.id) {
          playersRef.current.set(player.id, player)
        }
      })
      
      state.resources.forEach(resource => {
        const key = `${resource.position.x},${resource.position.y},${resource.position.z}`
        resourcesRef.current.set(key, resource)
      })
      
      state.blocks.forEach(block => {
        const key = `${block.position.x},${block.position.y},${block.position.z}`
        blocksRef.current.set(key, block)
      })
    })

    socketRef.current.on('playerJoined', (player: Player) => {
      playersRef.current.set(player.id, player)
    })

    socketRef.current.on('playerLeft', (playerId: string) => {
      playersRef.current.delete(playerId)
    })

    socketRef.current.on('playerMoved', (data: { id: string; position: { x: number; y: number; z: number }; rotation: number }) => {
      const player = playersRef.current.get(data.id)
      if (player) {
        player.position = data.position
        player.rotation = data.rotation
      }
    })

    socketRef.current.on('playerUpdatedTool', (data: { id: string; tool: 'build' | 'gather'; blockType: 'wood-block' | 'stone-block' | null }) => {
      const player = playersRef.current.get(data.id)
      if (player) {
        player.tool = data.tool
        player.blockType = data.blockType
      }
    })

    socketRef.current.on('resourceCollected', (data: { position: { x: number; y: number; z: number } }) => {
      const key = `${data.position.x},${data.position.y},${data.position.z}`
      resourcesRef.current.delete(key)
    })

    socketRef.current.on('blockPlaced', (data: { position: { x: number; y: number; z: number }; type: string }) => {
      const key = `${data.position.x},${data.position.y},${data.position.z}`
      blocksRef.current.set(key, data)
    })

    socketRef.current.on('blockDestroyed', (data: { position: { x: number; y: number; z: number } }) => {
      const key = `${data.position.x},${data.position.y},${data.position.z}`
      blocksRef.current.delete(key)
    })
  }, [username])

  const updatePosition = useCallback((position: Vector3, rotation: number) => {
    socketRef.current?.emit('updatePosition', {
      position: { x: position.x, y: position.y, z: position.z },
      rotation
    })
  }, [])

  const updateTool = useCallback((tool: 'build' | 'gather', blockType: 'wood-block' | 'stone-block' | null) => {
    socketRef.current?.emit('updateTool', { tool, blockType })
  }, [])

  const collectResource = useCallback((position: Vector3, type: string) => {
    socketRef.current?.emit('collectResource', {
      position: { x: position.x, y: position.y, z: position.z },
      type
    })
  }, [])

  const placeBlock = useCallback((position: Vector3, type: string) => {
    socketRef.current?.emit('placeBlock', {
      position: { x: position.x, y: position.y, z: position.z },
      type
    })
  }, [])

  const destroyBlock = useCallback((position: Vector3) => {
    socketRef.current?.emit('destroyBlock', {
      position: { x: position.x, y: position.y, z: position.z }
    })
  }, [])

  useEffect(() => {
    connect()
    return () => {
      socketRef.current?.disconnect()
    }
  }, [connect])

  return {
    players: playersRef.current,
    resources: resourcesRef.current,
    blocks: blocksRef.current,
    updatePosition,
    updateTool,
    collectResource,
    placeBlock,
    destroyBlock
  }
} 