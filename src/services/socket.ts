import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { loggerService as logger } from 'services/logger'

interface ISocket extends Socket {
  userId: number
}

const webSocketService = (server: HttpServer): void => {
  const io = new Server(server)

  // Namespaces
  const chat = io.of('/chat')

  chat.use((socket: ISocket, next) => {
    const { userId } = socket.handshake.auth
    if (!userId) {
      return next(new Error('invalid userId'))
    }
    // eslint-disable-next-line no-param-reassign
    socket.userId = userId
    next()
  })

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

  const updateConnectedUsers = (socket) => {
    if (!users.has(socket.userId)) {
      users.set(socket.userId, new Set([socket.id]))
    } else {
      const newSet = users.get(socket.userId).add(socket.id)
      users.set(socket.userId, newSet)
    }
  }

  chat.on('connection', (socket: ISocket) => {
    const { id } = socket

    updateConnectedUsers(socket)

    socket.on('channels:subscribe', (channels: string[]) => {
      if (Array.isArray(channels) && channels.length) {
        channels.forEach((channelId: string) => {
          socket.join(String(channelId))
        })
      }
    })

    // Подписка на канал
    socket.on('channel:subscribe', (channelId: number) => {
      socket.join(String(channelId))
    })

    // Покидание канала пользователем
    socket.on('channel:leave', (payload) => {
      const { channelId, userId } = payload
      if (users.has(userId)) {
        const userSockets = users.get(userId)

        if (userSockets.size > 0) {
          userSockets.forEach((socketId: string) => {
            const socketSession = chat.sockets.get(socketId)
            socketSession.leave(String(channelId))
          })
        }
      }

      const channel = String(channelId)
      socket.to(channel).emit('channel:member:leave', payload)
    })

    // Invite user to channel
    socket.on('channel:invite', ({ userId, channelId }) => {
      if (users.has(userId)) {
        const userSockets = users.get(userId)

        if (userSockets.size > 0) {
          userSockets.forEach((socketId: string) => {
            const socketSession = chat.sockets.get(socketId)
            socketSession.join(String(channelId))
          })
        }
      }
    })

    // Invite contact
    socket.on('contact:invite:request', ({ to: userId, contact }) => {
      if (users.has(userId)) {
        const userSockets = users.get(userId)

        if (userSockets.size > 0) {
          userSockets.forEach((socketId: string) => {
            socket.to(socketId).emit('contact:invite', contact)
          })
        }
      }
    })

    // Add contact
    socket.on('contact:add:request', ({ to: userId, contact }) => {
      if (users.has(userId)) {
        const userSockets = users.get(userId)

        if (userSockets.size > 0) {
          userSockets.forEach((socketId: string) => {
            socket.to(socketId).emit('contact:add', contact)
          })
        }
      }
    })

    // Remove contact invite
    socket.on('invite:remove:request', ({ to: userId, contact }) => {
      if (users.has(userId)) {
        const userSockets = users.get(userId)

        if (userSockets.size > 0) {
          userSockets.forEach((socketId: string) => {
            socket.to(socketId).emit('invite:remove', contact)
          })
        }
      }
    })

    // Cancel contact invite
    socket.on('invite:cancel:request', ({ to: userId, contact }) => {
      if (users.has(userId)) {
        const userSockets = users.get(userId)

        if (userSockets.size > 0) {
          userSockets.forEach((socketId: string) => {
            socket.to(socketId).emit('invite:cancel', contact)
          })
        }
      }
    })

    // Add user to channel
    socket.on(
      'channel:adduser:request',
      ({ to: userId, inviterName, channel }) => {
        if (users.has(userId)) {
          const userSockets = users.get(userId)

          if (userSockets.size > 0) {
            userSockets.forEach((socketId: string) => {
              socket
                .to(socketId)
                .emit('channel:adduser', { inviterName, channel })
            })
          }
        }
      }
    )

    socket.broadcast.emit('user:connected', {
      socketId: socket.id,
      userId: socket.userId
    })

    socket.on('channel:message:send', ({ activeChannelId, message }) => {
      const channelId = String(activeChannelId)
      socket.to(channelId).emit('channel:message:broadcast', {
        activeChannelId: channelId,
        message
      })
    })

    // Private message
    socket.on('contact:message:send', ({ from, to, message }) => {
      const userSockets = users.get(to)

      if (!userSockets) {
        logger.error(
          `[${formatDate()}] Error: no socketId found for userId ${to} in users Map`
        )
        return
      }

      userSockets.forEach((socketId: string) => {
        socket.to(socketId).emit('contact:message:private', {
          from,
          message
        })
      })
    })

    socket.on('disconnect', () => {
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
    })
  })
}

export { webSocketService }
