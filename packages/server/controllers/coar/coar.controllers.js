const { getCrossrefDataViaDoi } = require('./crossRef')
const { makeAnnouncementOnCOAR } = require('./announcement')

const Manuscript = require('../../models/manuscript/manuscript.model')
const Config = require('../../models/config/config.model')
const CoarNotification = require('../../models/coarNotification/coarNotification.model')

const sendAnnouncementNotification = (notification, manuscript) => {
  return makeAnnouncementOnCOAR(notification, manuscript)
}

const createNotification = async (payload, groupId) => {
  const notification = await CoarNotification.query().upsertGraphAndFetch({
    payload,
    groupId,
  })

  return notification
}

const getManuscriptByDoi = async doi => {
  const manuscript = await Manuscript.query().findOne({ doi })
  return manuscript
}

const extractManuscriptFromNotification = async (notification, groupId) => {
  const doi = extractDoi(notification)
  const crossrefData = await getCrossrefDataViaDoi(doi)
  const existingManuscript = await getManuscriptByDoi(doi)

  if (existingManuscript) return null
  if (!crossrefData) return null

  const { title, topics, publishedDate, abstract, journal, author, url } =
    crossrefData

  const newManuscript = {
    submission: {
      datePublished: publishedDate,
      abstract: abstract || '',
      firstAuthor: author,
      journal,
      topics,
      doi,
      url,
    },
    status: 'new',
    meta: {
      title,
    },
    importSourceServer: 'COAR',
    groupId,
    doi,
  }

  const manuscript = await Manuscript.query().upsertGraphAndFetch(newManuscript)

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

const filterNotification = payload => payload.type.includes('Offer')

const processNotification = async (group, payload) => {
  const groupId = group.id

  const existingNotification = await CoarNotification.query().findOne({
    payload,
    groupId,
  })

  // If not Offer type notification, just return 200 and process no further.
  if (!filterNotification(payload)) {
    return { status: 200, message: 'Notification received' }
  }

  if (existingNotification) {
    return {
      status: 400,
      message: 'Notification already exists with the same payload.',
    }
  }

  const notification = await createNotification(payload, groupId)

  const manuscript = await extractManuscriptFromNotification(
    notification,
    groupId,
  )

  if (!manuscript) {
    await CoarNotification.query()
      .findById(notification.id)
      .patch({ status: false })
  } else {
    await linkManuscriptToNotification(notification, manuscript)
  }

  return { status: 200, message: 'Notification created successfully.' }
}

module.exports = {
  sendAnnouncementNotification,
  processNotification,
  validateIPs,
}
