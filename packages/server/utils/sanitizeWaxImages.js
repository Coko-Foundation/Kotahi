const crypto = require('crypto')
const cheerio = require('cheerio')

const { createFile } = require('@coko/server')

const sanitizeWaxImages = async (content, manuscriptId) => {
  if (!content) return content

  if (typeof content !== 'string') {
    throw new Error('Wax image sanitizer: Content needs to be an HTML string!')
  }

  const $ = cheerio.load(content)
  const images = []

  $('img').each((i, elem) => {
    if ($(elem).attr('alt') === 'Broken image') return

    images.push({
      element: $(elem),
      src: $(elem).attr('src'),
      fileId: $(elem).attr('data-fileid'),
    })
  })

  await Promise.all(
    images.map(async image => {
      const { fileId, src, element } = image

      const base64Match = src.match(/[^:]\w+\/[\w\-+.]+(?=;base64,)/)
      const isBase64 = !!base64Match

      if (!isBase64 && !fileId) {
        throw new Error(
          'Wax image sanitizer: No file id on an image that is not base 64!',
        )
      }

      if (isBase64) {
        const raw = await crypto.randomBytes(16)
        const extension = base64Match[0].split('/')[1]
        const filename = `${raw.toString('hex')}.${extension}`

        const createdFile = await createFile(
          src,
          filename,
          null,
          null,
          ['manuscriptImage'],
          manuscriptId,
        )

        element.attr('data-fileid', createdFile.id)
      }

      element.removeAttr('src')
    }),
  )

  return $.html()
}

module.exports = sanitizeWaxImages
