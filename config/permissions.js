// eslint-disable-next-line no-unused-vars
const { rule, shield, and, or, not, allow, deny } = require('graphql-shield')

const _userIsEditor = async (user, manuscriptId) => {
  if (!user) {
    return false
  }

  let query = user
    .$relatedQuery('teams')
    .where(builder =>
      builder
        .where({ role: 'seniorEditor' })
        .orWhere({ role: 'handlingEditor' }),
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
})(async (parent, args, ctx, info) => _userIsEditor(ctx.user))

const _userIsMemberOfTeamWithRole = async (user, manuscriptId, role) => {
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
  async (parent, args, ctx, info) => ctx.user && ctx.user.admin,
)

const parent_manuscript_is_published = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    const manuscript = await ctx.models.Manuscript.query().findById(
      parent.manuscriptId,
    )
    return !!manuscript.published
  },
)

const review_is_by_current_user = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    const rows =
      ctx.user &&
      ctx.user
        .$relatedQuery('teams')
        .where({ role: 'reviewer' })
        .resultSize()

    return !!rows
  },
)
const isAuthenticated = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => !!ctx.user,
)

// Who can send a message to a channel?
// Configured like so now:
// if the channel is for 'all', then all associated with the manuscript can create messages
// if the channel is for 'editorial', only editors and admins can chat there
const userIsAllowedToChat = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    if (ctx.user && ctx.user.admin) {
      return true
    }
    const channel = await ctx.models.Channel.query().findById(args.channelId)
    const manuscript = await ctx.models.Manuscript.query().findById(
      channel.manuscriptId,
    )

    const isAuthor = await _userIsMemberOfTeamWithRole(
      ctx.user,
      manuscript.id,
      'author',
    )
    const isReviewer = await _userIsMemberOfTeamWithRole(
      ctx.user,
      manuscript.id,
      'reviewer',
    )
    const isEditor = await _userIsEditor(ctx.user, manuscript.id)

    if (channel.type === 'all') {
      return isAuthor || isReviewer || isEditor
    } else if (channel.type === 'editorial') {
      return isReviewer || isEditor
    }
  },
)

const user_is_review_author_and_review_is_not_completed = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  let manuscriptId
  if (args.id) {
    ;({ manuscriptId } = await ctx.models.Review.query().findById(args.id))
  } else {
    ;({ manuscriptId } = args.input)
  }

  const manuscript = await ctx.models.Manuscript.query().findById(manuscriptId)
  const team = await ctx.models.Team.query()
    .where({
      manuscriptId: manuscript.id,
      role: 'reviewer',
    })
    .first()
  if (!team) return false

  const members = await team
    .$relatedQuery('members')
    .where('userId', ctx.user.id)

  if (members && members[0] && members[0].status !== 'completed') {
    return true
  }

  return false
})

const user_is_editor_of_the_manuscript_of_the_review = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  let manuscriptId
  if (args.id) {
    ;({ manuscriptId } = await ctx.models.Review.query().findById(args.id))
  } else {
    ;({ manuscriptId } = args.input)
  }

  return _userIsEditor(ctx.user, manuscriptId)
})

const user_is_invited_reviewer = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    const team = await ctx.models.Team.query().findById(args.teamId)
    const member = await team
      .$relatedQuery('members')
      .where({ userId: ctx.user.id, status: 'invited' })
      .first()

    return !!member
  },
)

const user_is_author = rule({ cache: 'strict' })(
  async (parent, args, ctx, info) => {
    const team = await ctx.models.Team.query()
      .where({
        manuscriptId: args.id,
        role: 'author',
      })
      .first()
    const author = team
      .$relatedQuery('members')
      .where({ userId: ctx.user.id })
      .first()

    return !!author
  },
)

// ¯\_(ツ)_/¯
const current_user_is_the_reviewer_of_the_manuscript_of_the_file_and_review_not_complete = rule(
  {
    cache: 'strict',
  },
)(async (parent, args, ctx, info) => {
  const manuscript = await ctx.models.File.relatedQuery('manuscript')
    .for(parent.id)
    .first()

  const team = await ctx.models.Team.query()
    .where({
      manuscriptId: manuscript.id,
      role: 'reviewer',
    })
    .first()

  if (!team) {
    return false
  }
  const members = await team
    .$relatedQuery('members')
    .where('userId', ctx.user.id)

  if (members && members[0] && members[0].status !== 'completed') {
    return true
  }

  return false
})

const permissions = {
  Query: {
    currentUser: isAuthenticated,
    paginatedManuscripts: userIsAdmin,
    detailsForURL: allow,
    publishedManuscripts: allow,
    manuscripts: allow,
    manuscript: allow,
    messages: allow,
    getFile: allow, // this is a query that gets the form
    user: allow,
  },
  Mutation: {
    createManuscript: isAuthenticated,
    updateManuscript: user_is_author,
    submitManuscript: user_is_author,
    createMessage: userIsAllowedToChat,
    updateReview: or(
      user_is_review_author_and_review_is_not_completed,
      user_is_editor_of_the_manuscript_of_the_review,
    ),
    reviewerResponse: user_is_invited_reviewer,
    completeReview: or(
      user_is_review_author_and_review_is_not_completed,
      user_is_editor_of_the_manuscript_of_the_review,
    ),
    createNewVersion: allow,
  },
  Subscription: {
    messageCreated: userIsAllowedToChat,
  },
  CurrentRole: allow,
  Team: allow,
  TeamMember: allow,
  URLMetadata: allow,
  User: allow,
  PaginatedManuscripts: allow,
  Manuscript: allow,
  ManuscriptVersion: allow,
  File: or(
    parent_manuscript_is_published,
    or(
      current_user_is_the_reviewer_of_the_manuscript_of_the_file_and_review_not_complete,
      userIsEditor,
      userIsAdmin,
    ),
  ),
  Review: or(parent_manuscript_is_published, review_is_by_current_user),
  ReviewComment: allow,
  Channel: allow,
  Message: allow,
  MessagesRelay: allow,
  PageInfo: allow,
  ManuscriptMeta: allow,
  Note: allow,
  Identity: allow,
}

const fallbackRule = or(userIsAdmin, userIsEditor)

// We only ever need to go two levels down, so no need for recursion
const addOverrideRule = permissions => {
  const adaptedPermissions = {}
  Object.keys(permissions).forEach(key1 => {
    const value = permissions[key1]
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
