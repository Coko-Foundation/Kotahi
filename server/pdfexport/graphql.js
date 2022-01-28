// REPLACE THIS!

const fs = require('fs-extra')
const crypto = require('crypto')
const fsPromised = require('fs').promises
const FormData = require('form-data')
const axios = require('axios')
const config = require('config')
const nunjucks = require('nunjucks')
const { promisify } = require('util')
const css = require('./pdfTemplates/styles')
const makeZip = require('./ziputils.js')
const template = require('./pdfTemplates/article')
const publicationMetadata = require('./pdfTemplates/publicationMetadata')

// THINGS TO KNOW ABOUT THIS:
//
// 1. It is expecting two .env variables: PAGED_JS_CLIENT_ID and PAGED_JS_CLIENT_SECRET
//    The process for generating these is here: https://gitlab.coko.foundation/cokoapps/pagedjs#creating-clients-credentials
//
// editoria version of this code is here: https://gitlab.coko.foundation/editoria/editoria/-/blob/master/server/api/useCases/services.js

const randomBytes = promisify(crypto.randomBytes)

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
        pagedJsAccessToken = data.accessToken
        resolve()
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

const pdfHandler = async article => {
  if (!pagedJsAccessToken) {
    // console.log('No pagedJS access token')
    await serviceHandshake()
    return pdfHandler(article)
  }

  // assuming that article is coming in as a string because we don't know what the shape will be
  // may need to do to
  const articleData = JSON.parse(article)
  articleData.publicationMetadata = publicationMetadata
  const dirName = `${+new Date()}-${articleData.id}`

  await fsPromised.mkdir(dirName)

  const outHtml = nunjucks.renderString(template, { article: articleData })

  await fsPromised.appendFile(`${dirName}/index.html`, outHtml)
  await fsPromised.appendFile(`${dirName}/styles.css`, css)

  // 2 zip this.

  const zipPath = await makeZip(dirName)

  // need to get the zip from zipPath and pass to the FormData

  const form = new FormData()
  // form.append('zip', zipPath, 'index.html.zip')
  form.append('zip', fs.createReadStream(`${zipPath}`))

  const raw = await randomBytes(16)
  const tempPath = `${dirName}/${raw.toString('hex')}_${articleData.id}.pdf`

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
    })
      .then(response => {
        const writer = fs.createWriteStream(tempPath)
        return new Promise((resolve, reject) => {
          response.data.pipe(writer)
          let error = null
          writer.on('error', err => {
            error = err
            writer.close()
            reject(err)
          })
          writer.on('close', () => {
            if (!error) {
              console.log('here!')
              resolve(true)
            }
          })
        })
      })
      .then(async () => {
        // now the file is where it should be
        // TODO: move it to a public path
        console.log(tempPath)

        // TODO: This doesn't actually work!
        // send it back as base64
        // const pdfPath = await fsPromised.readFile(tempPath, {
        //   encoding: 'base64',
        // })

        // console.log(pdfPath, typeof pdfPath)

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
          return pdfHandler(article)
        }

        return reject(
          new Error(`Request failed with status ${status} and message: ${msg}`),
        )
      })
  })
}

const resolvers = {
  Query: {
    convertToPdf: async (_, { article }, ctx) => {
      const outUrl = await Promise.all([pdfHandler(article, ctx)])
      return { pdfUrl: outUrl || 'busted!' }
    },
  },
}

const typeDefs = `
	extend type Query {
		convertToPdf(article: String!): ConvertToPdfType
	}

	type ConvertToPdfType {
		pdfUrl: String!
	}

`

module.exports = { resolvers, typeDefs }
