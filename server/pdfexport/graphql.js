// REPLACE THIS!

const FormData = require('form-data')
const axios = require('axios')
const config = require('config')
const css = require('./pdfTemplates/styles')
const makeTemplate = require('./pdfTemplates/template')
const makeZip = require('./ziputils.js')

// THINGS TO KNOW ABOUT THIS:
//
// 0. I've made a fallback version that runs on a remote pagedjs server – that can be used by setting useFakeServer to true.
//    This isn't something that should be kept around forever, it's just for testing purposes.
// 1. It is expecting two .env variables: PAGED_JS_CLIENT_ID and PAGED_JS_CLIENT_SECRET
//    The process for generating these is here: https://gitlab.coko.foundation/cokoapps/pagedjs#creating-clients-credentials

// HOW SERVER-SIDE VERSION SHOULD WORK:
//
// 1) component should tell page to send query to server
// 2) page should send query to server
// 3) server should recognize this
//		// need to register component?
//    // use crossref model (that's called by model-manuscript/graphql.js)
// 4) sever should assemble data and send to pagedjs
// 5) check for credentials for pagedjs, get credentials if we don't have them
// 6) server should get answer from pagedjs
// 7) server should send back answer to page
// 8) page should provide option to download PDF
//		// is this a effect loop?

// editoria version of this code is here: https://gitlab.coko.foundation/editoria/editoria/-/blob/master/server/api/useCases/services.js

const useFakeServer = false

const clientId = useFakeServer
  ? '5291563e-e43b-461b-8681-2cebaee7b550'
  : config['paged-js'].pagedJsClientId

const clientSecret = useFakeServer
  ? 'hHUDVHG9f6SIZJzN'
  : config['paged-js'].pagedJsClientSecret

const serverUrl = useFakeServer
  ? 'https://pagedjstest.cloud68.co'
  : 'http://localhost:3003'

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

const pdfHandler = async (html, metadata) => {
  const articleMetadata = JSON.parse(metadata)

  const outHtml = makeTemplate(html, {
    title: articleMetadata.title || '',
    author: articleMetadata.submission.name || '',
    contact: articleMetadata.submission.contact || '',
    affiliation: articleMetadata.submission.affiliation || '',
    topics: articleMetadata.submission.keywords || '',
    pubDate: articleMetadata.pubDate || new Date(),
  })

  // 2 zip this.

  // TODO: THIS ZIPPING CODE IS MESSED UP!

  const zipBlob = await makeZip(outHtml, css)

  const form = new FormData()
  form.append('zip', zipBlob, 'index.html.zip')
  // form.append('zip', fs.createReadStream(`${zipPath}`))

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
      .then(resObj => {
        // eslint-disable-next-line no-console
        console.log('Retrieved PDF!')
        const newBlob = new Blob([resObj], { type: 'application/pdf' })

        const objUrl = window.URL.createObjectURL(newBlob)

        // use this code to open PDF in new window:

        window.open(objUrl)

        // use this code for downloading the PDF:

        const link = document.createElement('a')
        link.href = objUrl
        link.download = `${articleMetadata.title || 'title'}.pdf`
        link.click()

        // console.log(`Downloading ${link.download}`)

        // For Firefox it is necessary to delay revoking the ObjectURL.

        setTimeout(() => {
          window.URL.revokeObjectURL(objUrl)
        }, 1000)
        resolve()
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
          return pdfHandler(zipPath, outputPath, filename)
        }

        return reject(
          new Error(`Request failed with status ${status} and message: ${msg}`),
        )
      })
  })
}

const resolvers = {
  Query: {
    async convertToPdf(_, { html, metadata }, ctx) {
      const outUrl = await Promise.all([pdfHandler(html, metadata, ctx)])
      return {
        pdfUrl: outUrl || '',
      }
    },
  },
}

const typeDefs = `
  extend type Query {
    convertToPdf(html: String!, metadata: String! ) : ConvertToPdf
  }

  type ConvertToPdf {
		pdfUrl: String!
  }
`

module.exports = { resolvers, typeDefs }
