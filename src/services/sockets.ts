import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import logger from './logger'

interface ISocket extends Socket {
  username: string
}

const useSockets = (server: HttpServer): void => {
  const io = new Server(server)

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
    { userChannelsList, userContactsList }
  ) => {
    const { id } = socket
    const date = formatDate()

    if (Array.isArray(userChannelsList) && userChannelsList.length) {
      userChannelsList.forEach(({ id: channelId }) => {
        socket.join(channelId.toString())
      })

      logger.info(`[${date}] ${id} subscribed to channels`)
    }

    // todo check how to subscribe to user socket by id
    if (Array.isArray(userContactsList) && userContactsList.length) {
      userContactsList.forEach(({ id: contactId }) => {
        socket.join(contactId.toString())
      })

      logger.info(`[${date}] ${id} subscribed to contacts`)
    }
  }

  io.use((socket: ISocket, next) => {
    const { username } = socket.handshake.auth
    if (!username) {
      return next(new Error('invalid username'))
    }

    // eslint-disable-next-line no-param-reassign
    socket.username = username
    next()
  })

  io.on('connection', (socket: ISocket) => {
    const { id } = socket
    const users = []
    const connectedSockets = io.of('/').sockets

    // new socket connected
    logger.info(`[${formatDate()}] ${id} connected`)

    // list of all connected sockets
    connectedSockets.forEach((item) => {
      users.push({
        userId: item.id,
        username: (item as ISocket).username
      })
    })
    socket.emit('users:connected', users)
    // eslint-disable-next-line no-console
    console.log('users:connected', users)

    socket.on('channels:subscribe', (payload) => {
      subscribeToChannels(socket, payload)
    })

    socket.broadcast.emit('user:connected', {
      userID: socket.id,
      username: socket.username
    })

    socket.on('channel:message:add', ({ activeChannelId, message }) => {
      socket.to(activeChannelId).emit('channel:message:broadcast', {
        activeChannelId,
        message
      })
      logger.info(`[${formatDate()}] ${id} writes: ${message.text}`)
    })

    socket.on('channel:leave', (channel) => {
      socket.leave(channel)
      logger.info(`${id} leaved channel: ${channel}`)
    })

    socket.on('disconnect', (reason: string) => {
      const date = formatDate()
      const message = `[${date}] ${id} disconnected: ${reason}`
      logger.info(`[${formatDate()}] ${id} disconnected: ${message}`)
    })
  })
}

export default useSockets
