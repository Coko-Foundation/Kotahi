import { BaseModel } from '@coko/server'

declare class BlacklistEmail extends BaseModel {
  date: string | Record<string, unknown> | null
  email: string
  groupId: string | null
}

export = BlacklistEmail
