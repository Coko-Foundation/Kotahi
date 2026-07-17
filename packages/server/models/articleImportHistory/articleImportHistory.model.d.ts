import { BaseModel } from '@coko/server'

declare class ArticleImportHistory extends BaseModel {
  date: string | Record<string, unknown> | null
  sourceId: string | null
  groupId: string | null
}

export = ArticleImportHistory
