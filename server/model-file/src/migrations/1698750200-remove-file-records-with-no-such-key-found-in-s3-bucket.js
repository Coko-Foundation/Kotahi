const { fileStorage, File, logger, useTransaction } = require('@coko/server')

const {
  connectToFileStorage,
} = require('@coko/server/src/services/fileStorage')

exports.up = async knex => {
  return useTransaction(async trx => {
    await connectToFileStorage()
    const files = await File.query(trx)

    logger.info(`Total file records in table: ${files.length}`)

    const s3FileObjects = await fileStorage.list()

    const s3FilteredFileObjectKeys = s3FileObjects.Contents.map(
      content => content.Key,
    )

    const filesWithNoSuchKeyFound = files.filter(file => {
      const { key } = file.storedObjects.find(
        async storedObject => storedObject.type === 'original',
      )

      if (!s3FilteredFileObjectKeys.includes(key)) {
        return true
      }

      return false
    })

    logger.info(
      `Number of file records to be removed: ${filesWithNoSuchKeyFound.length}`,
    )

    const affectedRows = await Promise.all(
      filesWithNoSuchKeyFound.map(async f => File.query(trx).deleteById(f.id)),
    )

    logger.info(`Number of removed file records: ${affectedRows.length}`)
  })
}
