import { BaseModel } from '@coko/server'

declare class Docmap extends BaseModel {
  manuscriptId: string
  groupId: string
  externalId: string
  content: string
}

export = Docmap
