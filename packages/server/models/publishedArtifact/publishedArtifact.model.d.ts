import { BaseModel } from '@coko/server'

declare class PublishedArtifact extends BaseModel {
  manuscriptId: string
  platform: string
  externalId: string | null
  title: string | null
  content: string | null
  hostedInKotahi: boolean | null
  relatedDocumentUri: string | null
  relatedDocumentType: string | null
}

export = PublishedArtifact
