const fs = require('fs-extra')
const path = require('path')
const crypto = require('crypto')
const fsPromised = require('fs').promises
const FormData = require('form-data')
const axios = require('axios')
const config = require('config')
const { promisify } = require('util')
const models = require('@pubsweet/models')
const { createFile, File } = require('@coko/server')
const { applyTemplate, generateCss } = require('./applyTemplate')
const makeZip = require('./ziputils.js')
const publicationMetadata = require('./pdfTemplates/publicationMetadata')

const {
  getFilesWithUrl,
  getFileWithUrl,
  replaceImageSrc,
} = require('../utils/fileStorageUtils')

const copyFile = promisify(fs.copyFile)

// THINGS TO KNOW ABOUT THIS:
//
// 1. It is expecting two .env variables: PAGED_JS_CLIENT_ID and PAGED_JS_CLIENT_SECRET
//    The process for generating these is here: https://gitlab.coko.foundation/cokoapps/pagedjs#creating-clients-credentials
//
// editoria version of this code is here: https://gitlab.coko.foundation/editoria/editoria/-/blob/master/server/api/useCases/services.js

const randomBytes = promisify(crypto.randomBytes)

const uploadsPath = config.get('pubsweet-server').uploads

const { clientId, clientSecret, port, protocol, host } = config.pagedjs

const serverUrl = `${protocol}://${host}${port ? `:${port}` : ''}`

let pagedJsAccessToken = '' // maybe this should be saved somewhere?

const serviceHandshake = async () => {
  const buff = Buffer.from(`${clientId}:${clientSecret}`, 'utf8')
  const base64data = buff.toString('base64')

  const serviceHealthCheck = await axios({
    method: 'get',
    url: `${serverUrl}/healthcheck`,
  })

  const { data: healthCheckData } = serviceHealthCheck
  const { message } = healthCheckData

  if (message !== 'Coolio') {
    throw new Error(`PagedJS service is down`)
  }

  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: `${serverUrl}/api/auth`,
      headers: { authorization: `Basic ${base64data}` },
    })
      .then(async ({ data }) => {
        resolve(data.accessToken)
      })
      .catch(err => {
        const { response } = err

        if (!response) {
          return reject(new Error(`Request failed with message: ${err.code}`))
        }

        const { status, data } = response
        const { msg } = data

        return reject(
          new Error(`Request failed with status ${status} and message: ${msg}`),
        )
      })
  })
}

const getManuscriptById = async id => {
  return models.Manuscript.query().findById(id).withGraphFetched('[files]')
}

