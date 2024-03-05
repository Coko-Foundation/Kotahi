const axios = require('axios')
const config = require('config')

const { port, protocol, host } = config['flax-site']

const serverUrl = `${protocol}://${host}${port ? `:${port}` : ''}`

const { clientId, clientSecret } = config['flax-site']

const currentApiUrl = config['flax-site'].clientAPIURL

const buff = Buffer.from(`${clientId}:${clientSecret}`, 'utf8')
const base64data = buff.toString('base64')

const rebuildCMSSite = async (groupId, params) => {
  const requestData = JSON.stringify({
    updatedConfig: {
      url: `${currentApiUrl}/graphql`,
    },
    buildConfigs: params,
    groupId,
  })

  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: `${serverUrl}/rebuild`,
      headers: {
        authorization: `Basic ${base64data}`,
        'Content-Type': 'application/json',
      },
      data: requestData,
    })
      .then(async res => {
        const flaxResult = res.data
        resolve(flaxResult)
      })
      .catch(async err => {
        const { response } = err

        if (!response) {
          return reject(
            new Error(
              `Flax Site request failed while  rebuilding: ${err.code}, ${err}`,
            ),
          )
        }

        const { status, data } = response
        const { msg } = data

        return reject(
          new Error(
            `Flax Site request failed while rebuilding with status ${status} and message: ${msg}`,
          ),
        )
      })
  })
}

const healthCheck = async () => {
  const url = `${serverUrl}/healthcheck`

  try {
    const serviceHealthCheck = await axios({
      method: 'get',
      url,
      headers: {
        authorization: `Basic ${base64data}`,
      },
    })

    return {
      data: serviceHealthCheck.data,
    }
  } catch (err) {
    return {
      err,
    }
  }
}

module.exports = { healthCheck, rebuildCMSSite }
