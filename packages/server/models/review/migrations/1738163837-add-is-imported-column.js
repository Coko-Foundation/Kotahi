const { useTransaction } = require('@coko/server')
const Review = require('../review.model')

exports.up = async knex => {
  return useTransaction(async trx => {
    await trx.schema.alterTable(Review.tableName, table => {
      table.boolean('is_imported').notNullable().defaultTo('false')
    })

    const importedReviews = await Review.query(trx).where({ userId: null })

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
  })
}

exports.down = async knex => {
  return useTransaction(async trx => {
    await trx.schema.alterTable(Review.tableName, table => {
      table.dropColumn('is_imported')
    })
  })
}
