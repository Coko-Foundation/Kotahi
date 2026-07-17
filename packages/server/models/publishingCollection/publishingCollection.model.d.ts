import { BaseModel } from '@coko/server'

type PublishingCollectionFormData = {
  title: string
  description: string
  publicationDate: string
  image: string | null
  issueNumber: string
}

declare class PublishingCollection extends BaseModel {
  manuscripts: string[]
  active: boolean | null
  formData: PublishingCollectionFormData
  groupId: string
}

export = PublishingCollection
