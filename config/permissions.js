/* eslint-disable no-unused-vars */
const {
  rule,
  and,
  or,
  not,
  allow,
  deny,
} = require('@coko/server/authorization')

const { shield } = require('graphql-shield')
const models = require('@pubsweet/models')

const userIsEditorQuery = async (userId, manuscriptId) => {
  const user = await models.User.query().findById(userId)

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
    query = query.where({ manuscriptId })
  }

  const rows = await query.resultSize()
  return !!rows
}

const userIsEditor = rule({
  cache: 'contextual',
})(async (parent, args, ctx, info) => userIsEditorQuery(ctx.user))

const userIsMemberOfTeamWithRoleQuery = async (userId, manuscriptId, role) => {
  const user = await models.User.query().findById(userId)

  if (!user) {
    return false
  }

  const query = user
    .$relatedQuery('teams')
    .where({ role })
    .andWhere({ manuscriptId })

  const rows = await query.resultSize()
  return !!rows
}

const userIsAdmin = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    const user = await models.User.query().findById(ctx.user)

    if (ctx.user && user.admin) {
      return true
    }

    return false
  },
)

const parentManuscriptIsPublished = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    const manuscript = await models.Manuscript.query().findById(
      parent.manuscriptId,
    )

    return !!manuscript.published
  },
)

const reviewIsByUser = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    const user = await models.User.query().findById(ctx.user)

    const rows =
      ctx.user &&
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
    const user = await models.User.query().findById(ctx.user)

    if (ctx.user && user.admin) {
      return true
    }

    const channel = await models.Channel.query().findById(args.channelId)

    const manuscript = await models.Manuscript.query().findById(
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

    const isEditor = await userIsEditorQuery(user, manuscript.id)

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
  let manuscriptId

  if (args.id) {
    const review = await models.Review.query().findById(args.id)
    if (review) manuscriptId = review.manuscriptId
  }

  if (!manuscriptId) manuscriptId = args.input.manuscriptId

  const manuscript = await models.Manuscript.query().findById(manuscriptId)

  const team = await models.Team.query()
    .where({
      manuscriptId: manuscript.id,
      role: 'reviewer',
    })
    .first()

  if (!team) return false

  const members = await team.$relatedQuery('members').where('userId', ctx.user)

  if (members && members[0] && members[0].status !== 'completed') {
    return true
  }

  return false
})

const userIsEditorOfTheManuscriptOfTheReview = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  let manuscriptId

  if (args.id) {
    const review = await models.Review.query().findById(args.id)
    if (review) manuscriptId = review.manuscriptId
  }

  if (!manuscriptId) manuscriptId = args.input.manuscriptId

  return userIsEditorQuery(ctx.user, manuscriptId)
})

const userIsInvitedReviewer = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    const team = await models.Team.query().findById(args.teamId)

    const member = await team
      .$relatedQuery('members')
      .where({ userId: ctx.user, status: 'invited' })
      .first()

    return !!member
  },
)

const userIsAuthor = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    const team = await models.Team.query()
      .where({
        manuscriptId: args.id,
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
  let manuscriptId

  if (args.meta && args.meta.manuscriptId) {
    // Meta is supplied for createFile
    // eslint-disable-next-line prefer-destructuring
    manuscriptId = args.meta.manuscriptId
  } else if (args.id) {
    // id is supplied for deletion
    const file = await models.File.query().findById(args.id)
    // eslint-disable-next-line prefer-destructuring
    manuscriptId = file.manuscriptId
  } else {
    return false
  }

  const team = await models.Team.query()
    .where({
      manuscriptId,
      role: 'author',
    })
    .first()

  if (!team) {
    return false
  }

  const members = await team.$relatedQuery('members').where('userId', ctx.user)

  if (members && members[0]) {
    return true
  }

  return false
})

const userIsAuthorOfTheManuscriptOfTheFile = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (!ctx.user) {
      return false
    }

    const manuscript = await models.File.relatedQuery('manuscript')
      .for(parent.id)
      .first()

    if (!manuscript) {
      console.error('File without owner manuscript encountered:', parent)
      return false
    }

    const team = await models.Team.query()
      .where({
        manuscriptId: manuscript.id,
        role: 'author',
      })
      .first()

    if (!team) {
      return false
    }

    const members = await team
      .$relatedQuery('members')
      .where('userId', ctx.user)

    if (members && members[0]) {
      return true
    }

    return false
  },
)

