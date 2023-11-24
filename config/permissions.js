/* eslint-disable no-unused-vars */
const {
  rule,
  and,
  or,
  not,
  allow,
  deny,
} = require('@coko/server/authorization')

const userIsEditorQuery = async (ctx, manuscriptId) => {
  if (!ctx.user) return false
  const user = await ctx.connectors.User.model.query().findById(ctx.user)

  if (!user) {
    return false
  }

  let query = user
    .$relatedQuery('teams')
    .where(builder =>
      builder
        .where({ role: 'seniorEditor' })
        .orWhere({ role: 'handlingEditor' })
        .orWhere({ role: 'editor' }),
    )

  // Manuscript is optional...
  if (manuscriptId) {
    query = query.where({ objectId: manuscriptId })
  }

  const rows = await query.resultSize()
  return !!rows
}

const userOwnsMessage = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    if (!ctx.user) return false

    const message = await ctx.connectors.Message.model
      .query()
      .findById(args.messageId)

    return message?.userId === ctx.user
  },
)

const getManuscriptOfFile = async (file, ctx) => {
  if (!file || !file.objectId) {
    console.error('File without objectId encountered:', file)
    return null
  }

  // The file may belong to a review or directly to a manuscript
  const review = await ctx.connectors.Review.model
    .query()
    .findById(file.objectId)

  const manuscript = await ctx.connectors.Manuscript.model
    .query()
    .findById(review ? review.manuscriptId : file.objectId)

  if (!manuscript)
    console.error('File without owner manuscript encountered:', file)

  return manuscript
}

const getLatestVersionOfManuscriptOfFile = async (file, ctx) => {
  const manuscript = await getManuscriptOfFile(file, ctx)

  if (!manuscript) return null

  const firstVersionId = manuscript.parentId || manuscript.id

  const latestVersion = await getLatestVersionOfManuscript(ctx, firstVersionId)

  return latestVersion
}

const getLatestVersionOfManuscript = async (ctx, manuscriptVersionId) => {
  const latestVersion = await ctx.connectors.Manuscript.model
    .query()
    .where({ parentId: manuscriptVersionId })
    .orWhere({ id: manuscriptVersionId })
    .orderBy('created', 'desc')
    .limit(1)

  return latestVersion[0]
}

const userIsEditor = rule({
  cache: 'contextual',
})(async (parent, args, ctx, info) => userIsEditorQuery(ctx))

const userIsMemberOfTeamWithRoleQuery = async (user, manuscriptId, role) => {
  if (!user) return false

  const query = user
    .$relatedQuery('teams')
    .where({ role })
    .andWhere({ objectId: manuscriptId, objectType: 'manuscript' })

  const rows = await query.resultSize()
  return !!rows
}

const userIsGroupManagerQuery = async ctx => {
  if (!ctx.user) return false

  const groupId = ctx.req.headers['group-id']

  const groupManagerRecord = await ctx.connectors.Team.model
    .query()
    .withGraphJoined('members')
    .findOne({ role: 'groupManager', objectId: groupId, userId: ctx.user })

  return !!groupManagerRecord
}

const userIsAdminQuery = async ctx => {
  if (!ctx.user) return false

  const adminRecord = await ctx.connectors.Team.model
    .query()
    .withGraphJoined('members')
    .findOne({ role: 'admin', global: true, userId: ctx.user })

  return !!adminRecord
}

/** Is the current user a Group Manager of the current group or an Admin? */
const userIsGmOrAdmin = rule({
  cache: 'contextual',
})(
  async (parent, args, ctx, info) =>
    (await userIsGroupManagerQuery(ctx)) || userIsAdminQuery(ctx),
)

const userIsAdmin = rule({
  cache: 'contextual',
})(async (parent, args, ctx, info) => userIsAdminQuery(ctx))

const isPublicFileFromPublishedManuscript = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    if (parent.tags && parent.tags.includes('confidential')) return false
    const manuscript = await getManuscriptOfFile(parent, ctx)
    return !!(manuscript && manuscript.published)
  },
)

const isCMSFile = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    return parent.tags && parent.tags.includes('cms')
  },
)

