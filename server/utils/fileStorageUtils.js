const { fileStorage, createFile } = require('@coko/server')
const cheerio = require('cheerio')
const find = require('lodash/find')
const atob = require('atob')
const { Duplex } = require('stream')

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js
// (MIT licensed)
// Also based on https://github.com/modulesio/window-fetch/blob/master/src/blob.js

const TYPE = Symbol('type')
const CLOSED = Symbol('closed')

class Blob {
  constructor() {
    Object.defineProperty(this, Symbol.toStringTag, {
      value: 'Blob',
      writable: false,
      enumerable: false,
      configurable: true,
    })

    this[CLOSED] = false
    this[TYPE] = ''

    /* eslint-disable prefer-rest-params */
    const blobParts = arguments[0]
    const options = arguments[1]

    const buffers = []

    if (blobParts) {
      const a = blobParts
      const length = Number(a.length)

      for (let i = 0; i < length; i += 1) {
        const element = a[i]
        let buffer

        if (element instanceof Buffer) {
          buffer = element
        } else if (ArrayBuffer.isView(element)) {
          buffer = Buffer.from(
            element.buffer,
            element.byteOffset,
            element.byteLength,
          )
        } else if (element instanceof ArrayBuffer) {
          buffer = Buffer.from(element)
        } else if (element instanceof Blob) {
          buffer = element.buffer
        } else {
          buffer = Buffer.from(
            typeof element === 'string' ? element : String(element),
          )
        }

        buffers.push(buffer)
      }
    }

    this.buffer = Buffer.concat(buffers)

    const type =
      options &&
      options.type !== undefined &&
      String(options.type).toLowerCase()

    if (type && !/[^\u0020-\u007E]/.test(type)) {
      this[TYPE] = type
    }
  }

  get size() {
    return this[CLOSED] ? 0 : this.buffer.length
  }

  get type() {
    return this[TYPE]
  }

  get isClosed() {
    return this[CLOSED]
  }

  slice() {
    const { size } = this

    const start = arguments[0]
    const end = arguments[1]
    let relativeStart, relativeEnd

    if (start === undefined) {
      relativeStart = 0
    } else if (start < 0) {
      relativeStart = Math.max(size + start, 0)
    } else {
      relativeStart = Math.min(start, size)
    }

    if (end === undefined) {
      relativeEnd = size
    } else if (end < 0) {
      relativeEnd = Math.max(size + end, 0)
    } else {
      relativeEnd = Math.min(end, size)
    }

    const span = Math.max(relativeEnd - relativeStart, 0)

    const { buffer } = this

    const slicedBuffer = buffer.slice(relativeStart, relativeStart + span)

    const blob = new Blob([], { type: arguments[2] })
    blob.buffer = slicedBuffer
    blob[CLOSED] = this[CLOSED]
    return blob
  }

  close() {
    this[CLOSED] = true
  }
}

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
  value: 'BlobPrototype',
  writable: false,
  enumerable: false,
  configurable: true,
})

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

/** Replace file URLs in source html with regenerated URLs to files of specified size */
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

/** Replace file URLs in source html with regenerated URLs to files of specified size,
 * plus attributes data-low-def, data-standard-def and data-hi-def with URIs of other
 * sized files.
 */
const replaceImageSrcResponsive = async (source, files) => {
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
        storedObject => storedObject.type === 'medium',
      )

      $elem.attr('src', url) // medium sized image url for frontend representation
      $elem.attr(
        'data-low-def',
        correspondingFile.storedObjects.find(
          storedObject => storedObject.type === 'small',
        ).url,
      ) // small sized image url as data-low-def
      $elem.attr('data-standard-def', url) // medium sized image url as data-standard-def
      $elem.attr(
        'data-hi-def',
        correspondingFile.storedObjects.find(
          storedObject => storedObject.type === 'original',
        ).url,
      ) // original image url as data-hi-def

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

    if (base64Match && $elem.attr('alt') !== 'Broken image') {
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

const imageFinder = (source, fileId) => {
  let found = false

  if (source && source.length > 0) {
    const $ = cheerio.load(source)

    $('img').each((i, elem) => {
      const $elem = $(elem)
      const fileIdAttribute = $elem.attr('data-fileid')

      if (fileIdAttribute === fileId) {
        found = true
      }
    })
  }

  return found
}

module.exports = {
  base64Images,
  getFilesWithUrl,
  getFileWithUrl,
  replaceImageSrc,
  replaceImageSrcResponsive,
  uploadImage,
  imageFinder,
  Blob,
}
