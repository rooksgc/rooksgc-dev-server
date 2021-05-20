import { NextFunction, Request, Response } from 'express'
import { validationService } from 'services/validation'
import {
  ValidationError,
  UserNotFound,
  ErrorChannelCreate
} from 'services/errors'
import { userService } from 'services/user'

const { Channel } = require('database/models')
const { sequelize } = require('database/models')

interface ServerResponse {
  type: string
  message?: string
  data?: any
  token?: string
}

type IResponse = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<Response<ServerResponse>>

export interface ICreateChannelDTO {
  data: any
}

export interface ChatServiceApi {
  createChannel: IResponse
  populateChannels: IResponse
  channelsToDTO: (channels: any) => any
}

const chatService: ChatServiceApi = {
  channelsToDTO: (channels: any): any => {
    return channels.map((channel: any) => ({
      id: channel.id,
      ownerId: channel.owner_id,
      name: channel.name,
      members: JSON.parse(channel.members),
      photo: channel.photo
    }))
  },

  async populateChannels(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const { channels } = req.body

      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError(message)
      }

      const channelsList = JSON.parse(channels)
      const populatedChannels = await Channel.findAll({
        where: { id: channelsList }
      })

      return res.status(201).json({
        type: 'success',
        message: 'Список каналов получен',
        data: chatService.channelsToDTO(populatedChannels)
      })
    } catch (error) {
      next(error)
    }
  },

  async createChannel(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const { name, description, photo, ownerId } = req.body

      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError(message)
      }

      let channelId: number

      await sequelize.transaction(async () => {
        const user = await userService.findById(ownerId)
        if (!user) {
          throw new UserNotFound()
        }

        const members = JSON.stringify([ownerId])
        const newChannel = await Channel.create({
          name,
          description,
          photo,
          members,
          owner_id: ownerId
        })

        if (!user.channels) {
          user.channels = JSON.stringify([newChannel.id])
        } else {
          try {
            const userChannels = JSON.parse(user.channels)
            userChannels.push(newChannel.id)
            user.channels = JSON.stringify(userChannels)
          } catch (error) {
            throw new ErrorChannelCreate()
          }
        }

        channelId = newChannel.id
        await user.save()
      })

      return res.status(201).json({
        type: 'success',
        message: `Канал ${name} создан`,
        data: { channelId }
      })
    } catch (error) {
      next(error)
    }
  }
}

export { chatService }