const isExportTemplatingFile = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    return parent.tags && parent.tags.includes('templateGroupAsset')
  },
)

const isPublicReviewFromPublishedManuscript = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    if (parent.isHiddenFromAuthor || !parent.manuscriptId) return false

    // TODO Check that all confidential fields have been stripped out. Otherwise return false.

    const manuscript = await ctx.connectors.Manuscript.model
      .query()
      .findById(parent.manuscriptId)

    return !!(manuscript && manuscript.published)
  },
)

const reviewIsByUser = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    if (!ctx.user) return false
    const user = await ctx.connectors.User.model.query().findById(ctx.user)

    const rows =
      user &&
      user.$relatedQuery('teams').where({ role: 'reviewer' }).resultSize()

    return !!rows
  },
)

const isAuthenticated = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    return !!ctx.user
  },
)

// Who can send a message to a channel?
// Configured like so now:
// if the channel is for 'all', then all associated with the manuscript can create messages
// if the channel is for 'editorial', only editors and admins can chat there
const userIsAllowedToChat = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (!ctx.user) return false

    if ((await userIsGroupManagerQuery(ctx)) || (await userIsAdminQuery(ctx)))
      return true

    const user = await ctx.connectors.User.model.query().findById(ctx.user)

    const channel = await ctx.connectors.Channel.model
      .query()
      .findById(args.channelId)

    /**
     * Chat channels are always associated with the parent manuscript
     * but we allow different teams to work on different versions.
     * Therefore, authorization is based on the latest version of the manuscript.
     *  */

    const manuscript = await getLatestVersionOfManuscript(
      ctx,
      channel.manuscriptId,
    )

    const isAuthor = await userIsMemberOfTeamWithRoleQuery(
      user,
      manuscript.id,
      'author',
    )

    const isReviewer = await userIsMemberOfTeamWithRoleQuery(
      user,
      manuscript.id,
      'reviewer',
    )

    const isEditor = await userIsEditorQuery(ctx, manuscript.id)

    if (channel.type === 'all') {
      return isAuthor || isReviewer || isEditor
    }

    if (channel.type === 'editorial') {
      return isReviewer || isEditor
    }

    return false
  },
)

const userIsReviewAuthorAndReviewIsNotCompleted = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  if (!ctx.user) return false
  let manuscriptId

  // updateReviewerTeamMemberStatus
  if (args.manuscriptId) manuscriptId = args.manuscriptId

  // updateReview
  if (!manuscriptId && args.id) {
    const review = await ctx.connectors.Review.model.query().findById(args.id)
    if (review) manuscriptId = review.manuscriptId
  }

  // updateReview DecisionForm fallback
  if (!manuscriptId && args.input && args.input.manuscriptId) {
    manuscriptId = args.input.manuscriptId
  }

  const manuscript = await ctx.connectors.Manuscript.model
    .query()
    .findById(manuscriptId)

  const team = await ctx.connectors.Team.model
    .query()
    .where({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
    })
    .first()

  if (!team) return false
  const members = await team.$relatedQuery('members').where('userId', ctx.user)
  if (members && members[0] && members[0].status !== 'completed') return true
  return false
})

const userIsEditorOfTheManuscriptOfTheReview = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  let manuscriptId

  // updateReviewerTeamMemberStatus
  if (args.manuscriptId) manuscriptId = args.manuscriptId

  // updateReview
  if (!manuscriptId && args.id) {
    const review = await ctx.connectors.Review.model.query().findById(args.id)
    if (review) manuscriptId = review.manuscriptId
  }

  // updateReview DecisionForm fallback
  if (!manuscriptId && args.input && args.input.manuscriptId) {
    manuscriptId = args.input.manuscriptId
  }

  return userIsEditorQuery(ctx, manuscriptId)
})

const userIsInvitedReviewer = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (!ctx.user) return false
    const team = await ctx.connectors.Team.model.query().findById(args.teamId)

    const member = await team
      .$relatedQuery('members')
      .where({ userId: ctx.user, status: 'invited' })
      .first()

    return !!member
  },
)

