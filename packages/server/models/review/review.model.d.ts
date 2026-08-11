import { BaseModel } from '@coko/server'

declare class Review extends BaseModel {
  manuscriptId: string
  userId: string | null
  user: Record<string, unknown> | null
  isDecision: boolean
  isHiddenFromAuthor: boolean
  isHiddenReviewerName: boolean
  isCollaborative: boolean
  isImported: boolean
  isLock: boolean
  canBePublishedPublicly: boolean
  jsonData: any
}

export = Review
