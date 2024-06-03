const { rule, and, or, allow, deny } = require('@coko/server/authorization')

const { cachedGet } = require('../server/querycache')

const userIsEditor = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  if (!ctx.user) return false
  const manuscriptId = parent?.manuscriptId ?? args?.id
  if (!manuscriptId) throw new Error('No manuscriptId for userIsEditor!')
  return cachedGet(`userIsEditor:${ctx.user}:${manuscriptId}`)
})

// TODO Is this actually needed anywhere? Can it be replaced with userIsEditor?
const userIsEditorOfAnyManuscript = rule({
  cache: 'contextual',
})(async (parent, args, ctx, info) => {
  if (!ctx.user) return false
  return cachedGet(`userIsEditorOfAnyManuscript:${ctx.user}`)
})

const userIsGm = rule({
  cache: 'contextual',
})(async (parent, args, ctx, info) => {
  const groupId = ctx.req.headers['group-id']
  // An 'undefined' groupId header can occasionally be obtained, especially
  // in development. If we don't deal with it gracefully, it will cause
  // a crash and prevent its replacement with a correct value.
  if (!ctx.user || !groupId || groupId === 'undefined') return false
  return cachedGet(`userIsGM:${ctx.user}:${groupId}`)
})

const userIsAdmin = rule({
  cache: 'contextual',
})(async (parent, args, ctx, info) => {
  if (!ctx.user) return false
  return cachedGet(`userIsAdmin:${ctx.user}`)
})

const userOwnsMessage = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    if (!ctx.user) return false

    const message = await ctx.connectors.Message.model
      .query()
      .findById(args.messageId)

    return message?.userId === ctx.user
  },
)

const userIsViewingCollaborator = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  if (!ctx.user) return false

  const manuscriptId = parent?.manuscriptId ?? args?.id

  const collaboratorResults = await ctx.connectors.TeamMember.model
    .query()
    .leftJoin('teams', 'team_members.team_id', 'teams.id')
    .where({
      'teams.role': 'collaborator',
      'teams.object_id': manuscriptId,
      'team_members.user_id': ctx.user,
      'team_members.status': 'read',
    })

  return !!collaboratorResults.length
})

const userIsEditingCollaborator = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  if (!ctx.user) return false

  const manuscriptId = parent?.manuscriptId ?? args?.id

  const collaboratorResults = await ctx.connectors.TeamMember.model
    .query()
    .leftJoin('teams', 'team_members.team_id', 'teams.id')
    .where({
      'teams.role': 'collaborator',
      'teams.object_id': manuscriptId,
      'team_members.user_id': ctx.user,
      'team_members.status': 'write',
    })

  return !!collaboratorResults.length
})

const getLatestVersionOfManuscriptOfFile = async (file, ctx) => {
  const manuscript = await cachedGet(`msOfFile:${file.id}`)

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

const userIsMemberOfTeamWithRoleQuery = async (user, manuscriptId, role) => {
  if (!user) return false

  const query = user
    .$relatedQuery('teams')
    .where({ role })
    .andWhere({ objectId: manuscriptId, objectType: 'manuscript' })

  const rows = await query.resultSize()
  return !!rows
}

const isPublicFileFromPublishedManuscript = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (parent.tags && parent.tags.includes('confidential')) return false
    const manuscript = await cachedGet(`msOfFile:${parent.id}`)
    return !!manuscript?.published
  },
)

const isCMSFile = rule({ cache: 'strict' })(async (parent, args, ctx, info) => {
  return parent.tags && parent.tags.includes('cms')
})

const isPublishingCollection = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    return parent.tags && parent.tags.includes('publishingCollection')
  },
)

const isLogoFile = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    return parent.tags && parent.tags.includes('brandLogo')
  },
)

const isFaviconFile = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    return parent.tags && parent.tags.includes('favicon')
  },
)

const isExportTemplatingFile = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    return parent.tags && parent.tags.includes('templateGroupAsset')
  },
)

const isPublicReviewFromPublishedManuscript = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (parent.isHiddenFromAuthor || !parent.manuscriptId) return false

    // TODO Check that all confidential fields have been stripped out. Otherwise return false.

    const manuscript = await ctx.connectors.Manuscript.model
      .query()
      .findById(parent.manuscriptId)

    return !!(manuscript && manuscript.published)
  },
)

