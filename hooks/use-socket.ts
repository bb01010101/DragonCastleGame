import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface Player {
  id: string
  username: string
  position: { x: number; y: number; z: number }
  rotation: number
  tool: 'build' | 'gather'
}

interface Resource {
  id: string
  type: 'tree' | 'rock'
  position: { x: number; y: number; z: number }
}

interface Block {
  id: string
  type: 'wood-block' | 'stone-block'
  position: { x: number; y: number; z: number }
}

export function useSocket(username: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])

  useEffect(() => {
    if (!username) return

    // Get the current hostname and protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const socketUrl = `${protocol}//${host}`

    console.log('Connecting to socket URL:', socketUrl)

    const newSocket = io(socketUrl, {
      path: '/api/socket',
      addTrailingSlash: false,
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    newSocket.on('connect', () => {
      console.log('Socket connected')
      setConnected(true)
      newSocket.emit('join', username)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setConnected(false)
    })

    newSocket.on('gameState', (state: { players: Player[]; resources: Resource[]; blocks: Block[] }) => {
      console.log('Received game state:', state)
      if (Array.isArray(state.players)) setPlayers(state.players)
      if (Array.isArray(state.resources)) setResources(state.resources)
      if (Array.isArray(state.blocks)) setBlocks(state.blocks)
    })

    newSocket.on('playerJoined', (player: Player) => {
      console.log('Player joined:', player)
      setPlayers(prev => [...prev, player])
    })

    newSocket.on('playerLeft', (playerId: string) => {
      console.log('Player left:', playerId)
      setPlayers(prev => prev.filter(p => p.id !== playerId))
    })

    newSocket.on('playerMoved', ({ id, position, rotation }: { id: string; position: any; rotation: number }) => {
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, position, rotation } : p))
    })

    newSocket.on('playerUpdatedTool', ({ id, tool }: { id: string; tool: 'build' | 'gather' }) => {
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, tool } : p))
    })

    newSocket.on('resourceCollected', (resourceId: string) => {
      setResources(prev => prev.filter(r => r.id !== resourceId))
    })

    newSocket.on('resourceSpawned', (resource: Resource) => {
      setResources(prev => [...prev, resource])
    })

    newSocket.on('blockPlaced', (block: Block) => {
      setBlocks(prev => [...prev, block])
    })

    newSocket.on('blockDestroyed', (blockId: string) => {
      setBlocks(prev => prev.filter(b => b.id !== blockId))
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [username])

  const updatePosition = useCallback((position: { x: number; y: number; z: number }, rotation: number) => {
    if (socket?.connected) {
      socket.emit('move', position, rotation)
    }
  }, [socket])

  const updateTool = useCallback((tool: 'build' | 'gather') => {
    if (socket?.connected) {
      socket.emit('updateTool', tool)
    }
  }, [socket])

  const collectResource = useCallback((resourceId: string) => {
    if (socket?.connected) {
      socket.emit('collectResource', resourceId)
    }
  }, [socket])

  const placeBlock = useCallback((block: Block) => {
    if (socket?.connected) {
      socket.emit('placeBlock', block)
    }
  }, [socket])

  const destroyBlock = useCallback((blockId: string) => {
    if (socket?.connected) {
      socket.emit('destroyBlock', blockId)
    }
  }, [socket])

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