const { fileStorage } = require('@coko/server')

const getFilesWithUrl = async files => {
  const filesWithUrl = await Promise.all(
    files.map(async file => {
      /* eslint-disable-next-line no-param-reassign */
      file.storedObjects = await Promise.all(
        file.storedObjects.map(async storedObject => {
          const url = await fileStorage.getURL(storedObject.key)
          return { ...storedObject, url }
        }),
      )
      return file
    }),
  )

  return filesWithUrl
}

const getFileWithUrl = async file => {
  /* eslint-disable-next-line no-param-reassign */
  file.storedObjects = await Promise.all(
    file.storedObjects.map(async storedObject => {
      const url = await fileStorage.getURL(storedObject.key)
      return { ...storedObject, url }
    }),
  )
  return file
}

module.exports = {
  getFilesWithUrl,
  getFileWithUrl,
}