const userIsGmAndAdmin = rule({
  cache: 'contextual',
})(
  async (parent, args, ctx, info) =>
    (await userIsGroupManagerQuery(ctx)) && userIsAdminQuery(ctx),
)

const userHasAcceptedInvitation = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (!ctx.user) return false

    const teamMember = await ctx.connectors.TeamMember.model
      .query()
      .where({ userId: ctx.user, teamId: args.teamId })
      .whereIn('status', ['accepted', 'inProgress', 'completed'])
      .first()

    return !!teamMember
  },
)

const userIsAuthor = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (!ctx.user) return false

    const team = await ctx.connectors.Team.model
      .query()
      .where({
        objectId: args.id,
        role: 'author',
      })
      .first()

    if (team) {
      const author = team
        .$relatedQuery('members')
        .where({ userId: ctx.user })
        .first()

      return !!author
    }

    return false
  },
)

const userIsAuthorOfFilesAssociatedManuscript = rule({
  cache: 'no_cache',
})(async (parent, args, ctx, info) => {
  if (!ctx.user) return false
  let manuscriptId

  if (args.meta && args.meta.manuscriptId) {
    // Meta is supplied for createFile
    // eslint-disable-next-line prefer-destructuring
    manuscriptId = args.meta.manuscriptId
  } else if (args.id) {
    // id is supplied for deletion
    const file = await ctx.connectors.File.model.query().findById(args.id)
    const manuscript = await getManuscriptOfFile(file, ctx)
    manuscriptId = manuscript && manuscript.id
  }

  if (!manuscriptId) return false

  const team = await ctx.connectors.Team.model
    .query()
    .where({
      objectId: manuscriptId,
      objectType: 'manuscript',
      role: 'author',
    })
    .first()

  if (!team) return false
  const members = await team.$relatedQuery('members').where('userId', ctx.user)
  if (members && members[0]) return true
  return false
})

const userIsAuthorOfTheManuscriptOfTheFile = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (!ctx.user) return false

    if (parent.storedObjects && !parent.id) return true // only on uploading manuscript docx this will be validated

    const file = await ctx.connectors.File.model.query().findById(parent.id)
    const manuscript = await getManuscriptOfFile(file, ctx)
    if (!manuscript) return false

    const team = await ctx.connectors.Team.model
      .query()
      .where({
        objectId: manuscript.id,
        objectType: 'manuscript',
        role: 'author',
      })
      .first()

    if (!team) return false

    const members = await team
      .$relatedQuery('members')
      .where('userId', ctx.user)

    if (members && members[0]) return true
    return false
  },
)

// ¯\_(ツ)_/¯
const userIsTheReviewerOfTheManuscriptOfTheFileAndReviewNotComplete = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  if (!ctx.user) return false

  if (!parent.id) return false

  const file = await ctx.connectors.File.model.query().findById(parent.id)
  const manuscript = await getLatestVersionOfManuscriptOfFile(file, ctx)
  if (!manuscript) return false

  const team = await ctx.connectors.Team.model
    .query()
    .where({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
    })
    .first()

  if (!team) return false
  const members = await team.$relatedQuery('members').where('userId', ctx.user)
  if (members && members[0] && members[0].status !== 'completed') return true
  return false
})

const manuscriptIsPublished = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  const manuscript = await ctx.connectors.Manuscript.model
    .query()
    .select('published')
    .findById(args.id)

  return !!manuscript.published
})

const userIsCurrentUser = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    if (!ctx.user || !args.id) return false
    return ctx.user === args.id
  },
)

