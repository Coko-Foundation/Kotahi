/* eslint-disable global-require */

// Shield's `race` rule is misnamed, as it doesn't race the different rules but applies them sequentially until one succeeds. `or`, on the other hand, applies all rules in parallel.
const { race: lazyOr } = require('graphql-shield')
const { rule, and, or, allow, deny } = require('@coko/server/authorization')

const { cachedGet } = require('../server/querycache')

const userIsEditor = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  if (!ctx.userId) return false
  const manuscriptId = parent?.manuscriptId ?? args?.id
  if (!manuscriptId) throw new Error('No manuscriptId for userIsEditor!')
  return cachedGet(`userIsEditor:${ctx.userId}:${manuscriptId}`)
})

// TODO Is this actually needed anywhere? Can it be replaced with userIsEditor?
const userIsEditorOfAnyManuscript = rule({
  cache: 'contextual',
})(async (parent, args, ctx, info) => {
  if (!ctx.userId) return false
  return cachedGet(`userIsEditorOfAnyManuscript:${ctx.userId}`)
})

const userIsGm = rule({
  cache: 'contextual',
})(async (parent, args, ctx, info) => {
  const groupId = ctx.req.headers['group-id']
  // An 'undefined' groupId header can occasionally be obtained, especially
  // in development. If we don't deal with it gracefully, it will cause
  // a crash and prevent its replacement with a correct value.
  if (!ctx.userId || !groupId || groupId === 'undefined') return false
  return cachedGet(`userIsGM:${ctx.userId}:${groupId}`)
})

const userIsAdmin = rule({
  cache: 'contextual',
})(async (parent, args, ctx, info) => {
  if (!ctx.userId) return false
  return cachedGet(`userIsAdmin:${ctx.userId}`)
})

const userOwnsMessage = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    if (!ctx.userId) return false

    const Message = require('../models/message/message.model')

    const message = await Message.query().findById(args.messageId)

    return message?.userId === ctx.userId
  },
)

const getLatestVersionOfManuscriptOfFile = async (file, ctx) => {
  const manuscript = await cachedGet(`msOfFile:${file.id}`)

  if (!manuscript) return null

  const firstVersionId = manuscript.parentId || manuscript.id
  const latestVersion = await getLatestVersionOfManuscript(ctx, firstVersionId)

  return latestVersion
}

const getLatestVersionOfManuscript = async (ctx, manuscriptVersionId) => {
  const Manuscript = require('../models/manuscript/manuscript.model')

  const latestVersion = await Manuscript.query()
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

    const Manuscript = require('../models/manuscript/manuscript.model')

    const manuscript = await Manuscript.query().findById(parent.manuscriptId)

    return !!(manuscript && manuscript.published)
  },
)

// TODO This appears only to check if the user is a reviewer of ANY manuscript!??
const reviewIsByUser = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    if (!ctx.userId) return false

    const User = require('../models/user/user.model')

    const user = await User.query().findById(ctx.userId)

    const rows =
      user &&
      user.$relatedQuery('teams').where({ role: 'reviewer' }).resultSize()

    return !!rows
  },
)

const isAuthenticated = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    return !!ctx.userId
  },
)

// Who can send a message to a channel?
// Configured like so now:
// if the channel is for 'all', then all associated with the manuscript can create messages
// if the channel is for 'editorial', only editors and admins can chat there
const userIsAllowedToChat = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (!ctx.userId) return false

    const User = require('../models/user/user.model')
    const Channel = require('../models/channel/channel.model')

    const isUserGM = await cachedGet(
      `userIsGM:${ctx.userId}:${ctx.req.headers['group-id']}`,
    )

    if (isUserGM) return true

    const isUserAdmin = await cachedGet(`userIsAdmin:${ctx.userId}`)
    if (isUserAdmin) return true

    const user = await User.query().findById(ctx.userId)

    const channel = await Channel.query().findById(args.channelId)

    /**
     * Chat channels are always associated with the parent manuscript
     * but we allow different teams to work on different versions.
     * Therefore, authorization is based on the latest version of the manuscript.
     */

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

    const isEditor = await cachedGet(
      `userIsEditor:${ctx.userId}:${manuscript.id}`,
    )

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
  if (!ctx.userId) return false
  let manuscriptId

  const Review = require('../models/review/review.model')
  const Team = require('../models/team/team.model')
  const TeamMember = require('../models/teamMember/teamMember.model')

  // updateReviewerTeamMemberStatus
  if (args.manuscriptId) manuscriptId = args.manuscriptId

  // updateReview
  if (!manuscriptId && args.id) {
    const review = await Review.query().findById(args.id)
    if (review) manuscriptId = review.manuscriptId
  }

  // updateReview DecisionForm fallback
  if (!manuscriptId && args.input && args.input.manuscriptId) {
    manuscriptId = args.input.manuscriptId
  }

  const Manuscript = require('../models/manuscript/manuscript.model')

  const manuscript = await Manuscript.query().findById(manuscriptId)

  const teams = await Team.query()
    .where({
      objectId: manuscript.id,
      objectType: 'manuscript',
    })
    .andWhere(builder => {
      builder.whereIn('role', ['reviewer', 'collaborativeReviewer'])
    })

  if (!teams) return false

  const member = await TeamMember.query()
    .whereIn(
      'teamId',
      teams.map(t => t.id),
    )
    .andWhere(builder => {
      builder.where({ userId: ctx.userId })
    })
    .first()

  if (member && member.status !== 'completed') return true
  return false
})

