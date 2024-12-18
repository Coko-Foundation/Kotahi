const config = require('config')
const nodemailer = require('nodemailer')
const { clientUrl, logger, User } = require('@coko/server')
const { Team, TeamMember } = require('../models')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const { NODE_ENV } = process.env

// TODO: find another place for this one
const getSeconds = unit => {
  const secondsInAMinute = 60
  const secondsInADay = 24 * 60 * 60
  return {
    mins: unit * secondsInAMinute,
    days: unit * secondsInADay,
    weeks: unit * 7 * secondsInADay,
  }
}

const overrideRecipient = ({ subject, cc, to }) => {
  const { hostname } = new URL(clientUrl)
  const isLocalHost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname)
  const isProduction = NODE_ENV === 'production' || !isLocalHost

  if (isProduction) return false

  const description = `email with subject '${subject}' to ${to}${
    cc && ` (CCing ${cc})`
  }, because Kotahi is running in ${NODE_ENV} mode on ${hostname}`

  const testEmail = config['notification-email'].testEmailRecipient || ''

  if (!testEmail) {
    logger.info(
      `Suppressing ${description}. Set TEST_EMAIL_RECIPIENT in your .env file if you wish to redirect rather than suppress emails.`,
    )
    return true
  }

  logger.info(
    `Overriding recipient(s) for ${description}. This is instead being sent to ${testEmail}.`,
  )

  return {
    to: testEmail,
    cc: '',
    bcc: '',
  }
}

const getRecipientsEmails = async ({
  recipient,
  ccEmails,
  manuscriptId: msId,
  groupId: gId,
  contextRecipient: ctxFrom,
  getTeam = false,
}) => {
  const eventFrom = (await getRecipient(recipient, msId, gId, false)) ?? []
  const eventCCs = (await getRecipient(ccEmails, msId, gId, true)) ?? []

  const ctxRecipient =
    ctxFrom && (await getRecipient(ctxFrom, msId, gId, false))

  ctxRecipient && eventFrom && eventCCs.push(eventFrom)

  const to = ctxRecipient || eventFrom
  const ccWithoutTo = eventCCs.filter(em => em !== to)
  const cc = [...new Set(ccWithoutTo)].flat(2)
  const recipientUser = await User.query().where({ email: to }).first()

  logger.info(`Recipients: ${to} and CC: ${cc}`)
  logger.info(`Recipient User: ${recipientUser?.username}`)

  return { to, cc, recipientUser }
}

const getRecipient = async (recipient, manuscriptId, groupId, getTeam) => {
  if (Array.isArray(recipient)) {
    const results = await Promise.all(
      recipient.map(async r => getRecipient(r, manuscriptId, groupId, getTeam)),
    )

    return results
  }

  if (EMAIL_REGEX.test(recipient)) return recipient
  if (EMAIL_REGEX.test(recipient?.email)) return recipient.email

  if (['groupManager', 'groupAdmin'].includes(recipient)) {
    const groupManagerTeam = await Team.query().findOne({
      role: recipient,
      objectId: groupId,
      objectType: 'Group',
    })

    const groupManager = await TeamMember.query().findOne({
      teamId: groupManagerTeam.id,
    })

    const user = await User.query().findById(groupManager.userId)
    return EMAIL_REGEX.test(user?.email) ? user?.email : ''
  }

  if (!manuscriptId) return ''

  const [team] = await Team.query()
    .where('objectId', manuscriptId)
    .where('role', recipient)

  if (team) {
    const members = await TeamMember.query().where('teamId', team.id)

    const users = await Promise.all(
      members.map(async member => {
        const user = User.query().findById(member.userId)
        return user
      }),
    )

    return getTeam ? users.map(user => user?.email) : users[0]?.email
  }

  return []
}

const sendEmail = async (mailOptions, groupId) => {
  // eslint-disable-next-line global-require
  const { Config } = require('../models')

  try {
    const { formData } = (await Config.getCached(groupId)) ?? {}

    const {
      gmailSenderName: name,
      gmailAuthEmail: address,
      gmailAuthPassword: pass,
      service = 'gmail',
    } = formData.notification

    const options = { ...mailOptions, from: { name, address } }

    const transport = {
      service,
      auth: { user: address, pass },
    }

    const transporter = nodemailer.createTransport(transport)

    // TODO: use @coko/server util once we divorce gmail XD
    const info = await transporter.sendMail(options)
    logger.info(`Email sent: ${info.response}`)

    return true
  } catch (err) {
    logger.error(err)
    return false
  }
}

module.exports = {
  sendEmail,
  getSeconds,
  overrideRecipient,
  getRecipientsEmails,
}
