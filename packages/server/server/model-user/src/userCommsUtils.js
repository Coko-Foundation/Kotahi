const config = require('config')

const { clientUrl } = require('@coko/server')

const User = require('../../../models/user/user.model')
const Manuscript = require('../../../models/manuscript/manuscript.model')
const Team = require('../../../models/team/team.model')
const Group = require('../../../models/group/group.model')
const EmailTemplate = require('../../../models/emailTemplate/emailTemplate.model')
const Invitation = require('../../../models/invitation/invitation.model')

const {
  getEditorIdsForManuscript,
} = require('../../model-manuscript/src/manuscriptCommsUtils')

const {
  sendEmailNotification,
  submissionOverridenKeys,
} = require('../../../services/emailNotifications')

const { cachedGet } = require('../../querycache')

const getUsersById = async userIds => User.query().findByIds(userIds)

/** Returns an object of boolean values corresponding to roles the user could hold:
 * groupManager, admin, author, reviewer, editor, handlingEditor, seniorEditor, managingEditor.
 * Each is true if the user holds that role.
 * Note, an 'invited' or 'rejected' reviewer does NOT have reviewer role.
 * Also, "anyEditor" indicates if the user holds any editorial role for the manuscript;
 * "anyEditorOrManager" indicates any editorial role or groupManager or admin. */
const getUserRolesInManuscript = async (userId, manuscriptId, options = {}) => {
  const { trx } = options
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

const sendEmailWithPreparedData = async (
  input,
  ctx,
  emailSender,
  options = {},
) => {
  const { trx } = options
  let inputParsed = input

  if (ctx && typeof input === 'string') {
    inputParsed = JSON.parse(input)
  }

  // TODO:
  // Maybe a better way to make this function less ambigious is by having a simpler object of the structure:
  // { senderName, senderEmail, recieverName, recieverEmail }
  // ANd send this as `input` from the Frontend
  const {
    manuscript,
    selectedEmail, // selectedExistingRecieverEmail (TODO?): This is for a pre-existing receiver being selected
    selectedTemplate,
    externalEmail, // New User Email
    externalName, // New User username
    currentUser, // Name of the currentUser or senderName
    groupId,
  } = inputParsed

  const selectedEmailTemplateData = await EmailTemplate.query(trx).findById(
    selectedTemplate,
  )

  const receiverEmail = externalEmail || selectedEmail

  let receiverName = externalName

  const group = await Group.query(trx).findById(groupId)

  const appUrl = `${clientUrl}/${group.name}`
  let manuscriptPageUrl = `${appUrl}/versions/${manuscript.id}`
  let roles = {}

  if (selectedEmail) {
    // If the email of a pre-existing user is selected
    // Get that user
    const [userReceiver] = await User.query(trx)
      .where({ email: selectedEmail })
      .withGraphFetched('[defaultIdentity]')

    receiverName =
      userReceiver.username || userReceiver.defaultIdentity.name || ''

    roles = await getUserRolesInManuscript(userReceiver.id, manuscript.id, {
      trx,
    })
  }

  // manuscriptPageUrl based on user roles
  if (roles.groupManager || roles.anyEditor) {
    manuscriptPageUrl += '/decision?tab=decision'
  } else if (roles.reviewer || roles.collaborativeReviewer) {
    manuscriptPageUrl += '/review'
  } else if (roles.author) {
    manuscriptPageUrl += '/submit'
  } else {
    manuscriptPageUrl = `${appUrl}/dashboard`
  }

  const manuscriptProductionPageUrl = `${appUrl}/versions/${manuscript.id}/production` // manuscriptProductionPageUrl used only for author proofing flow
  const manuscriptId = manuscript.id

  const manuscriptObject = await Manuscript.query(trx).findById(manuscriptId)

  const author = await manuscriptObject.getManuscriptAuthor({ trx })

  const authorName = author ? author.username : ''

  const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/
  const emailValidationResult = emailValidationRegexp.test(receiverEmail)

  if (!emailValidationResult || !receiverName) {
    return { success: false }
  }

  let invitationSender = ''

  if (!ctx) {
    invitationSender = emailSender
  } else {
    invitationSender = await User.findById(ctx.userId) // no trx!!
  }

  const toEmail = receiverEmail
  const purpose = 'Inviting an author to accept a manuscript'
  const status = 'UNANSWERED'
  const senderId = invitationSender ? invitationSender.id : null

  let invitationId = ''

  // authorInvitation, reviewerInvitation create Invitation
  if (
    [
      'authorInvitation',
      'reviewerInvitation',
      'collaborativeReviewerInvitation',
    ].includes(selectedEmailTemplateData.emailTemplateType)
  ) {
    let userId = null
    let invitedPersonName = ''

    if (selectedEmail) {
      // If the email of a pre-existing user is selected
      // Get that user
      const [userReceiver] = await User.query(trx)
        .where({ email: selectedEmail })
        .withGraphFetched('[defaultIdentity]')

      userId = userReceiver.id
      invitedPersonName = userReceiver.username
    } else {
      // Use the username provided
      invitedPersonName = externalName
    }

    let invitedPersonType = 'REVIEWER'

    if (selectedEmailTemplateData.emailTemplateType === 'authorInvitation') {
      invitedPersonType = 'AUTHOR'
    } else if (
      selectedEmailTemplateData.emailTemplateType ===
      'collaborativeReviewerInvitation'
    ) {
      invitedPersonType = 'COLLABORATIVE_REVIEWER'
    }

    const newInvitation = await Invitation.query().insert({
      manuscriptId,
      toEmail,
      purpose,
      status,
      senderId,
      invitedPersonType,
      invitedPersonName,
      userId,
    }) // no trx!!

    invitationId = newInvitation.id
  }

  if (invitationId === '') {
    console.error(
      'Invitation Id is not available to be used for this template.',
    )
  }

  // TODO: check and remove instance is it still used? May be deadcode
  let instance

  if (config['notification-email'].use_colab === 'true') {
    instance = 'prc'
  } else {
    instance = 'generic'
  }

  const ccEmails = await getEditorEmails(manuscriptId, { trx })

  try {
    const result = await sendEmailNotification({
      receiver: receiverEmail,
      template: selectedEmailTemplateData,
      data: {
        authorName,
        senderName: currentUser,
        recipientName: receiverName,
        ccEmails,
        instance,
        toEmail,
        invitationId,
        purpose,
        status,
        senderId,
        manuscriptNumber: manuscript.shortId,
        manuscriptLink: manuscriptPageUrl,
        manuscriptTitle: manuscript.submission.$title,
        manuscriptTitleLink: manuscript.submission.$sourceUri,
        manuscriptProductionLink: manuscriptProductionPageUrl,
        ...submissionOverridenKeys(manuscript.submission),
      },
      groupId: manuscriptObject.groupId,
    })

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
}
