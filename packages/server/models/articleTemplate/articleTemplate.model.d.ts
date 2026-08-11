import { BaseModel } from '@coko/server'

declare class ArticleTemplate extends BaseModel {
  name: string | null
  article: string | null
  css: string | null
  groupId: string | null
  isCms: boolean
}

export = ArticleTemplate
