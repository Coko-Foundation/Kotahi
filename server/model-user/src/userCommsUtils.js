const models = require('@pubsweet/models')
const config = require('config')
const sendEmailNotification = require('../../email-notifications')

const {
  getEditorIdsForManuscript,
} = require('../../model-manuscript/src/manuscriptCommsUtils')

const getUsersById = async userIds => models.User.query().findByIds(userIds)

/** Returns an object of boolean values corresponding to roles the user could hold:
 * admin, author, reviewer, editor, handlingEditor, seniorEditor, managingEditor.
 * Each is true if the user holds that role.
 * Also, "anyEditor" indicates if the user holds any editorial role for the manuscript,
 * and "editorOrAdmin" indicates if the user is anyEditor or admin. */
const getUserRolesInManuscript = async (userId, manuscriptId) => {
  const result = {
    admin: false,
    author: false,
    reviewer: false,
    editor: false,
    handlingEditor: false,
    seniorEditor: false,
    managingEditor: false,
    anyEditor: false,
    editorOrAdmin: false,
  }

  if (!userId) return result
  result.admin = !!(await models.User.query().findById(userId)).admin
  if (!manuscriptId) return result

  const teams = await models.Team.query()
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

  result.editorOrAdmin = result.anyEditor || result.admin

  return result
}

/** If the current user is a 'shared' reviewer for the given manuscript,
 * return their userId plus the userIds of any other reviewers who are
 * also 'shared' and have COMPLETED their review.
 * If the current user isn't a 'shared' reviewer, return an empty array.
 */
const getSharedReviewersIds = async (manuscriptId, currentUserId) => {
  const reviewers = await models.Team.relatedQuery('members')
    .for(
      models.Team.query().where({ objectId: manuscriptId, role: 'reviewer' }),
    )
    .select('userId')
    .where({ isShared: true })
    .where(builder =>
      builder.where({ status: 'completed' }).orWhere({ userId: currentUserId }),
    )

  if (!reviewers.some(r => r.userId === currentUserId)) return []
  return reviewers.map(r => r.userId)
}

const sendEmailWithPreparedData = async (input, ctx, emailSender) => {
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
    currentUser,
  } = inputParsed

  const receiverEmail = externalEmail || selectedEmail

  let receiverName = externalName

  const urlFrag = config.journal.metadata.toplevel_urlfragment
  const baseUrl = config['pubsweet-client'].baseUrl + urlFrag
  let manuscriptPageUrl = `${baseUrl}/versions/${manuscript.id}`
  let isAdmin = false
  let isEditor = false
  let isReviewer = false
  let isAuthor = false

  if (selectedEmail) {
    // If the email of a pre-existing user is selected
    // Get that user
    const [userReceiver] = await models.User.query()
      .where({ email: selectedEmail })
      .withGraphFetched('[defaultIdentity]')

    /* eslint-disable-next-line */
    receiverName =
      userReceiver.username || userReceiver.defaultIdentity.name || ''

    const userCurrentRoles = await userReceiver.currentRoles(manuscript)

    const manuscriptRoles = userCurrentRoles.find(
      data => data.id === manuscript.id,
    )

    const editorRoles = ['editor', 'handlingEditor', 'seniorEditor']

    const reviewerRoles = [
      'accepted:reviewer',
      'inProgress:reviewer',
      'completed:reviewer',
      'reviewer',
    ]

    const authorRoles = ['author']

    isAdmin = userReceiver.admin
    isEditor =
      manuscriptRoles &&
      manuscriptRoles.roles.some(role => editorRoles.includes(role))
    isReviewer =
      manuscriptRoles &&
      manuscriptRoles.roles.some(role => reviewerRoles.includes(role))
    isAuthor =
      manuscriptRoles &&
      manuscriptRoles.roles.some(role => authorRoles.includes(role))
  }

  if (isAdmin || isEditor) {
    manuscriptPageUrl += '/decision?tab=tasks'
  } else if (isReviewer) {
    manuscriptPageUrl += '/review'
  } else if (isAuthor) {
    manuscriptPageUrl += '/submit'
  } else {
    manuscriptPageUrl = `${baseUrl}/dashboard`
  }

  const manuscriptId = manuscript.id

  const manuscriptObject = await models.Manuscript.query().findById(
    manuscriptId,
  )

  const author = await manuscriptObject.getManuscriptAuthor()

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
    invitationSender = await models.User.find(ctx.user)
  }

  const toEmail = receiverEmail
  const purpose = 'Inviting an author to accept a manuscript'
  const status = 'UNANSWERED'
  const senderId = invitationSender ? invitationSender.id : null

  let invitationId = ''

  const invitationContainingEmailTemplate = [
    'authorInvitationEmailTemplate',
    'reviewerInvitationEmailTemplate',
    'reviewInvitationEmailTemplate',
    'reminderAuthorInvitationTemplate',
    'reminderReviewerInvitationTemplate',
    'reviewerInvitationRevisedPreprintTemplate',
  ]

  if (invitationContainingEmailTemplate.includes(selectedTemplate)) {
    let userId = null
    let invitedPersonName = ''

    if (selectedEmail) {
      // If the email of a pre-existing user is selected
      // Get that user
      const [userReceiver] = await models.User.query()
        .where({ email: selectedEmail })
        .withGraphFetched('[defaultIdentity]')

      userId = userReceiver.id
      invitedPersonName = userReceiver.username
    } else {
      // Use the username provided
      invitedPersonName = externalName
    }

    const invitedPersonType =
      selectedTemplate === 'authorInvitationEmailTemplate'
        ? 'AUTHOR'
        : 'REVIEWER'

    const newInvitation = await new models.Invitation({
      manuscriptId,
      toEmail,
      purpose,
      status,
      senderId,
      invitedPersonType,
      invitedPersonName,
      userId,
    }).saveGraph()

    invitationId = newInvitation.id
  }

  if (invitationId === '') {
    console.error(
      'Invitation Id is not available to be used for this template.',
    )
  }

  let instance

  if (config['notification-email'].use_colab === 'true') {
    instance = 'colab'
  } else {
    instance = 'generic'
  }

  const ccEmails = await getEditorEmails(manuscriptId)

  try {
    await sendEmailNotification(receiverEmail, selectedTemplate, {
      articleTitle: manuscript.meta.title,
      authorName,
      currentUser,
      receiverName,
      ccEmails,
      shortId: manuscript.shortId,
      instance,
      toEmail,
      invitationId,
      submissionLink: ctx
        ? JSON.parse(manuscript.submission).link
        : manuscript.submission.link,
      purpose,
      status,
      senderId,
      appUrl: config['pubsweet-client'].baseUrl,
      manuscriptPageUrl,
    })
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false }
  }
}

const getEditorEmails = async manuscriptId => {
  const userIds = await getEditorIdsForManuscript(manuscriptId)

  const users = await models.User.query().whereIn('id', userIds)

  return users.map(user => user.email)
}

module.exports = {
  getUsersById,
  getUserRolesInManuscript,
  getSharedReviewersIds,
  sendEmailWithPreparedData,
}
