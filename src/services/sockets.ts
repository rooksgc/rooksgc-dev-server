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

    socket.on('channels:subscribe', (channelsList) => {
      const date = makeDate()
      logger.info(`[${date}] ${id} channelsList.length: ${channelsList.length}`)
      if (!Array.isArray(channelsList) && !channelsList.length) return
      channelsList.forEach((channel) => {
        socket.join(channel.toString())
      })
      logger.info(`[${date}] ${id} subscribed to channels`)
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
      // eslint-disable-next-line no-console
      console.log(`${id} leaved channel: ${channel}`)
      logger.info(`${id} leaved channel: ${channel}`)
    })

    socket.on('reconnecting', () => {
      // eslint-disable-next-line no-console
      logger.info(`[${makeDate()}] ${id} reconnecting`)
    })

    socket.on('reconnect_error', (error) => {
      // eslint-disable-next-line no-console
      console.log(`[${makeDate()}] ${id} reconnection`, error)
      logger.info(`[${makeDate()}] ${id} reconnection error ${error.message}`)
    })

    socket.on('reconnect_failed', () => {
      // eslint-disable-next-line no-console
      console.log(`[${makeDate()}] ${id} reconnection failed`)
      logger.info(`[${makeDate()}] ${id} reconnection failed`)
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
