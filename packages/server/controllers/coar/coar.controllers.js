const { logger, uuid, serverUrl, request } = require('@coko/server')
const { getCrossrefDataViaDoi } = require('./crossRef')
const { makeAnnouncementOnCOAR } = require('./announcement')

const {
  CoarNotification,
  Config,
  Group,
  Manuscript,
  User,
} = require('../../models')

const sendAnnouncementNotification = (notification, manuscript, type) => {
  return makeAnnouncementOnCOAR(notification, manuscript, type)
}

const sendTentativeAcceptCoarNotification = async (
  manuscript,
  handlingEditorIds,
) => {
  const offerNotification =
    await CoarNotification.getOfferNotificationForManuscript(manuscript.id)

  if (!offerNotification) {
    logger.error(
      'COAR: sendTentativeAcceptNotification: no notification found for manuscript',
      manuscript.id,
    )
    return false
  }

  const handlingEditor = await User.findOneWithIdentity(
    handlingEditorIds[0],
    'orcid',
  )

  handlingEditor.orcid = handlingEditor.identities[0]?.identifier

  const group = await Group.findById(manuscript.groupId)

  const { payload: offerPayload } = offerNotification

  const tentativeAcceptObject = { ...offerPayload }
  delete tentativeAcceptObject['@context']

  const tentativeAcceptPayload = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://coar-notify.net',
    ],
    actor: {
      id: handlingEditor.orcid
        ? `https://orcid.org/${handlingEditor.orcid}`
        : handlingEditor.email,
      type: 'Person',
      name: handlingEditor.username,
    },
    id: `urn:uuid:${uuid()}`,
    inReplyTo: offerPayload.id,
    object: tentativeAcceptObject,
    origin: {
      id: serverUrl,
      inbox: `${serverUrl}/api/coar/inbox/${group.name}`,
      type: 'Service',
    },
    target: {
      ...offerPayload.origin,
    },
    type: 'TentativeAccept',
  }

  const stringifiedPayload = JSON.stringify(tentativeAcceptPayload)

  try {
    const response = await request({
      method: 'post',
      url: tentativeAcceptPayload.target.inbox,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': `${stringifiedPayload.length}`,
      },
      data: stringifiedPayload,
    })

    return response ? response.data : false
  } catch (e) {
    logger.error(e)
    return false
  }
}

const sendRejectCoarNotification = async (
  manuscript,
  editor,
  decision = 'rejected',
) => {
  const offerNotification =
    await CoarNotification.getOfferNotificationForManuscript(manuscript.id)

  if (!offerNotification) {
    logger.error(
      'COAR: sendTentativeAcceptNotification: no notification found for manuscript',
      manuscript.id,
    )
    return false
  }

  const group = await Group.findById(manuscript.groupId)
  const { payload: offerPayload } = offerNotification

  const actor = {
    id: '',
    type: 'Person',
    name: 'Anonymous',
  }

  if (editor) {
    const actorId = editor.identities[0]?.identifier
      ? `https://orcid.org/${editor.identities[0].identifier}`
      : editor.email

    actor.id = actorId
    actor.name = editor.username
  }

  const rejectObject = { ...offerPayload }
  delete rejectObject['@context']

  const rejectPayload = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://coar-notify.net',
    ],
    actor,
    id: `urn:uuid:${uuid()}`,
    inReplyTo: offerPayload.id,
    object: rejectObject,
    origin: {
      id: serverUrl,
      inbox: `${serverUrl}/api/coar/inbox/${group.name}`,
      type: 'Service',
    },
    target: {
      ...offerPayload.origin,
    },
    type: decision === 'revise' ? 'TentativeReject' : 'Reject',
  }

  const stringifiedPayload = JSON.stringify(rejectPayload)

  try {
    const response = await request({
      method: 'post',
      url: rejectPayload.target.inbox,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': `${stringifiedPayload.length}`,
      },
      data: stringifiedPayload,
    })

    return response ? response.data : false
  } catch (e) {
    logger.error(e)
    return false
  }
}

const createNotification = async (payload, groupId) => {
  const notification = await CoarNotification.query().insert({
    payload,
    groupId,
  })

  return notification
}

const getManuscriptByDoi = async (doi, groupId) => {
  const manuscript = await Manuscript.query().findOne({ doi, groupId })
  return manuscript
}

const extractManuscriptFromNotification = async (notification, groupId) => {
  const doi = extractDoi(notification)
  const crossrefData = await getCrossrefDataViaDoi(doi)
  const existingManuscript = await getManuscriptByDoi(doi, groupId)

  if (existingManuscript) return null
  if (!crossrefData) return null

  const { title, topics, publishedDate, abstract, journal, author, url } =
    crossrefData

  const newManuscript = {
    submission: {
      datePublished: publishedDate,
      $abstract: abstract || '',
      firstAuthor: author,
      journal,
      topics,
      $doi: doi,
      url,
      $title: title,
    },
    status: 'new',
    meta: {
      title,
    },
    importSourceServer: 'COAR',
    groupId,
    doi,
    // Create two channels: 1. free for all involved, 2. editorial
    channels: [
      {
        topic: 'Manuscript discussion',
        type: 'all',
        groupId,
      },
      {
        topic: 'Editorial discussion',
        type: 'editorial',
        groupId,
      },
    ],
  }

  const manuscript = await Manuscript.query().upsertGraphAndFetch(
    newManuscript,
    { relate: true },
  )

  return manuscript
}

const validateIPs = async (requestIP, group) => {
  const groupId = group.id

  const activeConfig = await Config.query().findOne({
    groupId,
    active: true,
  })

  const coarNotifyFormData = activeConfig.formData.integrations.coarNotify
  let repoIpAddress = '*'

  if (coarNotifyFormData) {
    repoIpAddress = coarNotifyFormData.repoIpAddress
  }

  if (!repoIpAddress || repoIpAddress === '*') {
    return true
  }

  const acceptedIPs = repoIpAddress.split(',').map(ip => ip.trim())

  return acceptedIPs.includes(requestIP)
}

const linkManuscriptToNotification = async (notification, manuscript) => {
  const manuscriptId = manuscript.id
  await CoarNotification.query()
    .findById(notification.id)
    .patch({ manuscriptId })
}

const extractDoi = notification => {
  const doi = notification.payload.object['ietf:cite-as']
  return doi ? doi.replace('https://doi.org/', '') : null
}

const filterNotification = payload =>
  Array.isArray(payload?.type) && payload.type.includes('Offer')

const processNotification = async (group, payload) => {
  const groupId = group.id

  const existingNotification = await CoarNotification.query().findOne({
    payload,
    groupId,
  })

  // If not Offer type notification, just return 200 and process no further.
  if (!filterNotification(payload)) {
    return { status: 202, message: 'Notification received' }
  }

  if (existingNotification) {
    return {
      status: 400,
      message: 'Notification already exists with the same payload.',
    }
  }

  const notification = await createNotification(payload, groupId)

  // only returns a new manuscipt, else null for existing
  const manuscript = await extractManuscriptFromNotification(
    notification,
    groupId,
  )

  // existing manuscript
  if (!manuscript) {
    await CoarNotification.query()
      .findById(notification.id)
      .patch({ status: false })
  } else {
    await linkManuscriptToNotification(notification, manuscript)
  }

  return { status: 202, message: 'Notification created successfully.' }
}

module.exports = {
  sendAnnouncementNotification,
  sendTentativeAcceptCoarNotification,
  sendRejectCoarNotification,
  processNotification,
  validateIPs,
}
