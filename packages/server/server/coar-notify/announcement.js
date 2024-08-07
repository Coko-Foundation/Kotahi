const axios = require('axios')
const config = require('config')

const { serverUrl } = require('@coko/server')

const Group = require('../../models/group/group.model')
const Review = require('../../models/review/review.model')

const flaxConfig = config['flax-site']

const isReviewDoi = () => {
  return false
}

const isFlaxSetup = () => {
  return (
    flaxConfig.port === '' ||
    flaxConfig.host === '' ||
    flaxConfig.protocol === ''
  )
}

const getFlaxUrl = async (groupName, shortId) => {
  if (!flaxConfig) return false
  const flaxHost = flaxConfig.host
  const flaxPort = flaxConfig.port
  const flaxProtocol = flaxConfig.protocol

  const flaxServerUrl = `${flaxProtocol}://${flaxHost}${
    flaxPort ? `:${flaxPort}` : ''
  }`

  return `${flaxServerUrl}/${groupName}/${shortId}/index.html#reviews`
}

const getRequestData = async (notification, manuscript) => {
  const { payload, groupId } = notification
  const group = await Group.query().findById(groupId).first()
  const reviewer = await getReviewer(manuscript)
  const flaxReviewUrl = await getFlaxUrl(group.name, manuscript.shortId)

  const defaultPayload = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://purl.org/coar/notify',
    ],
    id: payload.id,
    updated: new Date(),
    type: ['Announce', 'coar-notify:ReviewAction'],
    origin: {
      id: serverUrl,
      inbox: `${serverUrl}/api/coar/inbox/${group.name}`,
      type: 'Service',
    },
    target: {
      ...payload.origin,
    },
    object: {
      id: isReviewDoi || flaxReviewUrl,
      type: ['Document', 'sorg:Review'],
    },
    actor: {
      type: 'Person',
      id: '',
      name: 'Anonymous',
    },
    context: {
      id: `https://doi.org/${manuscript.doi}`,
    },
    inReplyTo: null,
  }

  if (reviewer) {
    defaultPayload.actor = {
      type: 'Person',
      id: reviewer.email,
      name: reviewer.username,
    }
  }

  return JSON.stringify(defaultPayload)
}

const getReviewer = async manuscript => {
  const manuscriptId = manuscript.id

  const latestReview = await Review.query()
    .findOne({ manuscriptId, is_decision: false })
    .orderBy('updated', 'desc')
    .first()

  if (!latestReview || latestReview.isHiddenReviewerName) {
    return null
  }

  const reviewer = await latestReview.$relatedQuery('user')

  return reviewer
}

const makeAnnouncementOnCOAR = async (notification, manuscript) => {
  const requestData = await getRequestData(notification, manuscript)
  const inboxUrl = JSON.parse(requestData).target.inbox
  const requestLength = requestData.length

  if (!isReviewDoi() && !isFlaxSetup()) {
    return false
  }

  try {
    const response = await axios({
      method: 'post',
      url: inboxUrl,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': `${requestLength}`,
      },
      data: requestData,
    })

    return response ? response.data : false
  } catch (err) {
    console.error(err)
    return false
  }
}

module.exports = makeAnnouncementOnCOAR
