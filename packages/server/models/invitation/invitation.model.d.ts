import { BaseModel } from '@coko/server'

type SuggestedReviewer = {
  firstName: string | null
  lastName: string | null
  email: string | null
  affiliation: string | null
}

declare class Invitation extends BaseModel {
  date: string | Record<string, unknown> | null
  manuscriptId: string | null
  purpose: string
  toEmail: string
  status: string
  senderId: string | null
  invitedPersonType: string
  invitedPersonName: string
  responseDate: string | Record<string, unknown> | null
  responseComment: string | null
  declinedReason: string | null
  suggestedReviewers: SuggestedReviewer[]
  userId: string | null
  isShared: boolean
}

export = Invitation
