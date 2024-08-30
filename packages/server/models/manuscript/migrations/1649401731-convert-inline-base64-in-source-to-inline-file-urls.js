const cheerio = require('cheerio')
const { map } = require('lodash')
const atob = require('atob')
const { Duplex } = require('stream')

const { useTransaction, logger, createFile } = require('@coko/server')

const {
  Blob,
  getFilesWithUrl,
} = require('../../../server/utils/fileStorageUtils')

const Manuscript = require('../manuscript.model')

const bufferToStream = myBuffer => {
  const tmp = new Duplex()
  tmp.push(myBuffer)
  tmp.push(null)
  return tmp
}

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

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const manuscripts = await Manuscript.query(trx)

      logger.info(`Total Manuscripts: ${manuscripts.length}`)

      let convertedManuscripts = 0

      return Promise.all(
        manuscripts.map(async manuscript => {
          const { source } = manuscript.meta

          if (typeof source === 'string') {
            const images = base64Images(source)

            if (images.length > 0) {
              const uploadedImages = []

              await Promise.all(
                map(images, async image => {
                  if (image.blob) {
                    const uploadedImage = await uploadImage(
                      image,
                      manuscript.id,
                    )

                    uploadedImages.push(uploadedImage)
                  }
                }),
              )

              const uploadedImagesWithUrl = await getFilesWithUrl(
                uploadedImages,
              )

              const $ = cheerio.load(source)

              map(images, (image, index) => {
                const elem = $('img').get(image.index)
                const $elem = $(elem)
                $elem.attr('data-fileid', uploadedImagesWithUrl[index].id)
                $elem.attr('alt', uploadedImagesWithUrl[index].name)
                $elem.attr(
                  'src',
                  uploadedImagesWithUrl[index].storedObjects.find(
                    storedObject => storedObject.type === 'medium',
                  ).url,
                )
              })

              manuscript.meta.source = $.html()

              /* eslint no-param-reassign: "error" */
              await Manuscript.query().updateAndFetchById(
                manuscript.id,
                manuscript,
              )
            }
          }

          convertedManuscripts += 1
        }),
      ).then(res => {
        logger.info(`Total Converted Manuscripts: ${convertedManuscripts}`)
      })
    })
  } catch (error) {
    throw new Error(error)
  }
}