const userIsEditorOfTheManuscriptOfTheReview = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  if (!ctx.userId) return false
  let manuscriptId
  const Review = require('../models/review/review.model')

  // updateReviewerTeamMemberStatus
  if (args.manuscriptId) manuscriptId = args.manuscriptId

  // updateReview
  if (!manuscriptId && args.id) {
    const review = await Review.query().findById(args.id)
    if (review) manuscriptId = review.manuscriptId
  }

  // updateReview DecisionForm fallback
  if (!manuscriptId && args.input?.manuscriptId) {
    manuscriptId = args.input.manuscriptId
  }

  // eslint-disable-next-line no-return-await
  return cachedGet(`userIsEditor:${ctx.userId}:${manuscriptId}`)
})

const userIsReviewerOrInvitedReviewerOfTheManuscript = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  if (!ctx.userId || !args.id) return false

  const Manuscript = require('../models/manuscript/manuscript.model')

  const parentId = (
    await Manuscript.query().findById(args.id).select('parentId')
  )?.parentId

  const reviewerStatuses = await Manuscript.query()
    .where(builder =>
      builder.where('manuscripts.id', parentId).orWhere({ parentId }),
    )
    .joinRelated('teams')
    .join('team_members', 'team_members.teamId', 'teams.id') // joinRelated doesn't automate the 'teams.members' relation well, so we do it manually
    .whereIn('teams.role', ['reviewer', 'collaborativeReviewer'])
    .where('team_members.userId', ctx.userId)
    .select('team_members.status')

  return !!reviewerStatuses.length
})

const userIsInvitedReviewer = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (!ctx.userId) return false
    const Team = require('../models/team/team.model')

    const team = await Team.query().findById(args.teamId)

    const member = await team
      .$relatedQuery('members')
      .where({ userId: ctx.userId, status: 'invited' })
      .first()

    return !!member
  },
)

const userHasAcceptedInvitation = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (!ctx.userId) return false
    const TeamMember = require('../models/teamMember/teamMember.model')

    const teamMember = await TeamMember.query()
      .where({ userId: ctx.userId, teamId: args.teamId })
      .whereIn('status', ['accepted', 'inProgress', 'completed'])
      .first()

    return !!teamMember
  },
)

const userIsAuthorOfManuscript = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (!ctx.userId || !args.id) return false

    const Team = require('../models/team/team.model')

    const authorRecord = await Team.relatedQuery('members')
      .for(Team.query().where({ objectId: args.id, role: 'author' }))
      .findOne({ userId: ctx.userId })

    return !!authorRecord
  },
)

// const userIsAuthorOfFilesAssociatedManuscript = rule({
//   cache: 'no_cache',
// })(async (parent, args, ctx, info) => {
//   if (!ctx.userId) return false
//   let manuscriptId

//   if (args.meta && args.meta.manuscriptId) {
//     // Meta is supplied for createFile
//     // eslint-disable-next-line prefer-destructuring
//     manuscriptId = args.meta.manuscriptId
//   } else if (args.id) {
//     // id is supplied for deletion
//     const file = await File.query().findById(args.id)
//     const manuscript = await cachedGet(`msOfFile:${file.id}`, ctx)
//     manuscriptId = manuscript && manuscript.id
//   }

//   if (!manuscriptId) return false

