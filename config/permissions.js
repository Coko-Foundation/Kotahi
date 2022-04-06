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
    query = query.where({ manuscriptId })
  }

  const rows = await query.resultSize()
  return !!rows
}

const userIsEditor = rule({
  cache: 'contextual',
})(async (parent, args, ctx, info) => userIsEditorQuery(ctx))

const userIsMemberOfTeamWithRoleQuery = async (user, manuscriptId, role) => {
  if (!user) return false

  const query = user
    .$relatedQuery('teams')
    .where({ role })
    .andWhere({ manuscriptId })

  const rows = await query.resultSize()
  return !!rows
}

const userIsAdmin = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    if (!ctx.user) return false
    const user = await ctx.connectors.User.model.query().findById(ctx.user)
    if (user && user.admin) return true
    return false
  },
)

const parentManuscriptIsPublished = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    console.log(parent, 0) // eslint-disable-line no-console

    if (parent.storedObjects && !parent.objectId) return false

    let review
    if (parent.objectId) {
      const reviewComment = await ctx.connectors.ReviewComment.model
        .query()
        .findById(parent.objectId)

      if (reviewComment) {
        review = await ctx.connectors.Review.model
          .query()
          .findById(reviewComment.reviewId)
      }
    }

    const manuscript = await ctx.connectors.Manuscript.model
      .query()
      .findById(
        review ? review.manuscriptId : parent.manuscriptId || parent.objectId,
      )

    return !!manuscript.published
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
    const user = await ctx.connectors.User.model.query().findById(ctx.user)
    if (user && user.admin) return true

    const channel = await ctx.connectors.Channel.model
      .query()
      .findById(args.channelId)

    const manuscript = await ctx.connectors.Manuscript.model
      .query()
      .findById(channel.manuscriptId)

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

  if (args.id) {
    const review = await ctx.connectors.Review.model.query().findById(args.id)
    if (review) manuscriptId = review.manuscriptId
  }

  if (!manuscriptId) manuscriptId = args.input.manuscriptId

  const manuscript = await ctx.connectors.Manuscript.model
    .query()
    .findById(manuscriptId)

  const team = await ctx.connectors.Team.model
    .query()
    .where({
      manuscriptId: manuscript.id,
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

  if (args.id) {
    const review = await ctx.connectors.Review.model.query().findById(args.id)
    if (review) manuscriptId = review.manuscriptId
  }

  if (!manuscriptId) manuscriptId = args.input.manuscriptId
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

const userIsAuthor = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (!ctx.user) return false

    const team = await ctx.connectors.Team.model
      .query()
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
  if (!ctx.user) return false
  let manuscriptId

  console.log(args) // eslint-disable-line no-console

  if (args.meta && args.meta.manuscriptId) {
    // Meta is supplied for createFile
    // eslint-disable-next-line prefer-destructuring
    manuscriptId = args.meta.manuscriptId
  } else if (args.id) {
    // id is supplied for deletion
    const file = await ctx.connectors.File.model.query().findById(args.id)
    // eslint-disable-next-line prefer-destructuring
    const manuscript = await ctx.connectors.Manuscript.model
      .query()
      .findById(file.objectId)
    const review = await ctx.connectors.Review.model
      .query()
      .findById(file.objectId)
    manuscriptId = manuscript.id || review.manuscriptId
  } else {
    return false
  }

  const team = await ctx.connectors.Team.model
    .query()
    .where({
      manuscriptId,
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

    console.log(parent, 1) // eslint-disable-line no-console

    if (parent.storedObjects && !parent.id) return true

    const file = await ctx.connectors.File.model.query().findById(parent.id)

    const reviewComment = await ctx.connectors.ReviewComment.model
      .query()
      .findById(file.objectId)
    let review

    console.log(reviewComment) // eslint-disable-line no-console

    if (reviewComment) {
      review = await ctx.connectors.Review.model
        .query()
        .findById(reviewComment.reviewId)

      console.log(review) // eslint-disable-line no-console
    }


    const manuscript = await ctx.connectors.Manuscript.model
      .query()
      .findById(review ? review.manuscriptId : file.objectId)

    if (!manuscript) {
      console.error('File without owner manuscript encountered:', parent)
      return false
    }

    const team = await ctx.connectors.Team.model
      .query()
      .where({
        manuscriptId: manuscript.id,
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

  console.log(parent, 2) // eslint-disable-line no-console

  if (!parent.id) return false

  const file = await ctx.connectors.File.model.query().findById(parent.id)

  const reviewComment = await ctx.connectors.ReviewComment.model
    .query()
    .findById(file.objectId)

  let review

  console.log(reviewComment) // eslint-disable-line no-console

  if(reviewComment) {
    review = await ctx.connectors.Review.model
      .query()
      .findById(reviewComment.reviewId)

    console.log(review) // eslint-disable-line no-console
  }


  const manuscript = await ctx.connectors.Manuscript.model
    .query()
    .findById(review ? review.manuscriptId : file.objectId)

  if (!manuscript) {
    console.error('File without owner manuscript encountered:', parent)
    return false
  }

  const team = await ctx.connectors.Team.model
    .query()
    .where({
      manuscriptId: manuscript.id,
      role: 'reviewer',
    })
    .first()

  if (!team) return false
  const members = await team.$relatedQuery('members').where('userId', ctx.user)
  if (members && members[0] && members[0].status !== 'completed') return true
  return false
})

const permissions = {
  Query: {
    currentUser: isAuthenticated,
    paginatedManuscripts: userIsAdmin,
    publishedManuscripts: allow,
    manuscriptsUserHasCurrentRoleIn: isAuthenticated,
    manuscripts: isAuthenticated,
    manuscript: isAuthenticated,
    manuscriptsPublishedSinceDate: allow,
    publishedManuscript: allow,
    messages: isAuthenticated,
    form: isAuthenticated,
    forms: userIsAdmin,
    formForPurpose: allow,
    user: isAuthenticated,
    users: isAuthenticated,
    validateDOI: isAuthenticated,
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
    createNewVersion: or(userIsAuthor, userIsEditor, userIsAdmin),
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
  CurrentRole: isAuthenticated,
  Team: isAuthenticated,
  TeamMember: isAuthenticated,
  User: isAuthenticated,
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
  UploadResult: isAuthenticated,
  Review: or(parentManuscriptIsPublished, reviewIsByUser),
  ReviewComment: isAuthenticated,
  Channel: isAuthenticated,
  Message: isAuthenticated,
  MessagesRelay: isAuthenticated,
  PageInfo: isAuthenticated,
  ManuscriptMeta: allow,
  Note: isAuthenticated,
  Identity: isAuthenticated,
  PublishedManuscript: allow,
}

const fallbackRule = or(userIsAdmin, userIsEditor)

/** This is used to generate a new permissions structure in which EVERY rule is modified to: or(fallbackRule, originalRule)
 * TODO: this makes permissions harder to follow. We should instead just set sensible rules from the outset and not perform this step!
 * We only ever need to go two levels down, so no need for recursion
 */
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

const permissionsWithOverride = addOverrideRule(permissions)

module.exports = permissionsWithOverride
