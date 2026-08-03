import { BaseModel } from '@coko/server'

declare class TaskEmailNotificationLog extends BaseModel {
  taskId: string
  senderEmail: string
  recipientEmail: string
  emailTemplateKey: string
  emailTemplateId: string | null
  content: string
}

export = TaskEmailNotificationLog
