// REPLACE THIS!

const fs = require('fs-extra')
const fsPromised = require('fs').promises
const FormData = require('form-data')
const axios = require('axios')
const config = require('config')
const nunjucks = require('nunjucks')
const css = require('./pdfTemplates/styles')
const makeZip = require('./ziputils.js')

// THINGS TO KNOW ABOUT THIS:
//
// 1. It is expecting two .env variables: PAGED_JS_CLIENT_ID and PAGED_JS_CLIENT_SECRET
//    The process for generating these is here: https://gitlab.coko.foundation/cokoapps/pagedjs#creating-clients-credentials
//
// editoria version of this code is here: https://gitlab.coko.foundation/editoria/editoria/-/blob/master/server/api/useCases/services.js

const clientId = config['paged-js'].pagedJsClientId

const clientSecret = config['paged-js'].pagedJsClientSecret

const serverUrl = 'http://localhost:3003'

let pagedJsAccessToken = '' // maybe this should be saved somewhere?

nunjucks.configure('pdfTemplates')

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
  // assuming that article is coming in as a string because we don't know what the shape will be
  // may need to do to
  const articleData = JSON.parse(article)
  articleData.publicationMetadata = {
    copyright: { name: '', description: '', year: 'xxxx' },
    publisher: 'elife',
    publisherLogo: '', // this should be base64
    copyrightLogo: '', // this should be base64
    openAccessLogo: '', // this should be base64
  } // TODO: decide what else goes into this (based on Julien's model), pull this in from the instance

  const dirName = `${+new Date()}-${articleData.id}`

  await fsPromised.mkdir(dirName)

  const outHtml = nunjucks.render('article.njk', { article: articleData })

  await fsPromised.appendFile(`${dirName}/index.html`, outHtml)
  await fsPromised.appendFile(`${dirName}/styles.css`, css)

  // 2 zip this.

  const zipPath = await makeZip(dirName)

  // need to get the zip from zipPath and pass to the FormData

  const form = new FormData()
  // form.append('zip', zipPath, 'index.html.zip')
  form.append('zip', fs.createReadStream(`${zipPath}`))

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
      .then(async res => res.data)
      .then(async resObj => {
        // eslint-disable-next-line no-console
        console.log('Retrieved PDF!')
        // Now, return this as a path.
        const pdfPath = `${dirName}/${articleData.id}.pdf`
        await fsPromised.mkdir(dirName)
        await fsPromised.appendFile(pdfPath, resObj)

        // return pdfPath

        resolve(pdfPath)
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
    async convertToPdf(_, { article }, ctx) {
      console.log('in convertToPdf!')
      const outUrl = await Promise.all([pdfHandler(article, ctx)])
      return {
        pdfUrl: outUrl || '',
      }
    },
  },
}

const typeDefs = `
  extend type Query {
    convertToPdf(article: String! ) : ConvertToPdf
  }

  type ConvertToPdf {
		pdfUrl: String!
  }
`

module.exports = { resolvers, typeDefs }
