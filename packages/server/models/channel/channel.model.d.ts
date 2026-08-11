import { BaseModel } from '@coko/server'

declare class Channel extends BaseModel {
  topic: string
  teamId: string | null
  manuscriptId: string | null
  groupId: string | null
}

export = Channel
