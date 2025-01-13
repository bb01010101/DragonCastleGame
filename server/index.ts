import { Server as SocketIOServer } from 'socket.io'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Socket as NetSocket } from 'net'
import { v4 as uuidv4 } from 'uuid'

interface SocketServer extends NetSocket {
  server: any;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketServer;
}

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
  players: Map<string, Player>
  resources: Map<string, Resource>
  blocks: Map<string, Block>
}

// Initialize game state
const gameState: GameState = {
  players: new Map(),
  resources: new Map(),
  blocks: new Map()
}

// Initialize some resources
for (let i = 0; i < 20; i++) {
  const id = uuidv4()
  const type = Math.random() > 0.5 ? 'wood' : 'stone'
  const position = {
    x: Math.floor(Math.random() * 100) - 50,
    y: 0,
    z: Math.floor(Math.random() * 100) - 50
  }
  gameState.resources.set(id, { id, type, position })
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    })

    io.on('connection', (socket) => {
      console.log('Player connected:', socket.id)

      // Handle player join
      socket.on('join', (username: string) => {
        if (!username) return

        const player: Player = {
          id: socket.id,
          position: { x: 0, y: 0, z: 0 },
          rotation: 0,
          username,
          tool: 'gather',
          blockType: null
        }
        gameState.players.set(socket.id, player)
        
        // Send current game state to new player
        socket.emit('gameState', {
          players: Array.from(gameState.players.values()),
          resources: Array.from(gameState.resources.values()),
          blocks: Array.from(gameState.blocks.values())
        })
        
        // Notify other players
        socket.broadcast.emit('playerJoined', player)
      })

      // Handle player movement
      socket.on('move', ({ position, rotation }: { position: { x: number; y: number; z: number }; rotation: number }) => {
        const player = gameState.players.get(socket.id)
        if (player) {
          player.position = position
          player.rotation = rotation
          socket.broadcast.emit('playerMoved', player)
        }
      })

      // Handle tool updates
      socket.on('updateTool', ({ tool, blockType }: { tool: 'build' | 'gather'; blockType: 'wood-block' | 'stone-block' | null }) => {
        const player = gameState.players.get(socket.id)
        if (player) {
          player.tool = tool
          player.blockType = blockType
          socket.broadcast.emit('playerUpdatedTool', { playerId: socket.id, tool, blockType })
        }
      })

      // Handle resource collection
      socket.on('collectResource', (resourceId: string) => {
        if (gameState.resources.has(resourceId)) {
          gameState.resources.delete(resourceId)
          io.emit('resourceCollected', resourceId)

          // Spawn a new resource after a delay
          setTimeout(() => {
            const id = uuidv4()
            const type = Math.random() > 0.5 ? 'wood' : 'stone'
            const position = {
              x: Math.floor(Math.random() * 100) - 50,
              y: 0,
              z: Math.floor(Math.random() * 100) - 50
            }
            const newResource = { id, type, position }
            gameState.resources.set(id, newResource)
            io.emit('resourceSpawned', newResource)
          }, 30000) // 30 seconds
        }
      })

      // Handle block placement
      socket.on('placeBlock', (block: { type: string; position: { x: number; y: number; z: number } }) => {
        const id = uuidv4()
        const newBlock = { ...block, id }
        gameState.blocks.set(id, newBlock)
        io.emit('blockPlaced', newBlock)
      })

      // Handle block destruction
      socket.on('destroyBlock', (blockId: string) => {
        if (gameState.blocks.has(blockId)) {
          gameState.blocks.delete(blockId)
          io.emit('blockDestroyed', blockId)
        }
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id)
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
    bodyParser: false
  }
}

export default ioHandler 