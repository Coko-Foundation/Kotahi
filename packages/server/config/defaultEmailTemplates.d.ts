export type DefaultEmailTemplate = {
  emailTemplateKey: string
  description: string
  subject: string
  ccEditors: boolean
  body: string
  type?: string
  cc?: string
}

declare const defaultEmailTemplates: DefaultEmailTemplate[]

export default defaultEmailTemplates
