const fs = require('fs-extra')
const path = require('path')

const {
  useTransaction,
  // logger,
  createFile,
} = require('@coko/server')

// Paths are relative to the generated migrations folder
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const File = require('../models/file/file.model')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const filesOld = await File.query(trx)

      // logger.info(`Total Old files: ${filesOld.length}`)

      // let migratedFiles = 0

      return Promise.all(
        filesOld.map(async file => {
          const filePath = path.join(__dirname, `..${file.url}`)
          const fileStream = fs.createReadStream(filePath)
          await createFile(
            fileStream,
            file.filename,
            null,
            null,
            [file.fileType],
            file.reviewCommentId || file.manuscriptId,
          )
          // migratedFiles += 1
        }),
      )
      // .then(res => {
      //   logger.info(`Total Migrated Files: ${migratedFiles}`)
      // })
    })
  } catch (error) {
    throw new Error(error)
  }
}
