import { BaseModel } from '@coko/server'

declare class CoarNotification extends BaseModel {
  payload: Record<string, unknown>
  manuscriptId: string
  groupId: string
  status: boolean
}

export = CoarNotification