//   const team = await Team
//     .query()
//     .where({
//       objectId: manuscriptId,
//       objectType: 'manuscript',
//       role: 'author',
//     })
//     .first()

//   if (!team) return false
//   const members = await team.$relatedQuery('members').where('userId', ctx.userId)
//   if (members && members[0]) return true
//   return false
// })

const userIsAuthorOfTheManuscriptOfTheFile = rule({ cache: 'strict' })(
  async (file, args, ctx, info) => {
    if (!ctx.userId) return false

    if (file.storedObjects && !file.id) return true // only on uploading manuscript docx this will be validated

    const Team = require('../models/team/team.model')

    const manuscript = await cachedGet(`msOfFile:${file.id}`, ctx)
    if (!manuscript) return false

    const team = await Team.query()
      .where({
        objectId: manuscript.id,
        objectType: 'manuscript',
        role: 'author',
      })
      .first()

    if (!team) return false

    const members = await team
      .$relatedQuery('members')
      .where('userId', ctx.userId)

    if (members && members[0]) return true
    return false
  },
)

// ¯\_(ツ)_/¯
const userIsTheReviewerOfTheManuscriptOfTheFileAndReviewNotComplete = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  if (!ctx.userId) return false
  if (!parent.id) return false

  const { File } = require('@coko/server')
  const Team = require('../models/team/team.model')

  const file = await File.query().findById(parent.id)
  const manuscript = await getLatestVersionOfManuscriptOfFile(file, ctx)
  if (!manuscript) return false

  const team = await Team.query()
    .where({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
    })
    .first()

  if (!team) return false

  const members = await team
    .$relatedQuery('members')
    .where('userId', ctx.userId)

  if (members && members[0] && members[0].status !== 'completed') return true
  return false
})

const manuscriptIsPublished = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  const Manuscript = require('../models/manuscript/manuscript.model')

  const manuscript = await Manuscript.query()
    .select('published')
    .findById(args.id)

  return !!manuscript.published
})

const userIsCurrentUser = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (!ctx.userId || !args.id) return false
    return ctx.userId === args.id
  },
)

const isForManuscriptsPublishedSinceDateQuery = rule()(
  async (parent, args, ctx, info) => {
    let { path } = info

    while (path) {
      if (path.key === 'manuscriptsPublishedSinceDate') return true
      path = path.prev
    }

    return false
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
    ),
    manuscripts: isAuthenticated,
    manuscriptsActivity: or(userIsGm, userIsAdmin),
    manuscriptsPublishedSinceDate: allow,
    manuscriptsUserHasCurrentRoleIn: isAuthenticated,
    message: deny, // Never used
    messages: isAuthenticated,
    orcidValidate: isAuthenticated,
    paginatedManuscripts: or(userIsGm, userIsAdmin),
    paginatedUsers: or(userIsGm, userIsAdmin),
    publishedArtifacts: allow,
    publishedManuscript: allow,
    publishedManuscripts: allow,
    publishingCollection: allow,
    reviewersActivity: or(userIsGm, userIsAdmin),
    searchRor: isAuthenticated,
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
    updateTeamMember: or(userIsEditorOfAnyManuscript, userIsGm, userIsAdmin),
    updateReviewerTeamMemberStatus: or(
      userIsReviewAuthorAndReviewIsNotCompleted,
      userIsEditorOfTheManuscriptOfTheReview,
    ),
    lockUnlockCollaborativeReview: or(
      userIsGm,
      userIsAdmin,
      userIsReviewAuthorAndReviewIsNotCompleted,
      userIsEditorOfTheManuscriptOfTheReview,
    ),
    updateUser: or(userIsGm, userIsAdmin),
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
    reviewFormUpdated: isAuthenticated,
    manuscriptsImportStatus: isAuthenticated,
    /**
     * This was not being triggered at all before the v3 upgrade.
     * It doesn't work because userIsAllowedToChat dependends on req, and req
     * is not in the context for subscriptions.
     */
    // messageCreated: userIsAllowedToChat,
    messageCreated: isAuthenticated,
  },
  CurrentRole: isAuthenticated,
  Team: isAuthenticated,
  TeamMember: isAuthenticated,
  User: isAuthenticated,
  Group: allow,
  Config: allow,
  PaginatedManuscripts: allow,
  Manuscript: allow,
  File: lazyOr(
    isForManuscriptsPublishedSinceDateQuery,
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
