import { BaseModel } from '@coko/server'

declare class ThreadedDiscussion extends BaseModel {
  manuscriptId: string
  threads: any
}

export = ThreadedDiscussion
