const fs = require('fs-extra')
const FormData = require('form-data')
const axios = require('axios')

// this code comes from here: https://gitlab.coko.foundation/editoria/editoria/-/blob/master/server/api/useCases/services.js

// TODO: this should probably go in config or .env

const clientId = '5291563e-e43b-461b-8681-2cebaee7b550'
const clientSecret = 'hHUDVHG9f6SIZJzN'

const protocol = 'http'
const host = 'localhost'
const port = '3003'
const serverUrl = `${protocol}://${host}${port ? `:${port}` : ''}`

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
        const { accessToken } = data
        console.log(accessToken)
        // NOTE: I'm saving this to local storage right now, but this should probably go in the database?
        localStorage.setItem('pagedJsAccessToken', accessToken)
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

const pdfHandler = async (zipPath, outputPath, filename) => {
  // TODO: need to zip the HTML + CSS before it gets here.
  // TODO: check for access token, if not, get it from serviceHandshake

  const accessToken = localStorage.getItem('pagedJsAccessToken') // this will be null if no access tooken

  const form = new FormData()
  form.append('zip', fs.createReadStream(`${zipPath}`))

  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: `${serverUrl}/api/htmlToPDF`,
      headers: {
        authorization: `Bearer ${accessToken}`,
        ...form.getHeaders(),
      },
      responseType: 'stream',
      data: form,
    })
      .then(async res => {
        console.log(res.data)
        // TODO: save PDF locally, send it back.
        // await writeLocallyFromReadStream(
        //   outputPath,
        //   filename,
        //   res.data,
        //   'binary',
        // )
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

module.exports = { pdfHandler }
