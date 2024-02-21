/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const ArticleImportHistory = require('../server/model-article-import-history/src/articleImportHistory')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Group = require('../server/model-group/src/group')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const articleImportHistory = await ArticleImportHistory.query(trx)
      const groups = await Group.query(trx)

      logger.info(
        `Existing ArticleImportHistory count: ${articleImportHistory.length}`,
      )
      logger.info(`Existing Groups count: ${groups.length}`)

      // Existing instances migrating to multi-tenancy groups
      if (
        groups.length >= 1 &&
        articleImportHistory.length >= 1 &&
        !articleImportHistory[0].group_id
      ) {
        /* eslint no-param-reassign: "error" */
        await ArticleImportHistory.query(trx)
          .patch({ groupId: groups[0].id })
          .where('groupId', null)

        logger.info(
          'groupId patched successfully in article import history table',
        )
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
