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

const parentManuscriptIsPublished = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    const manuscript = await ctx.models.Manuscript.query().findById(
      parent.manuscriptId,
    )
    return !!manuscript.published
  },
)

const reviewIsByCurrentUser = rule({ cache: 'contextual' })(
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
  const review = await ctx.models.Review.query().findById(args.id)
  const manuscript = await ctx.models.Manuscript.query().findById(
    review.manuscriptId,
  )
  const team = await ctx.models.Team.query()
    .where({
      manuscriptId: manuscript.id,
      role: 'reviewer',
    })
    .first()
  const members = await team
    .$relatedQuery('members')
    .where('userId', ctx.user.id)

  if (members && members[0] && members[0].status !== 'completed') {
    return true
  }

  return false
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

const permissions = shield(
  {
    Query: {
      currentUser: isAuthenticated,
      paginatedManuscripts: userIsAdmin,
      detailsForURL: allow,
      publishedManuscripts: allow,
      manuscripts: allow,
      manuscript: allow,
      messages: allow,
      getFile: allow,
    },
    Mutation: {
      createManuscript: isAuthenticated,
      updateManuscript: user_is_author,
      createMessage: userIsAllowedToChat,
      updateReview: user_is_review_author_and_review_is_not_completed,
      reviewerResponse: user_is_invited_reviewer,
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
    Review: or(parentManuscriptIsPublished, reviewIsByCurrentUser),
    ReviewComment: allow,
    Channel: allow,
    Message: allow,
    MessagesRelay: allow,
    PageInfo: allow,
    ManuscriptMeta: allow,
    Note: allow,
    Identity: allow,
  },
  {
    allowExternalErrors: false,
    debug: true,
    fallbackRule: or(userIsAdmin, userIsEditor),
  },
)

module.exports = permissions

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