const permissions = {
  Query: {
    authorsActivity: or(userIsEditor, userIsGmOrAdmin),
    builtCss: isAuthenticated,
    channels: deny, // Never used
    channelsByTeamName: deny, // Never used
    config: isAuthenticated,
    convertToJats: or(userIsEditor, userIsGmOrAdmin),
    convertToPdf: or(userIsEditor, userIsGmOrAdmin),
    currentUser: isAuthenticated,
    docmap: allow,
    editorsActivity: or(userIsEditor, userIsGmOrAdmin),
    file: deny, // Never used
    files: deny, // Never used
    findByDOI: deny, // Never used
    form: isAuthenticated,
    formForPurposeAndCategory: allow,
    forms: allow,
    formsByCategory: userIsGmOrAdmin,
    getBlacklistInformation: or(userIsEditor, userIsGmOrAdmin),
    getEntityFiles: isAuthenticated,
    getInvitationsForManuscript: or(userIsEditor, userIsGmOrAdmin),
    getSpecificFiles: isAuthenticated,
    globalTeams: deny, // Never used
    group: allow,
    groups: allow,
    invitationManuscriptId: isAuthenticated,
    invitationStatus: allow,
    manuscript: or(isAuthenticated, manuscriptIsPublished),
    manuscriptChannel: deny, // Never used
    manuscripts: isAuthenticated,
    manuscriptsActivity: or(userIsEditor, userIsGmOrAdmin),
    manuscriptsPublishedSinceDate: allow,
    manuscriptsUserHasCurrentRoleIn: isAuthenticated,
    message: deny, // Never used
    messages: isAuthenticated,
    paginatedManuscripts: or(userIsEditor, userIsGmOrAdmin),
    paginatedUsers: userIsGmOrAdmin,
    publishedArtifacts: allow,
    publishedManuscript: allow,
    publishedManuscripts: allow,
    reviewersActivity: or(userIsEditor, userIsGmOrAdmin),
    searchOnCrossref: deny, // Never used
    searchUsers: isAuthenticated,
    summaryActivity: or(userIsEditor, userIsGmOrAdmin),
    systemWideDiscussionChannel: or(userIsEditor, userIsGmOrAdmin),
    tasks: userIsGmOrAdmin,
    team: deny, // Never used
    teamByName: deny, // Never used
    teams: deny, // Never used
    threadedDiscussions: isAuthenticated,
    unreviewedPreprints: allow, // This has its own token-based authentication.
    user: isAuthenticated,
    userHasTaskAlerts: isAuthenticated,
    users: or(userIsEditor, userIsGmOrAdmin),
    validateDOI: isAuthenticated,
    validateSuffix: isAuthenticated,
  },
  Mutation: {
    addEmailToBlacklist: allow, // TODO scrap this mutation and trigger its action inside updateInvitationResponse
    addReviewer: isAuthenticated,
    archiveManuscript: or(userIsEditor, userIsGmOrAdmin),
    archiveManuscripts: or(userIsEditor, userIsGmOrAdmin),
    assignTeamEditor: deny, // Never used
    assignUserAsAuthor: isAuthenticated, // TODO require the invitation ID to be sent in this mutation
    changeTopic: deny, // Never used
    completeComment: isAuthenticated,
    completeComments: isAuthenticated,
    createChannel: deny, // Never used
    createChannelFromDOI: deny, // Never used
    // createDocxToHTMLJob seems to be exposed from xsweet???
    createFile: isAuthenticated,
    createForm: userIsGmOrAdmin,
    createManuscript: isAuthenticated,
    createMessage: userIsAllowedToChat,
    createNewTaskAlerts: userIsGmOrAdmin, // Only used when test code is enabled
    createNewVersion: or(userIsAuthor, userIsEditor, userIsGmOrAdmin),
    createTeam: or(userIsEditor, userIsGmOrAdmin), // TODO scrap this mutation in favour of an 'assignEditor' mutation
    createUser: deny, // Never used
    deleteFile: isAuthenticated,
    deleteFiles: isAuthenticated,
    deleteForm: userIsGmOrAdmin,
    deleteFormElement: userIsGmOrAdmin,
    deleteManuscript: deny, // Never used
    deleteManuscripts: deny, // Never used
    deletePendingComment: isAuthenticated,
    deleteTeam: deny, // Never used
    deleteUser: userIsGmOrAdmin,
    deleteMessage: or(userOwnsMessage, userIsGmAndAdmin),
    importManuscripts: or(userIsEditor, userIsGmOrAdmin),
    loginUser: deny, // Never used
    makeDecision: or(userIsEditor, userIsGmOrAdmin),
    publishManuscript: or(userIsEditor, userIsGmOrAdmin),
    removeReviewer: or(userIsEditor, userIsGmOrAdmin),
    removeTaskAlertsForCurrentUser: isAuthenticated,
    reviewerResponse: or(userIsInvitedReviewer, userHasAcceptedInvitation),
    sendEmail: or(userIsEditor, userIsGmOrAdmin),
    setGlobalRole: userIsAdmin,
    setGroupRole: userIsGmOrAdmin,
    setShouldPublishField: or(userIsEditor, userIsGmOrAdmin),
    submitManuscript: or(userIsAuthor, userIsEditor, userIsGmOrAdmin),
    updateEmail: or(userIsCurrentUser, userIsGmOrAdmin),
    updateConfig: userIsGmOrAdmin,
    updateUsername: or(userIsCurrentUser, userIsGmOrAdmin),
    updateFile: isAuthenticated,
    updateForm: userIsGmOrAdmin,
    updateFormElement: userIsGmOrAdmin,
    updateInvitationResponse: allow,
    updateInvitationStatus: allow,
    updateManuscript: or(userIsAuthor, userIsEditor, userIsGmOrAdmin),
    updatePendingComment: isAuthenticated,
    updateReview: or(
      userIsReviewAuthorAndReviewIsNotCompleted,
      userIsEditorOfTheManuscriptOfTheReview,
      userIsEditor, // Probably not needed, but just in case
      userIsGmOrAdmin,
    ),
    updateTask: or(userIsEditor, userIsGmOrAdmin),
    updateTasks: or(userIsEditor, userIsGmOrAdmin),
    updateTaskNotification: or(userIsEditor, userIsGmOrAdmin),
    updateTeam: or(userIsEditor, userIsGmOrAdmin),
    updateTeamMember: or(userIsEditor, userIsGmOrAdmin),
    updateReviewerTeamMemberStatus: or(
      userIsReviewAuthorAndReviewIsNotCompleted,
      userIsEditorOfTheManuscriptOfTheReview,
    ),
    updateUser: userIsGmOrAdmin,
    upload: isAuthenticated,
    uploadFile: isAuthenticated,
    uploadFiles: isAuthenticated,
    updateTaskStatus: isAuthenticated,
    updateCMSPage: userIsGmOrAdmin,
    createCMSPage: userIsGmOrAdmin,
    deleteCMSPage: userIsGmOrAdmin,
    updateCMSLayout: userIsGmOrAdmin,
    rebuildFlaxSite: userIsGmOrAdmin,
    updateMessage: or(userOwnsMessage, userIsGmAndAdmin),
  },
  Subscription: {
    fileUpdated: isAuthenticated,
    filesDeleted: isAuthenticated,
    filesUploaded: isAuthenticated,
    manuscriptsImportStatus: isAuthenticated,
    messageCreated: userIsAllowedToChat,
    uploadProgress: isAuthenticated,
  },
  CurrentRole: isAuthenticated,
  Team: isAuthenticated,
  TeamMember: isAuthenticated,
  User: isAuthenticated,
  Group: allow,
  Config: allow,
  PaginatedManuscripts: allow,
  Manuscript: allow,
  File: or(
    isExportTemplatingFile,
    isCMSFile,
    isPublicFileFromPublishedManuscript,
    userIsAuthorOfTheManuscriptOfTheFile,
    userIsTheReviewerOfTheManuscriptOfTheFileAndReviewNotComplete,
    userIsEditor,
    reviewIsByUser,
    userIsGmOrAdmin,
  ),
  Form: allow,
  FormStructure: allow,
  FormElement: allow,
  FormElementOption: allow,
  FormElementValidation: allow,
  UploadResult: isAuthenticated,
  Review: or(
    isPublicReviewFromPublishedManuscript,
    reviewIsByUser,
    userIsEditor,
    userIsGmOrAdmin,
  ),
  Channel: isAuthenticated,
  Message: isAuthenticated,
  MessagesRelay: isAuthenticated,
  PageInfo: isAuthenticated,
  ManuscriptMeta: allow,
  Note: isAuthenticated,
  Identity: isAuthenticated,
  PublishedManuscript: allow,
}

module.exports = permissions
