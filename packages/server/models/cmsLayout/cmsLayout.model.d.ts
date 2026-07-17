import { BaseModel } from '@coko/server'

type StoredPartner = {
  id: string
  url: string
  sequenceIndex: number | null
}

declare class CMSLayout extends BaseModel {
  active: boolean
  isPrivate: boolean
  hexCode: string | null
  primaryColor: string
  secondaryColor: string
  logoId: string | null
  partners: StoredPartner[]
  footerText: string | null
  published: string | Record<string, unknown> | null
  edited: string | Record<string, unknown> | null
  groupId: string
}

export = CMSLayout
