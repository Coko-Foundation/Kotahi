import { type Db } from '@coko/server'

export async function up(db: Db): Promise<void> {
  const hasMenuPinnedColumn = await db.schema.hasColumn('users', 'menu_pinned')

  if (hasMenuPinnedColumn) {
    await db.schema.table('users', table => {
      table.dropColumn('menu_pinned')
    })
  }
}

export async function down(db: Db): Promise<void> {
  const hasMenuPinnedColumn = await db.schema.hasColumn('users', 'menu_pinned')

  if (!hasMenuPinnedColumn) {
    await db.schema.table('users', table => {
      table.boolean('menu_pinned').notNullable().defaultTo(true)
    })
  }
}