// TODO This appears only to check if the user is a reviewer of ANY manuscript!??
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

    const isUserGM = await cachedGet(
      `userIsGM:${ctx.user}:${ctx.req.headers['group-id']}`,
    )

    if (isUserGM) return true

    const isUserAdmin = await cachedGet(`userIsAdmin:${ctx.user}`)
    if (isUserAdmin) return true

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

    const isCollaborator = await userIsMemberOfTeamWithRoleQuery(
      user,
      manuscript.id,
      'collaborator',
    )

    const isEditor = await cachedGet(
      `userIsEditor:${ctx.user}:${manuscript.id}`,
    )

    if (channel.type === 'all') {
      return isAuthor || isReviewer || isEditor || isCollaborator
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
  if (!manuscriptId && args.input?.manuscriptId) {
    manuscriptId = args.input.manuscriptId
  }

  // eslint-disable-next-line no-return-await
  return cachedGet(`userIsEditor:${ctx.user}:${manuscriptId}`)
})

const userIsReviewerOrInvitedReviewerOfTheManuscript = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  if (!ctx.user || !args.id) return false

  const parentId = (
    await ctx.connectors.Manuscript.model
      .query()
      .findById(args.id)
      .select('parentId')
  )?.parentId

  const reviewerStatuses = await ctx.connectors.Manuscript.model
    .query()
    .where(builder =>
      builder.where('manuscripts.id', parentId).orWhere({ parentId }),
    )
    .joinRelated('teams')
    .join('team_members', 'team_members.teamId', 'teams.id') // joinRelated doesn't automate the 'teams.members' relation well, so we do it manually
    .where('teams.role', 'reviewer')
    .where('team_members.userId', ctx.user)
    .select('team_members.status')

  return !!reviewerStatuses.length
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

const userIsAuthorOfManuscript = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (!ctx.user || !args.id) return false

    const authorRecord = await ctx.connectors.Team.model
      .relatedQuery('members')
      .for(
        ctx.connectors.Team.model
          .query()
          .where({ objectId: args.id, role: 'author' }),
      )
      .findOne({ userId: ctx.user })

    return !!authorRecord
  },
)

// const userIsAuthorOfFilesAssociatedManuscript = rule({
//   cache: 'no_cache',
// })(async (parent, args, ctx, info) => {
//   if (!ctx.user) return false
//   let manuscriptId

//   if (args.meta && args.meta.manuscriptId) {
//     // Meta is supplied for createFile
//     // eslint-disable-next-line prefer-destructuring
//     manuscriptId = args.meta.manuscriptId
//   } else if (args.id) {
//     // id is supplied for deletion
//     const file = await ctx.connectors.File.model.query().findById(args.id)
//     const manuscript = await cachedGet(`msOfFile:${file.id}`, ctx)
//     manuscriptId = manuscript && manuscript.id
//   }

//   if (!manuscriptId) return false

//   const team = await ctx.connectors.Team.model
//     .query()
//     .where({
//       objectId: manuscriptId,
//       objectType: 'manuscript',
//       role: 'author',
//     })
//     .first()

//   if (!team) return false
//   const members = await team.$relatedQuery('members').where('userId', ctx.user)
//   if (members && members[0]) return true
//   return false
// })

const userIsAuthorOfTheManuscriptOfTheFile = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (!ctx.user) return false

    if (parent.storedObjects && !parent.id) return true // only on uploading manuscript docx this will be validated

    const file = await ctx.connectors.File.model.query().findById(parent.id)
    const manuscript = await cachedGet(`msOfFile:${file.id}`, ctx)
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

const userIsCurrentUser = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (!ctx.user || !args.id) return false
    return ctx.user === args.id
  },
)

