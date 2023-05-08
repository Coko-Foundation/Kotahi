const fs = require('fs-extra')
const fsPromised = require('fs').promises
const fetch = require('node-fetch')
const axios = require('axios')
const FormData = require('form-data')
const crypto = require('crypto')
const { promisify } = require('util')
const config = require('config')

// To test:
// POST http://localhost:3004/healthCheck
// POST http://localhost:3004/api/auth with clientId/clientSecret in Basic Auth – returns access token
// POST http://localhost:3004/api/v1/sync/DOCXToHTML with access token in Bearer Auth and docx in body – returns HTML

const randomBytes = promisify(crypto.randomBytes)

const { clientId, clientSecret, port, protocol, host } = config.xsweet

const serverUrl = `${protocol}://${host}${port ? `:${port}` : ''}`

let xsweetAccessToken = '' // maybe this should be saved somewhere?

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
    throw new Error(`XSweet service is down`)
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

const getXsweet = async url => {
  // check to see if we have an access token. If not, wait for one.

  if (!xsweetAccessToken) {
    xsweetAccessToken = await serviceHandshake()
  }

  const raw = await randomBytes(16)
  const dirName = `tmp/${raw.toString('hex')}`

  await fsPromised.mkdir(dirName, { recursive: true })

  const docxPath = `${dirName}/file.docx`

  // download the file. This could maybe be done with Coko Server?

  const fetchResponse = await fetch(url)
  const buffer = await fetchResponse.buffer()
  await fsPromised.appendFile(docxPath, buffer)

  // await fsPromised.appendFile(docxPath, url)

  // 1 pass docx to xsweet
  const form = new FormData()
  form.append('docx', fs.createReadStream(`${docxPath}`))
  // eslint-disable-next-line
  // console.log('DOCX path: ', docxPath)
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: `${serverUrl}/api/v1/sync/DOCXToHTML`,
      // NOTE THAT THERE ARE OTHER WAYS TO DO THIS!
      // See https://gitlab.coko.foundation/cokoapps/xsweet/-/blob/master/server/api/api.js
      // – that's different from what's in the README, which is wrong.
      headers: {
        authorization: `Bearer ${xsweetAccessToken}`,
        ...form.getHeaders(),
      },
      data: form,
    })
      .then(async res => {
        // should get: {html, msg}
        // eslint-disable-next-line
        // console.log('Result from XSweet:', res.data)
        const htmledResult = res.data.html
        resolve(htmledResult)
      })
      .catch(async err => {
        const { response } = err

        if (!response) {
          return reject(
            new Error(
              `XSweet request failed with message: ${err.code}, ${err}`,
            ),
          )
        }

        const { status, data } = response
        const { msg } = data

        if (status === 401 && msg === 'expired token') {
          await serviceHandshake()
          return getXsweet(url)
        }

        return reject(
          new Error(
            `XSweet request failed with status ${status} and message: ${msg}`,
          ),
        )
      })
  })
}

const resolvers = {
  Query: {
    docxToHtml: async (_, { url }, ctx) => {
      let outHtml = ''
      let error = ''

      try {
        outHtml = await getXsweet(url)
      } catch (e) {
        error = e
      }

      return {
        html: outHtml || '',
        error: error ? JSON.stringify(error) : '',
      }
    },
  },
}

const typeDefs = `
	extend type Query {
		docxToHtml(url: String!): docxToHtmlType
	}

	type docxToHtmlType {
		html: String!
		error: String
	}
`

module.exports = { resolvers, typeDefs }
