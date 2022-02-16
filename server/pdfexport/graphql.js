const fs = require('fs-extra')
const path = require('path')
const crypto = require('crypto')
const fsPromised = require('fs').promises
const FormData = require('form-data')
const axios = require('axios')
const config = require('config')
const { promisify } = require('util')
const models = require('@pubsweet/models')
const applyTemplate = require('./applyTemplate')
const css = require('./pdfTemplates/styles')
const makeZip = require('./ziputils.js')

// THINGS TO KNOW ABOUT THIS:
//
// 1. It is expecting two .env variables: PAGED_JS_CLIENT_ID and PAGED_JS_CLIENT_SECRET
//    The process for generating these is here: https://gitlab.coko.foundation/cokoapps/pagedjs#creating-clients-credentials
//
// editoria version of this code is here: https://gitlab.coko.foundation/editoria/editoria/-/blob/master/server/api/useCases/services.js

const randomBytes = promisify(crypto.randomBytes)

const uploadsPath = config.get('pubsweet-server').uploads

const clientId = config['paged-js'].pagedJsClientId

const clientSecret = config['paged-js'].pagedJsClientSecret

const serverUrl = 'http://pagedjs:3003'

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

const writeLocallyFromReadStream = async (
  thepath,
  filename,
  readerStream,
  encoding,
) =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise(async (resolve, reject) => {
    await fs.ensureDir(thepath)

    const writerStream = fs.createWriteStream(
      `${thepath}/${filename}`,
      encoding,
    )

    writerStream.on('close', () => {
      resolve()
    })
    writerStream.on('error', err => {
      reject(err)
    })
    readerStream.pipe(writerStream)
  })

const getManuscriptById = async id => {
  return models.Manuscript.query().findById(id)
}

const pdfHandler = async manuscriptId => {
  if (!pagedJsAccessToken) {
    // console.log('No pagedJS access token')
    pagedJsAccessToken = await serviceHandshake()
  }

  // get article from Id

  const articleData = await getManuscriptById(manuscriptId)

  const raw = await randomBytes(16)
  const dirName = `${raw.toString('hex')}_${manuscriptId}`
  // console.log("Directory name: ", dirName)

  await fsPromised.mkdir(dirName)

  const outHtml = applyTemplate(articleData)

  await fsPromised.appendFile(`${dirName}/index.html`, outHtml)
  await fsPromised.appendFile(`${dirName}/styles.css`, css)

  // 2 zip this.

  const zipPath = await makeZip(dirName)

  // need to get the zip from zipPath and pass to the FormData

  const form = new FormData()
  // form.append('zip', zipPath, 'index.html.zip')
  form.append('zip', fs.createReadStream(`${zipPath}`))
  form.append('onlySourceStylesheet', true)
  form.append('imagesForm', 'base64')

  const filename = `${raw.toString('hex')}_${manuscriptId}.pdf`
  const tempPath = path.join(uploadsPath, filename)

  // console.log(tempPath)

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
        // console.log('got response')
        await writeLocallyFromReadStream(
          uploadsPath,
          filename,
          res.data,
          'binary',
        )
        // console.log('came back')
        resolve(tempPath)
      })
      .catch(async err => {
        const { response } = err

        if (!response) {
          return reject(new Error(`Request failed with message: ${err.code}`))
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
  // console.log(`Making HTML for ${manuscriptId}`)
  const articleData = await getManuscriptById(manuscriptId)

  const raw = await randomBytes(16)
  const filename = `${raw.toString('hex')}_${manuscriptId}.html`
  // console.log("Directory name: ", dirName)

  const templatedHtml = applyTemplate(articleData)

  const outHtml = templatedHtml
    .replace('</body>', `<style>${css}</style></body>`)
    .replace(
      '<body>',
      `<body><div class="disclaimer">Please note: this HTML is formatted for the page, not for the screen! Print this to a PDF, where the styling will display correctly (and this message will not be visible).</div>`,
    )

  const tempPath = path.join(uploadsPath, filename)

  await fsPromised.appendFile(`${uploadsPath}/${filename}`, outHtml)

  // console.log(`HTML written to ${tempPath}`)
  return `/${tempPath}`
}

const resolvers = {
  Query: {
    convertToPdf: async (_, { manuscriptId, useHtml }, ctx) => {
      const outUrl = await (useHtml
        ? htmlHandler(manuscriptId, ctx)
        : pdfHandler(manuscriptId, ctx))

      // console.log('pdfUrl', outUrl)
      return { pdfUrl: outUrl || 'busted!' }
    },
  },
}

// TODO: Need a mutation to delete generated PDF after it's been created.

const typeDefs = `
	extend type Query {
		convertToPdf(manuscriptId: String!, useHtml: Boolean): ConvertToPdfType
	}

	type ConvertToPdfType {
		pdfUrl: String!
	}

`

module.exports = { resolvers, typeDefs }
