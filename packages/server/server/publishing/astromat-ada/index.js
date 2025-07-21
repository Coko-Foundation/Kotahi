const axios = require('axios')
const { logger } = require('@coko/server')
const htmlToJats = require('../../jatsexport/htmlToJats')

const {
  getContributor,
  getLicenses,
  getFundingReferences,
} = require('./fieldsTransformers')

const getAdaURL = useSandbox => {
  return useSandbox
    ? 'https://archive-uat.astromat.org'
    : 'https://archive.astromat.org'
}

const requestToAda = (method, path, payload) => {
  const url = getAdaURL(true)

  const Authorization = `Api-Key ${process.env.ADA_KEY}`

  const options = {
    method,
    url: `${url}/${path}`,
    headers: {
      accept: 'application/json',
      Authorization,
    },
  }

  if (payload) {
    options.data = payload
  }

  return axios.request(options)
}

const getPayload = async ({ submission }, doiStatus) => {
  const {
    adaProcessStatus,
    contributors,
    $abstract,
    $authors,
    generalType,
    specificType,
    $title: title,
  } = submission

  let processStatus = doiStatus === 'findable' ? 'Processing' : adaProcessStatus

  if (doiStatus === 'publish') {
    processStatus = 'Published'
  }

  const payload = {
    submissionType: 'Regular',
    creators: $authors?.map(getContributor) ?? [],
    contributors: contributors?.map(getContributor) ?? [],
    title,
    description: $abstract ? htmlToJats($abstract) : null,
    funding: getFundingReferences(submission),
    licenses: getLicenses(submission),
    fundingDescription: submission.fundingDescription || null,
    generalType,
    specificType,
    publicationDate: new Date().toISOString(),
  }

  if (processStatus !== submission.adaProcessStatus) {
    payload.processStatus = processStatus
  }

  if (doiStatus !== submission.adaState) {
    payload.doiStatus = doiStatus
  }

  return { payload }
}

const publishToAda = async (manuscript, adaState = 'draft') => {
  const {
    submission: { $doi = null },
  } = manuscript

  const method = $doi ? 'PATCH' : 'POST'

  if (adaState === 'publish') {
    const result = await requestToAda(method, `api/record/${$doi}`)

    if (result.data.status !== 'Calibration and Validation') {
      throw new Error(
        `Cannot publish to Astromat ADA. The submission is not in Calibration and Validation status. Current status is ${result.data.status}`,
      )
    }
  }

  const { payload } = await getPayload(manuscript, adaState)

  logger.info(JSON.stringify(payload))

  return requestToAda(method, `api/record/${$doi || ''}`, payload)
}

module.exports = {
  publishToAda,
}
