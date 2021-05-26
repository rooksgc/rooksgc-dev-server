import { NextFunction, Request, Response } from 'express'
import { validationService } from 'services/validation'
import {
  ValidationError,
  EmailDoesNotExist,
  UserNotFound,
  ContactAllreadyExist,
  CantAddSelfToContacts,
  ContactNotFound,
  InviteAllreadyExists,
  InviteDoesNotExists,
  InviteWasCancelled
} from 'services/errors'

import { userService, UserDTO } from 'services/user'

const { Channel, Invite, sequelize, Op } = require('database/models')

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
  contactsToDTO: (contacts: any) => any
  contactRequestsToDTO: (cr: any) => any
  invitesToDTO: (invites: any) => any
  addContact: IResponse
  removeContact: IResponse
  populateContacts: IResponse
  inviteToContacts: IResponse
  removeInvite: IResponse
}

const chatService: ChatServiceApi = {
  /** Преобразовать список каналов в транспортный объект  */
  channelsToDTO: (channels: any): any => {
    return channels.map((channel: any) => ({
      id: channel.id,
      ownerId: channel.owner_id,
      name: channel.name,
      members: JSON.parse(channel.members),
      photo: channel.photo
    }))
  },

  /** Преобразовать список контактов в транспортный объект */
  contactsToDTO: (contacts: any): any =>
    contacts.map((contact) => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      photo: contact.photo,
      role: contact.role
    })),

  /** Преобразовать список запросов в контакты в транспортный объект */
  contactRequestsToDTO: (contactRequests: any): any =>
    contactRequests.map((cr) => ({
      id: cr.user_id,
      name: cr.user_name,
      isContactRequest: true,
      text: cr.text
    })),

  /** Преобразовать список приглашений в транспортный объект */
  invitesToDTO: (invites: any): any =>
    invites.map((invite) => ({
      id: invite.inviter_id,
      name: invite.inviter_name,
      isInvite: true,
      text: invite.text
    })),

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

  /** Создать новый канал */
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
          const userChannels = JSON.parse(user.channels)
          userChannels.push(newChannel.id)
          user.channels = JSON.stringify(userChannels)
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
  },

  /** Добавление нового контакта */
  async addContact(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const { inviterId, userId } = req.body
      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError()
      }

      const foundedInvite = await Invite.findOne({
        where: { user_id: userId, inviter_id: inviterId, type: 'contact' }
      })

      if (!foundedInvite) {
        throw new InviteWasCancelled()
      }

      const userToAdd = await userService.findById(inviterId)
      const userForContactAdd = await userService.findById(userId)

      if (!userToAdd || !userForContactAdd) {
        throw new UserNotFound()
      }

      // patch userForContactAdd contacts
      const userContacts = userForContactAdd.contacts
        ? JSON.parse(userForContactAdd.contacts)
        : []

      if (userContacts.includes(userToAdd.id)) {
        throw new ContactAllreadyExist()
      }

      userContacts.push(userToAdd.id)
      userForContactAdd.contacts = JSON.stringify(userContacts)
      await userForContactAdd.save()

      // patch userToAdd contacts
      const userToAddContacts = userToAdd.contacts
        ? JSON.parse(userToAdd.contacts)
        : []

      if (userToAddContacts.includes(userForContactAdd.id)) {
        throw new ContactAllreadyExist()
      }

      userToAddContacts.push(userForContactAdd.id)
      userToAdd.contacts = JSON.stringify(userToAddContacts)
      await userToAdd.save()

      await Invite.destroy({
        where: { user_id: userId, inviter_id: inviterId, type: 'contact' }
      })

      return res.status(201).json({
        type: 'success',
        message: 'Контакт добавлен',
        data: userService.userToDTO(userToAdd)
      })
    } catch (error) {
      next(error)
    }
  },

  /** Удаление контакта */
  async removeContact(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const { userId: userIdParam, contactId: contactIdParam } = req.params
      const userId = parseInt(userIdParam, 10)
      const contactId = parseInt(contactIdParam, 10)

      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError()
      }

      await sequelize.transaction(async () => {
        const user = await userService.findById(userId)
        const contact = await userService.findById(contactId)

        if (!user || !contact) {
          throw new UserNotFound()
        }

        const contacts = user.contacts ? JSON.parse(user.contacts) : []
        if (!contacts.includes(contactId)) {
          throw new ContactNotFound()
        }

        let updatedContacts = contacts.filter(
          (idToRemove: number) => idToRemove !== contactId
        )
        if (!updatedContacts.length) {
          updatedContacts = null
        } else {
          updatedContacts = JSON.stringify(updatedContacts)
        }

        user.contacts = updatedContacts
        await user.save()

        // Удаление того, кто удалял из списка контактов
        // const contactContacts = contact.contacts
        //   ? JSON.parse(contact.contacts)
        //   : []
        // if (!contactContacts.includes(userId)) {
        //   throw new ContactNotFound()
        // }

        // let updatedContactContacts = contactContacts.filter(
        //   (idToRemove: number) => idToRemove !== userId
        // )
        // if (!updatedContactContacts.length) {
        //   updatedContactContacts = null
        // } else {
        //   updatedContactContacts = JSON.stringify(updatedContactContacts)
        // }

        // contact.contacts = updatedContactContacts
        // await contact.save()
      })

      return res.status(200).json({
        type: 'success',
        message: 'Контакт удален'
      })
    } catch (error) {
      next(error)
    }
  },

  /** Развернуть список контактов */
  async populateContacts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const { userId, contacts } = req.body
      const message = validationService.validate(req)
      if (message) {
        throw new ValidationError(message)
      }

      let data = []

      await sequelize.transaction(async () => {
        const contactsList = JSON.parse(contacts)

        const populatedContacts = await userService.findAll({
          where: { id: contactsList }
        })
        const contactsDTO = chatService.contactsToDTO(populatedContacts)

        const invites = await Invite.findAll({
          where: {
            [Op.or]: [
              { inviter_id: userId, type: 'contact' },
              { user_id: userId, type: 'contact' }
            ]
          },
          raw: true
        })

        const contactRequests = invites.filter(
          (item) => item.inviter_id === userId
        )
        const invititions = invites.filter((item) => item.user_id === userId)
        const contactRequestsDTO = chatService.contactRequestsToDTO(
          contactRequests
        )
        const invitationsDTO = chatService.invitesToDTO(invititions)

        data = [...contactsDTO, ...contactRequestsDTO, ...invitationsDTO]
      })

      return res.status(200).json({
        type: 'success',
        message: 'Список контактов получен',
        data
      })
    } catch (error) {
      next(error)
    }
  },

  /** Запрос на добавление в контакты */
  async inviteToContacts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const {
        inviterId,
        inviterName,
        inviterEmail,
        inviterContacts,
        email,
        text
      } = req.body

      const validationMessage = validationService.validate(req)
      if (validationMessage) {
        throw new ValidationError()
      }

      if (inviterEmail === email) {
        throw new CantAddSelfToContacts()
      }

      let userToAdd: UserDTO
      let message: string
      let data: UserDTO

      await sequelize.transaction(async () => {
        const userToAddModel = await userService.findByEmail(email)
        if (!userToAddModel) {
          throw new EmailDoesNotExist()
        }
        userToAdd = userService.userToDTO(userToAddModel)

        const userContacts = inviterContacts ? JSON.parse(inviterContacts) : []
        if (userContacts.includes(userToAdd.id)) {
          throw new ContactAllreadyExist()
        }

        // dd a contact without an invitation
        const userToAddContacts = userToAdd.contacts
          ? JSON.parse(userToAdd.contacts)
          : []

        if (userToAddContacts.includes(inviterId)) {
          const inviterModel = await userService.findById(inviterId)
          if (userContacts.includes(userToAdd.id)) {
            throw new ContactAllreadyExist()
          }

          userContacts.push(userToAdd.id)
          inviterModel.contacts = JSON.stringify(userContacts)
          await inviterModel.save()

          message = 'Контакт добавлен'

          data = userToAdd
          data.contactAdded = true
        } else {
          // new invite
          const foundedInvite = await Invite.findOne({
            where: {
              user_id: userToAdd.id,
              inviter_id: inviterId,
              type: 'contact'
            }
          })

          if (foundedInvite) {
            throw new InviteAllreadyExists()
          }

          userToAdd.photo = null

          await Invite.create({
            inviter_id: inviterId,
            inviter_name: inviterName,
            user_id: userToAdd.id,
            user_name: userToAdd.name,
            type: 'contact',
            text: text || null
          })

          message =
            'Запрос на добавление в контакты отправлен и ждет подтверждения'
          data = userToAdd
        }
      })

      return res.status(201).json({
        type: 'success',
        message,
        data
      })
    } catch (error) {
      next(error)
    }
  },

  /** Удаление инвайта */
  async removeInvite(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ServerResponse>> {
    try {
      const { inviterId: inviterIdParam, userId: userIdParam } = req.params
      const inviterId = parseInt(inviterIdParam, 10)
      const userId = parseInt(userIdParam, 10)

      await sequelize.transaction(async () => {
        const foundedInvite = await Invite.findOne({
          where: { user_id: userId, inviter_id: inviterId, type: 'contact' }
        })

        if (!foundedInvite) {
          throw new InviteDoesNotExists()
        }

        await Invite.destroy({ where: { id: foundedInvite.id } })
      })

      return res.status(200).json({
        type: 'success',
        message: 'Запрос на добавление контакта отменен'
      })
    } catch (error) {
      next(error)
    }
  }
}

export { chatService }
