import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

interface Player {
  id: string
  position: { x: number; y: number; z: number }
  rotation: number
  username: string
  tool: 'build' | 'gather'
  blockType: 'wood-block' | 'stone-block' | null
}

interface GameState {
  players: Map<string, Player>
  resources: Map<string, { type: string; position: { x: number; y: number; z: number } }>
  blocks: Map<string, { type: string; position: { x: number; y: number; z: number } }>
}

const app = express()
app.use(cors())
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

const gameState: GameState = {
  players: new Map(),
  resources: new Map(),
  blocks: new Map()
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id)

  // Handle player join
  socket.on('join', (username: string) => {
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
  socket.on('updatePosition', (data: { position: { x: number; y: number; z: number }, rotation: number }) => {
    const player = gameState.players.get(socket.id)
    if (player) {
      player.position = data.position
      player.rotation = data.rotation
      socket.broadcast.emit('playerMoved', { id: socket.id, ...data })
    }
  })

  // Handle tool/block selection
  socket.on('updateTool', (data: { tool: 'build' | 'gather', blockType: 'wood-block' | 'stone-block' | null }) => {
    const player = gameState.players.get(socket.id)
    if (player) {
      player.tool = data.tool
      player.blockType = data.blockType
      socket.broadcast.emit('playerUpdatedTool', { id: socket.id, ...data })
    }
  })

  // Handle resource collection
  socket.on('collectResource', (data: { position: { x: number; y: number; z: number }, type: string }) => {
    const resourceKey = `${data.position.x},${data.position.y},${data.position.z}`
    gameState.resources.delete(resourceKey)
    io.emit('resourceCollected', data)
  })

  // Handle block placement
  socket.on('placeBlock', (data: { position: { x: number; y: number; z: number }, type: string }) => {
    const blockKey = `${data.position.x},${data.position.y},${data.position.z}`
    gameState.blocks.set(blockKey, data)
    socket.broadcast.emit('blockPlaced', data)
  })

  // Handle block destruction
  socket.on('destroyBlock', (data: { position: { x: number; y: number; z: number } }) => {
    const blockKey = `${data.position.x},${data.position.y},${data.position.z}`
    gameState.blocks.delete(blockKey)
    socket.broadcast.emit('blockDestroyed', data)
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id)
    gameState.players.delete(socket.id)
    io.emit('playerLeft', socket.id)
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 