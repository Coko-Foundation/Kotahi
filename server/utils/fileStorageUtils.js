const { fileStorage } = require('@coko/server')
const cheerio = require('cheerio')
const find = require('lodash/find')

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

const replaceImageSrc = async (source, files, size) => {
  const $ = cheerio.load(source)
  const fileIds = []

  $('img').each((i, elem) => {
    const $elem = $(elem)
    const fileId = $elem.attr('data-fileid')
    if (fileId && fileId !== 'null') {
      fileIds.push(fileId)
    }
  })

  $('img').each((i, elem) => {
    const $elem = $(elem)
    const fileId = $elem.attr('data-fileid')

    const correspondingFile = find(files, { id: fileId })

    if (correspondingFile) {
      const url = correspondingFile.storedObjects.find(
        storedObject => storedObject.type === size,
      ).url

      $elem.attr('src', url)
      if (correspondingFile.alt) {
        $elem.attr('alt', correspondingFile.alt)
      }
    } else {
      $elem.attr('src', '')
      $elem.attr('alt', '')
    }
  })

  return $.html()
}

module.exports = {
  getFilesWithUrl,
  getFileWithUrl,
  replaceImageSrc,
}
