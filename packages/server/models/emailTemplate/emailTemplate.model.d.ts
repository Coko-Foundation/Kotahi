import { BaseModel } from '@coko/server'

type EmailContent = {
  cc: string | null
  subject: string
  body: string
  description: string
  ccEditors: boolean
}

declare class EmailTemplate extends BaseModel {
  emailContent: EmailContent
  emailTemplateType: string | null
  emailTemplateKey: string
  groupId: string | null
}

export = EmailTemplate
