const models = require('@pubsweet/models')
const config = require('config')
const Team = require('../../model-team/src/team')
const sendEmailNotification = require('../../email-notifications')

const Invitation = require('../../model-invitations/src/invitations')

const getUsersById = async userIds => models.User.query().findByIds(userIds)

/** Returns an object of boolean values corresponding to roles the user could hold:
 * admin, author, reviewer, editor, handlingEditor, seniorEditor, managingEditor.
 * Each is true if the user holds that role.
 * Also, "anyEditor" indicates if the user holds any editorial role for the manuscript,
 * and "editorOrAdmin" indicates if the user is anyEditor or admin. */
const getUserRolesInManuscript = async (userId, manuscriptId) => {
  const result = {
    admin: !!(await models.User.query().findById(userId)).admin,
    author: false,
    reviewer: false,
    editor: false,
    handlingEditor: false,
    seniorEditor: false,
    managingEditor: false,
  }

  const teams = await Team.query()
    .select('role')
    .where({ objectId: manuscriptId })
    .withGraphFetched('members')

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

  if (isEditor) {
    manuscriptPageUrl += '/decision'
  } else if (isReviewer) {
    manuscriptPageUrl += '/review'
  } else if (isAuthor) {
    manuscriptPageUrl += '/submit'
  } else {
    manuscriptPageUrl = `${baseUrl}/dashboard`
  }

  if (isEditor) manuscriptPageUrl += '/decision'
  else if (isReviewer) manuscriptPageUrl += '/review'
  else manuscriptPageUrl += '/submit'

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

    const newInvitation = await new Invitation({
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

  if (config['notification-email'].use_colab) {
    instance = 'colab'
  } else {
    instance = 'generic'
  }

  try {
    await sendEmailNotification(receiverEmail, selectedTemplate, {
      articleTitle: manuscript.meta.title,
      authorName,
      currentUser,
      receiverName,
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

module.exports = {
  getUsersById,
  getUserRolesInManuscript,
  sendEmailWithPreparedData,
}
