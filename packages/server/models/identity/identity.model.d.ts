import { BaseModel } from '@coko/server'

type Oauth = {
  accessToken: string
  refreshToken: string
}

declare class Identity extends BaseModel {
  type: string
  isDefault: boolean | null
  aff: string | null
  name: string | null
  identifier: string | null
  userId: string
  oauth: Oauth
}

export = Identity
