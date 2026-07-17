import { BaseModel } from '@coko/server'

declare class Notification extends BaseModel {
  event: string
  notificationType: 'email'
  groupId: string
  active: boolean
  subject: string | null
  emailTemplateId: string | null
  ccEmails: string[]
  isDefault: boolean
  displayName: string
  recipient: string
  delay: number
}

export = Notification
