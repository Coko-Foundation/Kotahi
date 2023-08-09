/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')
const { chunk } = require('lodash')

/* eslint-disable-next-line import/no-unresolved */
const Docmap = require('../server/model-docmap/src/docmap')
/* eslint-disable-next-line import/no-unresolved */
const Group = require('../server/model-group/src/group')

exports.up = async knex => {
  return useTransaction(async trx => {
    const docmaps = await Docmap.query(trx)
    const groups = await Group.query(trx)

    logger.info(`Existing Docmaps count: ${docmaps.length}`)
    logger.info(`Existing Groups count: ${groups.length}`)

    // Existing instances migrating to multi-tenancy groups
    if (groups.length >= 1 && docmaps.length >= 1 && !docmaps[0].group_id) {
      logger.info('Initiated patch for docmaps table in chunks of 10')

      // eslint-disable-next-line no-restricted-syntax
      for (const someDocmaps of chunk(docmaps, 10)) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(
          someDocmaps.map(async docmap => {
            let { content } = docmap

            content = content.replace(
              '/versions/',
              `/${groups[0].name}/versions/`,
            )

            /* eslint no-param-reassign: "error" */
            await Docmap.query(trx).patchAndFetchById(docmap.id, {
              content,
              groupId: groups[0].id,
            })
          }),
        ).then(res => {
          logger.info('groupId and Content patched successfully for chunk')
        })
      }

      logger.info('Completed patch for docmaps table')
    }
  })
}
