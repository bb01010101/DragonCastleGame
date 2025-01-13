import { Server as SocketIOServer } from 'socket.io'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Socket as NetSocket } from 'net'
import { v4 as uuidv4 } from 'uuid'
import { MAX_RESOURCES, RESOURCE_RESPAWN_TIME, SPAWN_POSITION, GRID_SIZE } from '../constants'

interface SocketServer extends NetSocket {
  server: any
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketServer
}

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

interface GameState {
  players: Map<string, Player>
  resources: Map<string, Resource>
  blocks: Map<string, Block>
}

const gameState: GameState = {
  players: new Map(),
  resources: new Map(),
  blocks: new Map()
}

// Initialize resources
for (let i = 0; i < MAX_RESOURCES; i++) {
  const id = uuidv4()
  const type = Math.random() < 0.5 ? 'tree' : 'rock'
  const position = {
    x: Math.floor(Math.random() * GRID_SIZE) - GRID_SIZE / 2,
    y: 0,
    z: Math.floor(Math.random() * GRID_SIZE) - GRID_SIZE / 2
  }
  gameState.resources.set(id, { id, type, position })
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...')
    
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      transports: ['websocket'],
      pingTimeout: 60000,
      pingInterval: 25000
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('join', (username: string) => {
        const player: Player = {
          id: socket.id,
          username,
          position: { ...SPAWN_POSITION },
          rotation: 0,
          tool: 'gather'
        }
        gameState.players.set(socket.id, player)

        // Send current game state to new player
        const state = {
          players: Array.from(gameState.players.values()).filter(p => p.id !== socket.id),
          resources: Array.from(gameState.resources.values()),
          blocks: Array.from(gameState.blocks.values())
        }
        socket.emit('gameState', state)

        // Notify others of new player
        socket.broadcast.emit('playerJoined', player)
      })

      socket.on('move', (position: { x: number; y: number; z: number }, rotation: number) => {
        const player = gameState.players.get(socket.id)
        if (player) {
          player.position = position
          player.rotation = rotation
          socket.broadcast.emit('playerMoved', { id: socket.id, position, rotation })
        }
      })

      socket.on('updateTool', (tool: 'build' | 'gather') => {
        const player = gameState.players.get(socket.id)
        if (player) {
          player.tool = tool
          socket.broadcast.emit('playerUpdatedTool', { id: socket.id, tool })
        }
      })

      socket.on('collectResource', (resourceId: string) => {
        const resource = gameState.resources.get(resourceId)
        if (resource) {
          gameState.resources.delete(resourceId)
          io.emit('resourceCollected', resourceId)

          // Spawn new resource after delay
          setTimeout(() => {
            const newId = uuidv4()
            const newResource: Resource = {
              id: newId,
              type: Math.random() < 0.5 ? 'tree' : 'rock',
              position: {
                x: Math.floor(Math.random() * GRID_SIZE) - GRID_SIZE / 2,
                y: 0,
                z: Math.floor(Math.random() * GRID_SIZE) - GRID_SIZE / 2
              }
            }
            gameState.resources.set(newId, newResource)
            io.emit('resourceSpawned', newResource)
          }, RESOURCE_RESPAWN_TIME)
        }
      })

      socket.on('placeBlock', (block: Block) => {
        const id = uuidv4()
        const newBlock = { ...block, id }
        gameState.blocks.set(id, newBlock)
        io.emit('blockPlaced', newBlock)
      })

      socket.on('destroyBlock', (blockId: string) => {
        if (gameState.blocks.has(blockId)) {
          gameState.blocks.delete(blockId)
          io.emit('blockDestroyed', blockId)
        }
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
        gameState.players.delete(socket.id)
        io.emit('playerLeft', socket.id)
      })
    })

    res.socket.server.io = io
  }

  res.end()
}

export const config = {
  api: {
    bodyParser: false,
  }
}

export default ioHandler 