const pdfHandler = async manuscriptId => {
  if (!pagedJsAccessToken) {
    pagedJsAccessToken = await serviceHandshake()
  }

  // get article from Id

  const articleData = await getManuscriptById(manuscriptId)

  const raw = await randomBytes(16)
  const dirName = `tmp/${raw.toString('hex')}_${manuscriptId}`

  await fsPromised.mkdir(dirName, { recursive: true })

  articleData.files = await getFilesWithUrl(articleData.files)
  articleData.meta.source = await replaceImageSrc(
    articleData.meta.source,
    articleData.files,
    'original',
  )

  // TODO: get rid of this if we're doing this in applyTemplate

  // const { svgedSource } = await makeSvgsFromLatex(articleData.meta.source, true)

  // articleData.meta.source = svgedSource

  const outHtml = await applyTemplate(articleData)

  await fsPromised.appendFile(`${dirName}/index.html`, outHtml)

  const css = await generateCss()

  await fsPromised.appendFile(`${dirName}/styles.css`, css)

  // Manually copy the two fonts to the folder that will be zipped. This is a temporary fix!

  publicationMetadata.fonts.forEach(async fontPath => {
    const thisFont = path.join(__dirname, `../../profiles/${fontPath}`)

    const targetFont = `${dirName}/${fontPath}`
    await copyFile(thisFont, targetFont)
  })

  // const targetFont1 = `${dirName}/Newsreader-Italic-VariableFont-opsz-wght.ttf`
  // await copyFile(originalFont1, targetFont1)

  // const originalFont2 = path.join(
  //   __dirname,
  //   '../../profiles/Newsreader-VariableFont-opsz-wght.ttf',
  // )

  // const targetFont2 = `${dirName}/Newsreader-VariableFont-opsz-wght.ttf`
  // await copyFile(originalFont2, targetFont2)

  // 2 zip this.

  const zipPath = await makeZip(dirName)

  // need to get the zip from zipPath and pass to the FormData
  const form = new FormData()
  // form.append('zip', zipPath, 'index.html.zip')
  form.append('zip', fs.createReadStream(`${zipPath}`))
  form.append('onlySourceStylesheet', 'true')
  form.append('imagesForm', 'base64')

  const filename = `${raw.toString('hex')}_${manuscriptId}.pdf`

  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: `${serverUrl}/api/htmlToPDF`,
      headers: {
        authorization: `Bearer ${pagedJsAccessToken}`,
        ...form.getHeaders(),
      },
      responseType: 'stream',
      data: form,
      // timeout: 1000, // adding this because it's failing
    })
      .then(async res => {
        const fileStream = res.data

        const files = await File.query().where({
          objectId: manuscriptId,
        })

        const pdfFileIds = files
          .filter(file => file.tags.includes('printReadyPdf'))
          .map(file => file.id)

        if (pdfFileIds.length > 0) {
          // console.log("I'm going to delete these: ", pdfFileIds)
          // await deleteFiles([pdfFileIds], true)
        }

        const createdFile = await createFile(
          fileStream,
          filename,
          null,
          null,
          ['printReadyPdf'],
          manuscriptId,
        )

        const printReadyPdfFile = await getFileWithUrl(createdFile)
        const { url } = printReadyPdfFile.storedObjects[0]

        await fsPromised.rmdir(dirName, { recursive: true })
        resolve(url)
      })
      .catch(async err => {
        const { response } = err

        if (!response) {
          return reject(
            new Error(`Request failed with message: ${err.code}, ${err}`),
          )
        }

        const { status, data } = response
        const { msg } = data

        if (status === 401 && msg === 'expired token') {
          await serviceHandshake()
          return pdfHandler(manuscriptId)
        }

        return reject(
          new Error(`Request failed with status ${status} and message: ${msg}`),
        )
      })
  })
}

const htmlHandler = async manuscriptId => {
  const articleData = await getManuscriptById(manuscriptId)

  const raw = await randomBytes(16)
  const filename = `${raw.toString('hex')}_${manuscriptId}.html`

  const templatedHtml = await applyTemplate(articleData)

  const css = await generateCss()

  const outHtml = templatedHtml
    .replace('</body>', `<style>${css}</style></body>`)
    .replace(
      '<body>',
      `<body><div class="disclaimer">Please note: this HTML is formatted for the page, not for the screen! Print this to a PDF, where the styling will display correctly (and this message will not be visible).</div>`,
    )

  const tempPath = path.join(uploadsPath, filename)

  await fsPromised.appendFile(`${uploadsPath}/${filename}`, outHtml)

  return `${tempPath}`
}

const resolvers = {
  Query: {
    convertToPdf: async (_, { manuscriptId, useHtml }, ctx) => {
      const outUrl = await (useHtml
        ? htmlHandler(manuscriptId, ctx)
        : pdfHandler(manuscriptId, ctx))

      return { pdfUrl: outUrl || 'busted!' }
    },
    builtCss: async () => {
      const css = await generateCss(true)
      return { css }
    },
  },
}

const typeDefs = `
	extend type Query {
		convertToPdf(manuscriptId: String!, useHtml: Boolean): ConvertToPdfType
		builtCss: BuiltCssType
	}

	type ConvertToPdfType {
		pdfUrl: String!
	}

	type BuiltCssType {
		css: String!
	}
`

module.exports = { resolvers, typeDefs }
