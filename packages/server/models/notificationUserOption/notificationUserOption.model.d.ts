import { BaseModel } from '@coko/server'

declare class NotificationUserOption extends BaseModel {
  userId: string
  objectId: string | null
  path: string[]
  option: string
  groupId: string
}

export = NotificationUserOption
