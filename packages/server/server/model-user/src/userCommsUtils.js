const User = require('../../../models/user/user.model')
const Manuscript = require('../../../models/manuscript/manuscript.model')
const Team = require('../../../models/team/team.model')
const EmailTemplate = require('../../../models/emailTemplate/emailTemplate.model')
const Invitation = require('../../../models/invitation/invitation.model')

const {
  getEditorIdsForManuscript,
} = require('../../../controllers/manuscript/manuscriptCommsUtils')

const emailService = require('../../../services/emailNotifications.service')
const handlebarsService = require('../../../services/handlebars.service')
const seekEvent = require('../../../services/notification.service')
const { cachedGet } = require('../../querycache')
const { safeParse, objIf } = require('../../utils/objectUtils')

const { overrideRecipient, sendEmail } = emailService
const { processData, useHandlebars } = handlebarsService

const INVITATION_TYPES = [
  'authorInvitation',
  'reviewerInvitation',
  'collaborativeReviewerInvitation',
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+$/

const getReciever = async (selectedEmail, externalName, trx) => {
  if (!selectedEmail) return { name: externalName, id: null }

  const [userReceiver] = await User.query(trx)
    .where({ email: selectedEmail })
    .withGraphFetched('[defaultIdentity]')

  return {
    name: userReceiver.username || userReceiver.defaultIdentity.name || '',
    id: userReceiver.id,
  }
}

const sendInvitation = async input => {
  const {
    type,
    emailSender,
    externalName,
    manuscriptId,
    selectedEmail,
    externalEmail,
  } = input

  const receiverEmail = externalEmail || selectedEmail
  const isEmailValid = EMAIL_REGEX.test(receiverEmail)
  const receiver = await getReciever(selectedEmail, externalName)

  if (!isEmailValid || !receiver) return { success: false }

  const invitedPersonTypes = {
    authorInvitation: 'AUTHOR',
    reviewerInvitation: 'REVIEWER',
    collaborativeReviewerInvitation: 'COLLABORATIVE_REVIEWER',
  }

  const invitationData = {
    manuscriptId,
    toEmail: receiverEmail,
    purpose: 'Inviting an author to accept a manuscript',
    status: 'UNANSWERED',
    senderId: emailSender ? emailSender.id : null,
    invitedPersonType: invitedPersonTypes[type],
    invitedPersonName: receiver.name,
    userId: receiver.id,
  }

  let invitation = await Invitation.findOne({
    manuscriptId,
    toEmail: receiverEmail,
    purpose: 'Inviting an author to accept a manuscript',
    status: 'UNANSWERED',
    invitedPersonType: invitedPersonTypes[type],
    userId: receiver.id,
  })

  if (!invitation) {
    invitation = await Invitation.insert(invitationData)
  }

  const invitationId = invitation.id

  return {
    success: !!invitationId,
    invitationId,
    receiverName: receiver.name,
    invitation,
    ...invitationData,
  }
}

const getUsersById = async userIds => User.query().findByIds(userIds)

/** Returns an object of boolean values corresponding to roles the user could hold:
 * groupManager, admin, author, reviewer, editor, handlingEditor, seniorEditor, managingEditor.
 * Each is true if the user holds that role.
 * Note, an 'invited' or 'rejected' reviewer does NOT have reviewer role.
 * Also, "anyEditor" indicates if the user holds any editorial role for the manuscript;
 * "anyEditorOrManager" indicates any editorial role or groupManager or admin. */
const getUserRolesInManuscript = async (userId, manuscriptId, options = {}) => {
  const { trx } = options
  if (!manuscriptId) return {}
  const manuscript = await Manuscript.query(trx).findById(manuscriptId)
  const { groupId } = manuscript

  const userIsAdmin = userId && (await cachedGet(`userIsAdmin:${userId}`))
  const userIsGM = userId && (await cachedGet(`userIsGM:${userId}:${groupId}`))

  const userIsGroupAdmin =
    userId && (await cachedGet(`userIsGroupAdmin:${userId}:${groupId}`))

  const result = {
    admin: userIsAdmin,
    groupManager: userIsGM,
    groupAdmin: userIsGroupAdmin,
    author: false,
    reviewer: false,
    collaborativeReviewer: false,
    editor: false,
    handlingEditor: false,
    seniorEditor: false,
    managingEditor: false,
    anyEditor: false,
    anyEditorOrManager: false,
  }

  if (!userId || !manuscriptId) return result

  const teams = await Team.query(trx)
    .select('role')
    .withGraphJoined('members')
    .where({ objectId: manuscriptId, userId })
    // If status is null, whereNotIn('status', ['invited', 'rejected']) returns false.
    // I'm not sure why this is, but it means we need a separate check for status===null.
    .where(
      builder =>
        builder
          .whereNull('status')
          .orWhereNotIn('status', ['invited', 'rejected']), // Reviewers with status 'invited' or 'rejected' are not actually reviewers
    )

  teams.forEach(t => {
    result[t.role] = true
  })

  result.anyEditor =
    result.editor ||
    result.handlingEditor ||
    result.seniorEditor ||
    result.managingEditor

  result.anyEditorOrManager =
    result.anyEditor || result.admin || result.groupManager || result.groupAdmin

  return result
}

/** If the current user is a 'shared' reviewer for the given manuscript,
 * return their userId plus the userIds of any other reviewers who are
 * also 'shared' and have COMPLETED their review.
 * If the current user isn't a 'shared' reviewer, return an empty array.
 */
const getSharedReviewersIds = async (manuscriptId, currentUserId) => {
  if (!currentUserId) return []

  const reviewers = await Team.relatedQuery('members')
    .for(Team.query().where({ objectId: manuscriptId, role: 'reviewer' }))
    .select('userId')
    .where({ isShared: true })
    .where(builder =>
      builder.where({ status: 'completed' }).orWhere({ userId: currentUserId }),
    )

  if (!reviewers.some(r => r.userId === currentUserId)) return []
  return reviewers.map(r => r.userId)
}

// TODO: This should be refactored:
// we should have the invitation and email sending logic separated, or we can have it like this if this is the only purpose of this function,
// the problem is that this is still beign used for sending task email nottifications, once we change that, we can refactor this and/or just rename it to inviteAndSendEmail maybe, and also rename the sendEmail mutation.
//
// Another issue is that we're relying on the emailTemplateType to determine the invitation type(and also if it should invite)
// we need to change the implementation on 'Tasks & notifications' tab from the DecisionPage on the client to send invitations to reimplement this
const sendEmailWithPreparedData = async (
  input,
  ctx,
  emailSender,
  options = {},
) => {
  const { trx } = options

  const {
    manuscript,
    selectedEmail: rawSelectedEmail, // selectedExistingRecieverEmail (TODO?): This is for a pre-existing receiver being selected
    selectedTemplate, // selectedEmailTemplateId
    externalEmail: rawExternalEmail, // New User Email
    externalName, // New User username
    currentUser, // Name of the currentUser or senderName
    groupId,
  } = safeParse(input, input)

  const selectedEmail = (rawSelectedEmail ?? '').toLowerCase()
  const externalEmail = (rawExternalEmail ?? '').toLowerCase()

  const template = await EmailTemplate.query(trx).findById(selectedTemplate)

  const to = externalEmail || selectedEmail
  let receiverName = externalName

  if (selectedEmail) {
    const [userReceiver] = await User.query(trx)
      .where({ email: selectedEmail })
      .withGraphFetched('[defaultIdentity]')

    receiverName =
      userReceiver.username || userReceiver.defaultIdentity.name || ''
  }

  const manuscriptId = manuscript.id
  // check why are we fetching the manuscript again? to use getManuscriptAuthor?
  const manuscriptObject = await Manuscript.query(trx).findById(manuscriptId)
  const author = await manuscriptObject.getManuscriptAuthor({ trx })
  const authorName = author ? author.username : ''
  const emailValidationResult = EMAIL_REGEX.test(to)

  if (!emailValidationResult || !receiverName) {
    return { success: false }
  }

  const { emailTemplateType: type } = template
  const isInvitation = INVITATION_TYPES.includes(type)

  if (isInvitation) {
    const invitationPayload = {
      type,
      emailSender: !ctx ? emailSender : await User.findById(ctx.userId),
      externalName,
      manuscriptId,
      selectedEmail,
      externalEmail,
    }

    const invitationResult = await sendInvitation(invitationPayload, ctx)
    const { invitation, ...invitationData } = invitationResult
    const { success } = invitationData

    if (success) {
      // TODO: we're relying on the emailTemplateType until we change the 'Tasks & notifications' tab from the DecisionPage on the client

      const eventName = {
        authorInvitation: 'author-invitation',
        reviewerInvitation: 'review-invitation',
        collaborativeReviewerInvitation: 'collaborative-review-invitation',
      }[type]

      const eventData = {
        manuscript: manuscriptObject,
        authorName,
        senderName: currentUser,
        recipientName: receiverName,
        ...invitationData,
        context: { recipient: invitationData.toEmail, invitation },
        groupId,
      }

      const eventResult = await seekEvent(eventName, eventData) // we need only the success from this
      seekEvent(`${eventName}-follow-up`, eventData)

      return { success: !!success && !!eventResult.success, ...invitation }
    }
  }

  const ccEmails = await getEditorEmails(manuscriptId, { trx })

  try {
    const variables = {
      authorName,
      senderName: currentUser,
      recipientName: receiverName,
      ccEmails,
      manuscript,
    }

    let { cc, body, subject, ccEditors } = template.emailContent ?? {}

    // TODO: replace this as we dont have cc or ccEditors in the template anymore
    if (ccEditors && ccEmails) {
      cc += `,${ccEmails.join(',')}`
    }

    const override = overrideRecipient({ to, cc, subject })
    const isProduction = !override || !override.to
    const dataForHandlebars = processData(variables, groupId)

    const mailOptions = {
      to,
      cc,
      subject: useHandlebars(subject, dataForHandlebars),
      html: useHandlebars(body, dataForHandlebars),
      ...objIf(!isProduction, override),
    }

    const result = await sendEmail(mailOptions, groupId)

    return { success: result }
  } catch (e) {
    console.error(e)
    return { success: false }
  }
}

const getGroupAndGlobalRoles = async (userId, groupId, options = {}) => {
  const { trx } = options
  if (!userId) return { groupRoles: [], globalRoles: [] }

  const groupAndGlobalTeams = await Team.query(trx)
    .select('role', 'objectId')
    .withGraphJoined('members')
    .where({ userId })
    .where(function subcondition() {
      this.whereRaw('global').orWhere({ objectId: groupId })
    })

  const groupRoles = []
  const globalRoles = []
  groupAndGlobalTeams.forEach(team => {
    // TODO remove the first condition once groups have IDs
    if (team.role === 'admin') globalRoles.push(team.role)
    else if (team.objectId === groupId) groupRoles.push(team.role)
    else globalRoles.push(team.role)
  })

  return { groupRoles, globalRoles }
}

const isAdminOrGroupManager = async (userId, groupId) => {
  const { groupRoles, globalRoles } = await getGroupAndGlobalRoles(
    userId,
    groupId,
  )

  return groupRoles.includes('groupManager') || globalRoles.includes('admin')
}

const getEditorEmails = async (manuscriptId, options = {}) => {
  const { trx } = options
  const userIds = await getEditorIdsForManuscript(manuscriptId, { trx })
  const users = await User.query(trx).whereIn('id', userIds)
  return users.map(user => user.email)
}

module.exports = {
  getUsersById,
  getUserRolesInManuscript,
  getSharedReviewersIds,
  sendEmailWithPreparedData,
  getGroupAndGlobalRoles,
  isAdminOrGroupManager,
  sendInvitation,
}
