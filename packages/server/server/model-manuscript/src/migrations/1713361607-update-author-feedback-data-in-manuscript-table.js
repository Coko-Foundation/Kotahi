/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

const { orderBy } = require('lodash')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Manuscript = require('../server/model-manuscript/src/manuscript')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const User = require('../server/model-user/src/user')

exports.up = async knex => {
  return useTransaction(async trx => {
    const authorFeedbackSubmittedManuscripts = await Manuscript.query(
      trx,
    ).whereRaw(
      "jsonb_extract_path_text(author_feedback::jsonb, 'submitted') IS NOT NULL",
    )

    logger.info(
      `Manuscripts with submitted authorFeedback count: ${authorFeedbackSubmittedManuscripts.length}`,
    )

    if (authorFeedbackSubmittedManuscripts.length > 0) {
      let updatedManuscriptsCount = 0

      await Promise.all(
        authorFeedbackSubmittedManuscripts.map(
          async authorFeedbackSubmittedManuscript => {
            const manuscript = authorFeedbackSubmittedManuscript
            let previousSubmissions = []

            if (manuscript.authorFeedback.previousSubmissions?.length > 0) {
              previousSubmissions = [
                ...manuscript.authorFeedback.previousSubmissions,
              ]
            }

            const submitter = manuscript.authorFeedback.submitterId
              ? await User.query(trx).findById(
                  manuscript.authorFeedback.submitterId,
                )
              : null

            if (manuscript.authorFeedback.submitted) {
              previousSubmissions.push({
                text: manuscript.authorFeedback.text,
                fileIds: manuscript.authorFeedback.fileIds,
                submitterId: manuscript.authorFeedback.submitterId,
                submitter: {
                  id: submitter.id,
                  username: submitter.username,
                },
                edited: manuscript.authorFeedback.edited,
                submitted: manuscript.authorFeedback.submitted,
              })

              delete manuscript.authorFeedback.text
              delete manuscript.authorFeedback.fileIds
              delete manuscript.authorFeedback.submitterId
              delete manuscript.authorFeedback.edited
              delete manuscript.authorFeedback.submitted
            }

            await Manuscript.query().patchAndFetchById(manuscript.id, {
              authorFeedback: {
                ...manuscript.authorFeedback,
                previousSubmissions: orderBy(
                  previousSubmissions,
                  [obj => new Date(obj.submitted)],
                  ['desc'],
                ),
              },
            })

            updatedManuscriptsCount += 1
          },
        ),
      ).then(res => {
        logger.info(`Total updated manuscripts: ${updatedManuscriptsCount}`)
        logger.info(`Updated authorFeedback data prior to structure change.`)
      })
    }
  })
}
