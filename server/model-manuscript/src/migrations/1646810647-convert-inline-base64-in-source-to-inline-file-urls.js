/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')
const { createFile } = require('@coko/server')
const fs = require('fs-extra')
const path = require('path')
const cheerio = require('cheerio')

// Paths are relative to the generated migrations folder
/* eslint-disable-next-line import/no-unresolved */
const Manuscript = require('../server/model-manuscript/src/manuscript')

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
  // const doc = new DOMParser().parseFromString(source, 'text/html')
  // TODO: fix errors in this logic
  const images = $('img').map((i, elem) => {
    const $elem = $(elem)

    const src = $elem.attr('src')

    const mimeType = src.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0]
    const blob = base64toBlob(src, mimeType)
    const mimeTypeSplit = mimeType.split('/')
    const extFileName = mimeTypeSplit[1]

    const file = new File([blob], `Image${i + 1}.${extFileName}`, {
      type: mimeType,
    })

    return { dataSrc: src, mimeType, file }
  })

  // const images = [...doc.images].map((e, index) => {
  //   const mimeType = e.src.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0]
  //   const blob = base64toBlob(e.src, mimeType)
  //   const mimeTypeSplit = mimeType.split('/')
  //   const extFileName = mimeTypeSplit[1]

  //   const file = new File([blob], `Image${index + 1}.${extFileName}`, {
  //     type: mimeType,
  //   })

  //   return { dataSrc: e.src, mimeType, file }
  // })

  return images || null
}

const uploadImages = (image, client, manuscriptId) => {
  const { file } = image

  const meta = {
    fileType: 'manuscriptImage',
    manuscriptId,
    reviewCommentId: null,
  }

  const data = client.mutate({
    // mutation: createFileMutation,
    variables: {
      file,
      meta,
    },
  })

  return data
}

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const manuscripts = await Manuscript.query(trx)

      logger.info(`Total Manuscripts: ${manuscripts.length}`)

      let convertedManuscripts = 0

      return Promise.all(
        manuscripts.map(async manuscript => {
          const source = manuscript.meta.source
          const images = base64Images(source)

          logger.info(images.length)
          // TDDO: refactor below logic for server
          // let uploadedImages = Promise.all(
          //   map(images, async image => {
          //     const uploadedImage = await uploadImages(
          //       image,
          //       client,
          //       manuscriptData.data.createManuscript.id,
          //     )

          //     return uploadedImage
          //   }),
          // )

          // await uploadedImages.then(results => {
          //   const $ = cheerio.load(source)

          //   $('img').each((i, elem) => {
          //     const $elem = $(elem)

          //     if (images[i].dataSrc === $elem.attr('src')) {
          //       $elem.attr('data-fileid', results[i].data.createFile.id)
          //       $elem.attr('alt', results[i].data.createFile.name)
          //       $elem.attr(
          //         'src',
          //         results[i].data.createFile.storedObjects.find(
          //           storedObject => storedObject.type === 'medium',
          //         ).url,
          //       )
          //     }
          //   })

          //   source = $.html()

          //   const manuscript = {
          //     id: manuscriptData.data.createManuscript.id,
          //     meta: {
          //       source,
          //     },
          //   }

          //   // eslint-disable-next-line
          //   const updatedManuscript = client.mutate({
          //     mutation: updateMutation,
          //     variables: {
          //       id: manuscriptData.data.createManuscript.id,
          //       input: JSON.stringify(manuscript),
          //     },
          //   })

          //   manuscriptData.data.createManuscript.meta.source = source
          // })
          // const filePath = path.join(__dirname, `..${file.url}`)
          // const fileStream = fs.createReadStream(filePath)
          // await createFile(
          //   fileStream,
          //   file.filename,
          //   null,
          //   null,
          //   [file.fileType],
          //   file.reviewCommentId || file.manuscriptId,
          // )
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