// ¯\_(ツ)_/¯
const userIsTheReviewerOfTheManuscriptOfTheFileAndReviewNotComplete = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  if (!ctx.user) {
    return false
  }

  const manuscript = await models.File.relatedQuery('manuscript')
    .for(parent.id)
    .first()

  if (!manuscript) {
    console.error('File without owner manuscript encountered:', parent)
    return false
  }

  const team = await models.Team.query()
    .where({
      manuscriptId: manuscript.id,
      role: 'reviewer',
    })
    .first()

  if (!team) return false

  const members = await team.$relatedQuery('members').where('userId', ctx.user)

  if (members && members[0] && members[0].status !== 'completed') {
    return true
  }

  return false
})

const permissions = {
  Query: {
    currentUser: isAuthenticated,
    paginatedManuscripts: userIsAdmin,
    publishedManuscripts: allow,
    manuscriptsUserHasCurrentRoleIn: isAuthenticated,
    manuscripts: allow,
    manuscript: allow,
    manuscriptsPublishedSinceDate: allow,
    publishedManuscript: allow,
    messages: allow,
    form: allow,
    forms: allow,
    formForPurpose: allow,
    user: allow,
    validateDOI: allow,
  },
  Mutation: {
    upload: isAuthenticated,
    createManuscript: isAuthenticated,
    updateManuscript: userIsAuthor,
    submitManuscript: userIsAuthor,
    createMessage: userIsAllowedToChat,
    updateReview: or(
      userIsReviewAuthorAndReviewIsNotCompleted,
      userIsEditorOfTheManuscriptOfTheReview,
    ),
    reviewerResponse: userIsInvitedReviewer,
    completeReview: or(
      userIsReviewAuthorAndReviewIsNotCompleted,
      userIsEditorOfTheManuscriptOfTheReview,
    ),
    createNewVersion: allow,
    createFile: userIsAuthorOfFilesAssociatedManuscript,
    deleteFile: userIsAuthorOfFilesAssociatedManuscript,
    deleteForm: userIsAdmin,
    createForm: userIsAdmin,
    updateForm: userIsAdmin,
    updateFormElement: userIsAdmin,
    deleteFormElement: userIsAdmin,
    updateCurrentEmail: isAuthenticated,
    updateCurrentUsername: isAuthenticated,
  },
  Subscription: {
    messageCreated: userIsAllowedToChat,
  },
  CurrentRole: allow,
  Team: allow,
  TeamMember: allow,
  User: allow,
  PaginatedManuscripts: allow,
  Manuscript: allow,
  ManuscriptVersion: allow,
  File: or(
    parentManuscriptIsPublished,
    or(
      userIsAuthorOfTheManuscriptOfTheFile,
      userIsTheReviewerOfTheManuscriptOfTheFileAndReviewNotComplete,
      userIsEditor,
      userIsAdmin,
    ),
  ),
  Form: allow,
  FormStructure: allow,
  FormElement: allow,
  FormElementOption: allow,
  FormElementValidation: allow,
  UploadResult: allow,
  Review: or(parentManuscriptIsPublished, reviewIsByUser),
  ReviewComment: allow,
  Channel: allow,
  Message: allow,
  MessagesRelay: allow,
  PageInfo: allow,
  ManuscriptMeta: allow,
  Note: allow,
  Identity: allow,
  PublishedManuscript: allow,
}

const fallbackRule = or(userIsAdmin, userIsEditor, isAuthenticated)

// We only ever need to go two levels down, so no need for recursion
const addOverrideRule = perms => {
  const adaptedPermissions = {}
  Object.keys(perms).forEach(key1 => {
    const value = perms[key1]

    if (value.constructor.name !== 'Object') {
      adaptedPermissions[key1] = or(fallbackRule, value)
    } else {
      adaptedPermissions[key1] = value
      Object.keys(value).forEach(key2 => {
        adaptedPermissions[key1][key2] = or(fallbackRule, value[key2])
      })
    }
  })
  return adaptedPermissions
}

const shieldWithPermissions = shield(addOverrideRule(permissions), {
  allowExternalErrors: false,
  debug: true,
  fallbackRule,
})

module.exports = shieldWithPermissions

// const userIsEditorOfManuscript = rule({
//   cache: 'strict',
// })(async (parent, args, ctx, info) =>
//   _userIsEditor(ctx.user, parent.manuscriptId),
// )

// const userIsAuthorOfManuscript = rule({
//   cache: 'strict',
// })(async (parent, args, ctx, info) =>
//   _userIsMemberOfTeamWithRole(ctx.user, parent.manuscriptId, 'author'),
// )

/* eslint-disable no-unused-vars */