const permissions = {
  Query: {
    authorsActivity: or(userIsGm, userIsAdmin),
    builtCss: isAuthenticated,
    config: isAuthenticated,
    convertToJats: or(userIsEditorOfAnyManuscript, userIsGm, userIsAdmin),
    convertToPdf: or(userIsEditorOfAnyManuscript, userIsGm, userIsAdmin),
    currentUser: isAuthenticated,
    docmap: allow,
    editorsActivity: or(userIsGm, userIsAdmin),
    file: deny, // Never used
    files: deny, // Never used
    form: isAuthenticated,
    formForPurposeAndCategory: allow,
    forms: allow,
    formsByCategory: or(userIsGm, userIsAdmin),
    getBlacklistInformation: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsAdmin,
    ),
    getEntityFiles: isAuthenticated,
    getInvitationsForManuscript: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsAdmin,
    ),
    getSpecificFiles: isAuthenticated,
    globalTeams: deny, // Never used
    group: allow,
    groups: allow,
    invitationManuscriptId: isAuthenticated,
    invitationStatus: allow,
    manuscript: or(
      userIsGm,
      userIsAdmin,
      manuscriptIsPublished,
      userIsEditor,
      userIsAuthorOfManuscript,
      userIsReviewerOrInvitedReviewerOfTheManuscript,
      userIsEditingCollaborator,
      userIsViewingCollaborator,
    ),
    manuscripts: isAuthenticated,
    manuscriptsActivity: or(userIsGm, userIsAdmin),
    manuscriptsPublishedSinceDate: allow,
    manuscriptsUserHasCurrentRoleIn: isAuthenticated,
    message: deny, // Never used
    messages: isAuthenticated,
    paginatedManuscripts: or(userIsGm, userIsAdmin),
    paginatedUsers: or(userIsGm, userIsAdmin),
    publishedArtifacts: allow,
    publishedManuscript: allow,
    publishedManuscripts: allow,
    publishingCollection: allow,
    reviewersActivity: or(userIsGm, userIsAdmin),
    searchUsers: isAuthenticated,
    summaryActivity: or(userIsGm, userIsAdmin),
    systemWideDiscussionChannel: or(userIsGm, userIsAdmin),
    tasks: or(userIsGm, userIsAdmin),
    team: deny, // Never used
    teams: isAuthenticated,
    threadedDiscussions: isAuthenticated,
    unreviewedPreprints: allow, // This has its own token-based authentication.
    user: isAuthenticated,
    userHasTaskAlerts: isAuthenticated,
    users: or(userIsEditorOfAnyManuscript, userIsGm, userIsAdmin),
    validateDOI: isAuthenticated,
    validateSuffix: isAuthenticated,
    versionsOfManuscriptCurrentUserIsReviewerOf: allow,
  },
  Mutation: {
    addEmailToBlacklist: allow, // TODO scrap this mutation and trigger its action inside updateInvitationResponse
    addReviewer: isAuthenticated,
    archiveManuscript: or(userIsGm, userIsAdmin),
    archiveManuscripts: or(userIsGm, userIsAdmin),
    assignTeamEditor: deny, // Never used
    assignUserAsAuthor: isAuthenticated, // TODO require the invitation ID to be sent in this mutation
    completeComment: isAuthenticated,
    completeComments: isAuthenticated,
    // createDocxToHTMLJob seems to be exposed from xsweet???
    createFile: isAuthenticated,
    createForm: or(userIsGm, userIsAdmin),
    createCollection: or(userIsGm, userIsAdmin),
    createManuscript: isAuthenticated,
    createMessage: userIsAllowedToChat,
    createNewTaskAlerts: or(userIsGm, userIsAdmin), // Only used when test code is enabled
    createNewVersion: or(
      userIsAuthorOfManuscript,
      userIsEditor,
      userIsGm,
      userIsAdmin,
    ),
    createTeam: or(userIsEditorOfAnyManuscript, userIsGm, userIsAdmin), // TODO scrap this mutation in favour of an 'assignEditor' mutation
    createUser: deny, // Never used
    deleteCollection: or(userIsGm, userIsAdmin),
    deleteFile: isAuthenticated,
    deleteFiles: isAuthenticated,
    deleteForm: or(userIsGm, userIsAdmin),
    deleteFormElement: or(userIsGm, userIsAdmin),
    deleteManuscript: deny, // Never used
    deleteManuscripts: deny, // Never used
    deletePendingComment: isAuthenticated,
    deleteTeam: deny, // Never used
    deleteUser: or(userIsGm, userIsAdmin),
    deleteMessage: or(userOwnsMessage, and(userIsGm, userIsAdmin)),
    importManuscripts: or(userIsGm, userIsAdmin),
    loginUser: deny, // Never used
    makeDecision: or(userIsEditorOfAnyManuscript, userIsGm, userIsAdmin),
    publishManuscript: or(userIsEditorOfAnyManuscript, userIsGm, userIsAdmin),
    removeReviewer: or(userIsEditorOfAnyManuscript, userIsGm, userIsAdmin),
    removeTaskAlertsForCurrentUser: isAuthenticated,
    reviewerResponse: or(userIsInvitedReviewer, userHasAcceptedInvitation),
    sendEmail: or(userIsEditorOfAnyManuscript, userIsGm, userIsAdmin),
    setGlobalRole: userIsAdmin,
    setGroupRole: or(userIsGm, userIsAdmin),
    setShouldPublishField: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsAdmin,
    ),
    submitManuscript: or(
      userIsAuthorOfManuscript,
      userIsEditor,
      userIsGm,
      userIsAdmin,
    ),
    submitAuthorProofingFeedback: userIsAuthorOfManuscript,
    unarchiveManuscripts: or(userIsGm, userIsAdmin),
    updateCollection: or(userIsGm, userIsAdmin),
    updateEmail: or(userIsCurrentUser, userIsGm, userIsAdmin),
    updateConfig: or(userIsGm, userIsAdmin),
    updateUsername: or(userIsCurrentUser, userIsGm, userIsAdmin),
    updateFile: isAuthenticated,
    updateForm: or(userIsGm, userIsAdmin),
    updateFormElement: or(userIsGm, userIsAdmin),
    updateInvitationResponse: allow,
    updateInvitationStatus: allow,
    updateManuscript: or(
      userIsAuthorOfManuscript,
      userIsEditor,
      userIsGm,
      userIsAdmin,
      userIsEditingCollaborator,
    ),
    updatePendingComment: isAuthenticated,
    updateReview: or(
      userIsReviewAuthorAndReviewIsNotCompleted,
      userIsEditorOfTheManuscriptOfTheReview,
      userIsEditorOfAnyManuscript, // Probably not needed, but just in case
      userIsGm,
      userIsAdmin,
    ),
    updateTask: or(userIsEditorOfAnyManuscript, userIsGm, userIsAdmin),
    updateTasks: or(userIsEditorOfAnyManuscript, userIsGm, userIsAdmin),
    updateTaskNotification: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsAdmin,
    ),
    updateTeam: or(userIsEditorOfAnyManuscript, userIsGm, userIsAdmin),
    updateTeamMember: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsAdmin,
      userIsAuthorOfManuscript,
    ),
    updateReviewerTeamMemberStatus: or(
      userIsReviewAuthorAndReviewIsNotCompleted,
      userIsEditorOfTheManuscriptOfTheReview,
    ),
    updateUser: or(userIsGm, userIsAdmin),
    upload: isAuthenticated,
    uploadFile: isAuthenticated,
    uploadFiles: isAuthenticated,
    updateTaskStatus: isAuthenticated,
    updateCMSPage: or(userIsGm, userIsAdmin),
    createCMSPage: or(userIsGm, userIsAdmin),
    deleteCMSPage: or(userIsGm, userIsAdmin),
    updateCMSLayout: or(userIsGm, userIsAdmin),
    rebuildFlaxSite: or(userIsGm, userIsAdmin),
    updateMessage: or(userOwnsMessage, userIsGm, userIsAdmin),
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
    isPublishingCollection,
    isLogoFile,
    isFaviconFile,
    isPublicFileFromPublishedManuscript,
    userIsAuthorOfTheManuscriptOfTheFile,
    userIsTheReviewerOfTheManuscriptOfTheFileAndReviewNotComplete,
    userIsEditorOfAnyManuscript,
    reviewIsByUser,
    userIsGm,
    userIsAdmin,
  ),
  FileNotInDb: allow,
  Form: allow,
  FormStructure: allow,
  FormElement: allow,
  FormElementOption: allow,
  FormElementValidation: allow,
  UploadResult: isAuthenticated,
  Review: or(
    isPublicReviewFromPublishedManuscript,
    reviewIsByUser,
    userIsEditorOfAnyManuscript,
    userIsGm,
    userIsAdmin,
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
