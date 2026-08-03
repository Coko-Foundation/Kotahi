import { BaseModel } from '@coko/server'

type NotificationDigestContext = {
  messageId: string | null
}

declare class NotificationDigest extends BaseModel {
  time: string | Record<string, unknown>
  maxNotificationTime: string | Record<string, unknown>
  pathString: string
  userId: string
  option: string
  actioned: boolean
  context: NotificationDigestContext
  groupId: string
}

export = NotificationDigest
