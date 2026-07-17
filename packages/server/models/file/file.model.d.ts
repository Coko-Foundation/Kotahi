import { BaseModel } from '@coko/server'

declare class OldFile extends BaseModel {
  label: string | null
  url: string
  mimeType: string | null
  fileType: string
  filename: string
  size: number
  reviewCommentId: string | null
  manuscriptId: string
}

export = OldFile
