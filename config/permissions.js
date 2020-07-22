const { rule, shield, and, or, not, allow, deny } = require('graphql-shield')

const isAdmin = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => ctx.user.admin,
)

const isEditor = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    const rows = ctx.user
      .$relatedQuery('teams')
      .where({ role: 'seniorEditor' })
      .orWhere({ role: 'handlingEditor' })
      .resultSize()
    return rows !== 0
  },
)

const isAuthenticated = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => !!ctx.user,
)

const permissions = shield(
  {
    Query: {
      paginatedManuscripts: isAdmin,
    },
    Mutation: {
      createManuscript: isAuthenticated,
    },
    // Fruit: isAuthenticated,
    // Customer: isAdmin,
  },
  {
    allowExternalErrors: true,
    fallbackRule: or(isAdmin, isEditor),
  },
)

module.exports = permissions
