import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import logger from './logger'

interface ISocket extends Socket {
  userId: number
}

const useSockets = (server: HttpServer): void => {
  const io = new Server(server)
  /** Map userId: Set(socketId`s), example: 12: Set('81mx9384hj', 'd82y297d') */
  const users = new Map()

  const formatDate = () => {
    const date = new Date(Date.now())
    const hour = date.getHours()
    const min = date.getMinutes()
    const sec = date.getSeconds()
    const ms = date.getMilliseconds()

    return `${hour}:${min}:${sec}:${ms}`
  }

  const subscribeToChannels = (
    socket,
    { userChannelsList } // userContactsList
  ) => {
    const { id } = socket
    const date = formatDate()
    if (Array.isArray(userChannelsList) && userChannelsList.length) {
      userChannelsList.forEach(({ id: channelId }) => {
        socket.join(channelId)
      })
      logger.info(`[${date}] ${id} subscribed to channels`)
    }
  }

  const updateConnectedUsers = (socket) => {
    // io.of('/').sockets.forEach((sock: ISocket) => {
    //   if (!users.has(sock.userId)) {
    //     users.set(sock.userId, new Set(sock.id))
    //   }
    // })

    if (!users.has(socket.userId)) {
      users.set(socket.userId, new Set([socket.id]))
    } else {
      const newSet = users.get(socket.userId).add(socket.id)
      users.set(socket.userId, newSet)
    }
  }

  io.use((socket: ISocket, next) => {
    const { userId } = socket.handshake.auth
    if (!userId) {
      return next(new Error('invalid userId'))
    }
    // eslint-disable-next-line no-param-reassign
    socket.userId = userId
    next()
  })

  io.on('connection', (socket: ISocket) => {
    const { id } = socket
    logger.info(`[${formatDate()}] ${id} connected`)

    updateConnectedUsers(socket)
    socket.emit('users:connected', users)
    // console.log(`new user connected: ${id} (${socket.userId}`, users)

    socket.on('channels:subscribe', (payload) => {
      subscribeToChannels(socket, payload)
    })

    socket.broadcast.emit('user:connected', {
      socketId: socket.id,
      userId: socket.userId
    })

    socket.on('channel:message:send', ({ activeChannelId, message }) => {
      socket.to(activeChannelId).emit('channel:message:broadcast', {
        activeChannelId,
        message
      })
      // logger.info(`[${formatDate()}] ${id} writes: ${message.text}`)
    })

    // Private message
    socket.on('contact:message:send', ({ from, to, message }) => {
      const userSockets = users.get(to)

      if (!userSockets) {
        logger.info(
          `[${formatDate()}] Error: no socketId found for userId ${to} in users array`
        )
        return
      }

      userSockets.forEach((socketId: string) => {
        socket.to(socketId).emit('contact:message:private', {
          from,
          message
        })
      })

      // logger.info(
      //   `[${formatDate()}] ${from} to ${to} writes PM: ${message.text}`
      // )
    })

    socket.on('disconnect', () => {
      // reason: string
      const { userId } = socket

      if (users.has(userId)) {
        const currentSet = users.get(userId)
        if (currentSet.size > 1) {
          currentSet.delete(id)
          users.set(userId, currentSet)
        } else {
          users.delete(userId)
        }
      }

      // const date = formatDate()
      // const message = `[${date}] ${id} disconnected: ${reason}`
      // logger.info(`[${formatDate()}] ${id} disconnected: ${message}`)
      // console.log(`user disconnected: ${id} (${userId}`, users)
    })
  })
}

export default useSockets
