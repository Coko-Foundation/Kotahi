const superagent = require('superagent')
const _ = require('lodash')
const { logger } = require('@coko/server')
const { Identity } = require('@pubsweet/models')
const config = require('config')

const apiRoot =
  config['auth-orcid'].useSandboxedOrcid &&
  config['auth-orcid'].useSandboxedOrcid.toLowerCase() === 'true'
    ? 'https://pub.sandbox.orcid.org/v3.0'
    : 'https://pub.orcid.org/v3.0'

// request data from orcid API
const request = (identity, endpoint) =>
  superagent
    .get(`${apiRoot}/${identity.identifier}/${endpoint}`)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${identity.oauth.accessToken}`)

// convert API date object into Date
const toDate = date => {
  if (date === null) return new Date()

  const year = date.year.value
  const month = parseInt((date.month && date.month.value) || '1', 10) - 1
  const day = (date.day && date.day.value) || 1
  return new Date(year, month, day)
}

module.exports = async user => {
  const identity = await Identity.query().findOne({
    userId: user.id,
    type: 'orcid',
  })

  logger.debug('processing response from orcid api')

  const [personResponse, employmentsResponse] = await Promise.all([
    request(identity, 'person'),
    request(identity, 'employments'),
  ])

  const firstName = _.get(personResponse, 'body.name.given-names.value')
  const lastName = _.get(personResponse, 'body.name.family-name.value')
  const email = _.get(personResponse, 'body.emails.email[0].email')

  const employments = _.get(employmentsResponse, 'body.employment-summary')

  const institution =
    employments && employments.length
      ? // sort by most recently ended
        employments
          .sort((a, b) => toDate(a['end-date']) - toDate(b['end-date']))
          .pop().organization.name
      : null

  logger.debug(`fetchUserDetails returning:
    first: ${firstName},
    last: ${lastName},
    email: ${email},
    institution: ${institution}`)

  return {
    firstName,
    lastName,
    email,
    institution,
  }
}
