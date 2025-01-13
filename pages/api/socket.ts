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
  if (!res.socket.server.io) {
    console.log('*First socket connection attempt, initializing socket server...')
    try {
      await ioHandler(req, res)
      console.log('Socket server initialized successfully')
    } catch (err) {
      console.error('Failed to initialize socket server:', err)
      res.status(500).json({ error: 'Failed to initialize socket server' })
      return
    }
  } else {
    console.log('Socket server already running, reusing existing instance')
    res.end()
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default handler 