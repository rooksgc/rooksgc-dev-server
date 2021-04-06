import { Server } from 'socket.io'
import logger from './logger'

const useSockets = (io: Server): void => {
  io.on('connection', (socket) => {
    const { id } = socket
    // eslint-disable-next-line no-console
    console.log(`Client ${id} connected`)

    socket.on('channels:subscribe', (channelsList) => {
      if (!Array.isArray(channelsList) && !channelsList.length) return

      channelsList.forEach((channel) => {
        socket.join(channel.toString())
      })
    })

    socket.on('channel:message:add', ({ activeChannelId, message }) => {
      socket.to(activeChannelId).emit('channel:message:broadcast', {
        activeChannelId,
        message
      })
    })

    socket.on('channel:leave', (channel) => {
      socket.leave(channel)
      // eslint-disable-next-line no-console
      console.log(`Client ${id} leaved channel: ${channel}`)
    })

    socket.on('disconnect', (reason: string) => {
      logger.error(`[${socket.id}] disconnected. Reason:  ${reason}`)
      // if (socket.io.connecting.indexOf(socket) === -1) {
      //   socket.connect()
      // }
      // eslint-disable-next-line no-console
      console.log('Client desconnected!')
    })
  })
}

export default useSockets
