import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface Player {
  id: string
  position: { x: number; y: number; z: number }
  rotation: number
  username: string
  tool: 'build' | 'gather'
  blockType: 'wood-block' | 'stone-block' | null
}

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

interface GameState {
  players: Player[]
  resources: Resource[]
  blocks: Block[]
}

export function useSocket(username: string) {
  const [players, setPlayers] = useState<Player[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket>()

  useEffect(() => {
    if (!username) return

    // Get the current hostname
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = process.env.NEXT_PUBLIC_VERCEL_URL || window.location.host
    const socketUrl = process.env.NODE_ENV === 'production'
      ? `${protocol}//${host}`
      : 'http://localhost:3000'

    console.log('Connecting to socket URL:', socketUrl)

    socketRef.current = io(socketUrl, {
      path: '/api/socket',
      addTrailingSlash: false,
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
      socket.emit('join', username)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    socket.on('gameState', (state: GameState) => {
      setPlayers(state.players.filter(p => p.id !== socket.id))
      setResources(state.resources)
      setBlocks(state.blocks)
    })

    socket.on('playerJoined', (player: Player) => {
      setPlayers(prev => [...prev, player])
    })

    socket.on('playerLeft', (playerId: string) => {
      setPlayers(prev => prev.filter(p => p.id !== playerId))
    })

    socket.on('playerMoved', (player: Player) => {
      setPlayers(prev => prev.map(p => p.id === player.id ? player : p))
    })

    socket.on('playerUpdatedTool', ({ playerId, tool, blockType }: { playerId: string; tool: 'build' | 'gather'; blockType: 'wood-block' | 'stone-block' | null }) => {
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, tool, blockType } : p))
    })

    socket.on('resourceCollected', (resourceId: string) => {
      setResources(prev => prev.filter(r => r.id !== resourceId))
    })

    socket.on('resourceSpawned', (resource: Resource) => {
      setResources(prev => [...prev, resource])
    })

    socket.on('blockPlaced', (block: Block) => {
      setBlocks(prev => [...prev, block])
    })

    socket.on('blockDestroyed', (blockId: string) => {
      setBlocks(prev => prev.filter(b => b.id !== blockId))
    })

    return () => {
      socket.disconnect()
    }
  }, [username])

  const updatePosition = useCallback((position: { x: number; y: number; z: number }, rotation: number) => {
    if (!socketRef.current?.connected) return
    socketRef.current.emit('move', { position, rotation })
  }, [])

  const updateTool = useCallback((tool: 'build' | 'gather', blockType: 'wood-block' | 'stone-block' | null) => {
    if (!socketRef.current?.connected) return
    socketRef.current.emit('updateTool', { tool, blockType })
  }, [])

  const collectResource = useCallback((resourceId: string) => {
    if (!socketRef.current?.connected) return
    socketRef.current.emit('collectResource', resourceId)
  }, [])

  const placeBlock = useCallback((block: { type: string; position: { x: number; y: number; z: number } }) => {
    if (!socketRef.current?.connected) return
    socketRef.current.emit('placeBlock', block)
  }, [])

  const destroyBlock = useCallback((blockId: string) => {
    if (!socketRef.current?.connected) return
    socketRef.current.emit('destroyBlock', blockId)
  }, [])

  return {
    connected,
    players,
    resources,
    blocks,
    updatePosition,
    updateTool,
    collectResource,
    placeBlock,
    destroyBlock
  }
} 