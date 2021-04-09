import { Server } from 'socket.io'
import logger from './logger'

const makeDate = () => {
  const date = new Date(Date.now())
  const hour = date.getHours()
  const min = date.getMinutes()
  const sec = date.getSeconds()
  const ms = date.getMilliseconds()
  return `${hour}:${min}:${sec}:${ms}`
}

const useSockets = (io: Server): void => {
  const subscribeToChannels = (socket, channelsList) => {
    const { id } = socket
    const date = makeDate()

    if (!Array.isArray(channelsList) && !channelsList.length) return
    channelsList.forEach((channel) => {
      socket.join(channel.toString())
    })

    logger.info(`[${date}] ${id} subscribed to channels`)
  }

  io.on('connection', (socket) => {
    const { id } = socket
    logger.info(`[${makeDate()}] ${id} connected`)
    socket.emit('channels:subscription:request')

    socket.on('channels:subscribe', (channelsList) => {
      subscribeToChannels(socket, channelsList)
    })

    socket.on('channel:message:add', ({ activeChannelId, message }) => {
      socket.to(activeChannelId).emit('channel:message:broadcast', {
        activeChannelId,
        message
      })
      logger.info(`[${makeDate()}] ${id} writes: ${message.text}`)
    })

    socket.on('channel:leave', (channel) => {
      socket.leave(channel)
      logger.info(`${id} leaved channel: ${channel}`)
    })

    socket.on('disconnect', (reason: string) => {
      // if transport error or like that... send info to client
      socket.emit('disconnection:request')

      const date = makeDate()
      const message = `[${date}] ${id} disconnected: ${reason}`
      // eslint-disable-next-line no-console
      logger.info(`[${makeDate()}] ${id} disconnected: ${message}`)
    })
  })
}

export default useSockets
