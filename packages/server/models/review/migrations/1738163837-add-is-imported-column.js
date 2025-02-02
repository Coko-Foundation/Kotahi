const { useTransaction } = require('@coko/server')
const Review = require('../review.model')

exports.up = async knex => {
  return useTransaction(async trx => {
    const hasIsImportedColumn = await knex.schema.hasColumn(
      Review.tableName,
      'is_imported',
    )

    if (!hasIsImportedColumn) {
      await trx.schema.alterTable(Review.tableName, table => {
        table.boolean('is_imported').notNullable().defaultTo('false')
      })

      const importedReviews = await Review.query(trx)
        .leftJoin('teams', 'teams.object_id', 'reviews.manuscript_id')
        .where({ userId: null, role: null })

      // mark reviews as imports.
      // if no reviews were found, do not attempt to patch empty rows
      if (importedReviews.length > 0) {
        await Review.query(trx)
          .whereIn(
            'id',
            importedReviews.map(r => r.id),
          )
          .patch({ isImported: true })
      }
    }
  })
}

exports.down = async knex => {
  return useTransaction(async trx => {
    await trx.schema.alterTable(Review.tableName, table => {
      table.dropColumn('is_imported')
    })
  })
}
