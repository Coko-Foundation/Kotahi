const { fileStorage, createFile } = require('@coko/server')
const cheerio = require('cheerio')
const find = require('lodash/find')
const Blob = require('node-blob')
const atob = require('atob')
const { Duplex } = require('stream')

/* Get files with temporary, time-limited URLs generated */
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

/* Get file with temporary, time-limited URL generated */
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

/* replace source html with regenerated file URLs of provided size */
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
      const { url } = correspondingFile.storedObjects.find(
        storedObject => storedObject.type === size,
      )

      $elem.attr('src', url)

      if (correspondingFile.alt) {
        $elem.attr('alt', correspondingFile.alt)
      }
    }
  })

  return $.html()
}

/* convert base64 to blob data */
const base64toBlob = (base64Data, contentType) => {
  const sliceSize = 1024
  const arr = base64Data.split(',')
  const byteCharacters = atob(arr[1])
  const bytesLength = byteCharacters.length
  const slicesCount = Math.ceil(bytesLength / sliceSize)
  const byteArrays = new Array(slicesCount)

  for (let sliceIndex = 0; sliceIndex < slicesCount; sliceIndex += 1) {
    const begin = sliceIndex * sliceSize
    const end = Math.min(begin + sliceSize, bytesLength)

    const bytes = new Array(end - begin)

    for (let offset = begin, i = 0; offset < end; i += 1, offset += 1) {
      bytes[i] = byteCharacters[offset].charCodeAt(0)
    }

    byteArrays[sliceIndex] = new Uint8Array(bytes)
  }

  return new Blob(byteArrays, { type: contentType || '' })
}

const base64Images = source => {
  const $ = cheerio.load(source)

  const images = []

  $('img').each((i, elem) => {
    const $elem = $(elem)

    const src = $elem.attr('src')
    const base64Match = src.match(/[^:]\w+\/[\w\-+.]+(?=;base64,)/)

    if (base64Match) {
      const mimeType = base64Match[0]
      const blob = base64toBlob(src, mimeType)
      const mimeTypeSplit = mimeType.split('/')
      const extFileName = mimeTypeSplit[1]

      images.push({
        blob,
        dataSrc: src,
        filename: `Image${i + 1}.${extFileName}`,
        index: i,
      })
    }
  })

  return images
}

const uploadImage = async (image, manuscriptId) => {
  const { blob, filename } = image

  const fileStream = bufferToStream(Buffer.from(blob.buffer, 'binary'))

  const createdFile = await createFile(
    fileStream,
    filename,
    null,
    null,
    ['manuscriptImage'],
    manuscriptId,
  )

  return createdFile
}

const bufferToStream = myBuffer => {
  const tmp = new Duplex()
  tmp.push(myBuffer)
  tmp.push(null)
  return tmp
}

module.exports = {
  base64Images,
  getFilesWithUrl,
  getFileWithUrl,
  replaceImageSrc,
  uploadImage,
}
