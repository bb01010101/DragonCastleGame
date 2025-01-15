import { Server as SocketIOServer } from 'socket.io'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Socket as NetSocket } from 'net'
import ioHandler from '../../server'

interface SocketServer extends NetSocket {
  server: any
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketServer
}

if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode')
}

const handler = async (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (!res.socket.server.io) {
    console.log('*First socket connection attempt, initializing socket server...')
    try {
      const io = new SocketIOServer(res.socket.server, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
          credentials: true
        },
        transports: ['websocket'],
        pingTimeout: 60000,
        pingInterval: 25000
      })

      // Initialize game state and event handlers
      await ioHandler(req, res)
      
      res.socket.server.io = io
      console.log('Socket server initialized successfully')
    } catch (err) {
      console.error('Failed to initialize socket server:', err)
      res.status(500).json({ error: 'Failed to initialize socket server' })
      return
    }
  } else {
    console.log('Socket server already running, reusing existing instance')
  }

  res.end()
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default handler 