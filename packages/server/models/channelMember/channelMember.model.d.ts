import { BaseModel } from '@coko/server'

declare class ChannelMember extends BaseModel {
  userId: string
  channelId: string
  lastViewed: string | Record<string, unknown> | null
  lastAlertTriggeredTime: string | Record<string, unknown> | null
}

export = ChannelMember
