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
  io.on('connection', (socket) => {
    const { id } = socket
    // eslint-disable-next-line no-console
    console.log(`[${makeDate()}] ${id} connected`)
    logger.info(`[${makeDate()}] ${id} connected`)
    socket.emit('server:connected', {
      id,
      message: `${id} connecned to server`
    })

    socket.on('channels:subscribe', (channelsList) => {
      logger.info(`channelsList.length: ${channelsList.length}`)
      if (!Array.isArray(channelsList) && !channelsList.length) return
      channelsList.forEach((channel) => {
        socket.join(channel.toString())
      })
      logger.info(`[${makeDate()}] ${id} subscribed to channels`)
    })

    socket.on('channel:message:add', ({ activeChannelId, message }) => {
      socket.to(activeChannelId).emit('channel:message:broadcast', {
        activeChannelId,
        message
      })
      logger.info(`[${makeDate()}] ${id} writes: ${message}`)
    })

    socket.on('channel:leave', (channel) => {
      socket.leave(channel)
      // eslint-disable-next-line no-console
      console.log(`${id} leaved channel: ${channel}`)
      logger.info(`${id} leaved channel: ${channel}`)
    })

    socket.on('disconnect', (reason: string) => {
      const date = makeDate()
      const message = `[${date}] ${id} disconnected: ${reason}`
      // eslint-disable-next-line no-console
      console.log(message)
    })
  })
}

export default useSockets
