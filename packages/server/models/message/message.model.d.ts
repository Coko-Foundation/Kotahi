import { BaseModel } from '@coko/server'

declare class Message extends BaseModel {
  channelId: string
  content: string
  userId: string

  static createMessage(args: {
    content: string
    channelId: string
    userId: string
  }): Promise<Message>
}

export = Message
