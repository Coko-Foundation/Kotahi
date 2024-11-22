const axios = require('axios')
const { serverUrl, uuid } = require('@coko/server')

const {
  getFlaxUrl,
  getReviewer,
  isReviewDoi,
  isFlaxSetup,
} = require('./announcement')

const Config = require('../../models/config/config.model')
const Group = require('../../models/group/group.model')

const getScietyInboxUrl = async groupId => {
  const activeConfig = await Config.query().findOne({
    groupId,
    active: true,
  })

  const coarNotifyFormData = activeConfig.formData.integrations.coarNotify

  let url = ''

  if (coarNotifyFormData) {
    url = coarNotifyFormData.scietyInboxUrl
  }

  return url
}

const getRequestData = async manuscript => {
  const group = await Group.query().findById(manuscript.groupId).first()
  const reviewer = await getReviewer(manuscript)
  const flaxReviewUrl = await getFlaxUrl(group.name, manuscript.shortId)

  const defaultPayload = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://purl.org/coar/notify',
    ],
    id: uuid(),
    type: ['Announce', 'coar-notify:ReviewAction'],
    origin: {
      id: serverUrl,
      inbox: `${serverUrl}/api/coar/inbox/${group.name}`,
      type: 'Service',
    },
    target: {
      id: 'https://sciety.org',
      inbox: await getScietyInboxUrl(group.id),
      type: 'Service',
    },
    object: {
      id: flaxReviewUrl,
      type: ['Document', 'sorg:Review'],
    },
    actor: {
      type: 'Service',
      id: 'https://kotahi.community',
      name: 'Kotahi',
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

const sendAnnouncementNotificationToSciety = async manuscript => {
  const requestData = await getRequestData(manuscript)
  const inboxUrl = await getScietyInboxUrl(manuscript.groupId)

  if ((!isReviewDoi() && !isFlaxSetup()) || !inboxUrl) {
    return false
  }

  try {
    const response = await axios({
      method: 'post',
      url: inboxUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      data: requestData,
    })

    return response ? response.data : false
  } catch (err) {
    console.error(err)
    return false
  }
}

module.exports = { sendAnnouncementNotificationToSciety }
