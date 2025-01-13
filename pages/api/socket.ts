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

const handler = async (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (req.method === 'GET') {
    try {
      await ioHandler(req, res)
    } catch (err) {
      console.error('Socket error:', err)
      res.status(500).json({ error: 'Failed to setup socket connection' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default handler 