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
    // logger.error(`[${makeDate()}] ${id} connected`)

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
      console.log(`${id} leaved channel: ${channel}`)
    })

    socket.on('disconnect', (reason: string) => {
      logger.error(
        `[${makeDate()}] [${socket.id}] disconnected. Reason:  ${reason}`
      )
      // eslint-disable-next-line no-console
      console.log(`${id} desconnected!`)
    })
  })
}

export default useSockets
