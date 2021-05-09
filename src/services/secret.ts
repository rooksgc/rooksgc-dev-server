import { v4 as uuidv4 } from 'uuid'

const { Secret } = require('database/models')

export enum SecretTypes {
  EMAIL_CONFIRMATION = 'EMAIL_CONFIRMATION',
  RECOVER_PASSWORD = 'RECOVER_PASSWORD'
}

export interface SecretDTO {
  id: number
  user_id: string
  public_code: string
  secret_type: string
}

export interface SecretServiceApi {
  create: (user_id: string, type: SecretTypes) => Promise<SecretDTO>
  findByPublicCode: (
    public_code: string,
    secret_type: SecretTypes
  ) => Promise<SecretDTO>
  deleteById: (id: number) => Promise<void>
}

const SecretService: SecretServiceApi = {
  async create(user_id: string, type: SecretTypes): Promise<SecretDTO> {
    const public_code = uuidv4()

    return await Secret.create({
      user_id,
      public_code,
      secret_type: type
    })
  },

  async findByPublicCode(
    public_code: string,
    secret_type: SecretTypes
  ): Promise<SecretDTO> {
    return await Secret.findOne({
      where: { public_code, secret_type }
    })
  },

  async deleteById(id: number): Promise<void> {
    await Secret.destroy({ where: { id } })
  }
}

export default SecretService
