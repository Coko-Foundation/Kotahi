/* eslint-disable import/no-unresolved */
const { useTransaction } = require('@coko/server')

/* eslint-disable no-await-in-loop */
const CollaborativeDoc = require('../models/collaborative-doc/collaborativeDoc.model')

const Review = require('../models/review/review.model')

exports.up = async knex => {
  // At the current time the object Type is always Review,
  // since we dont have any other collabaorative forms.
  return useTransaction(async trx => {
    const docs = await CollaborativeDoc.query(trx).whereNull('objectType')

    return Promise.all(
      docs.map(async doc => {
        const review = await Review.query(trx)
          .findById(doc.objectId)
          .throwIfNotFound()

        if (review) {
          await CollaborativeDoc.query(trx)
            .patch({ objectType: 'Review' })
            .findById(doc.id)
        }
      }),
    )
  })
}
