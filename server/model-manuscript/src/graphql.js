const merge = require('lodash/merge')
const { ref, raw } = require('objection')
const detailsForURLResolver = require('./detailsForURLResolver')

const ManuscriptResolvers = ({ isVersion }) => {
  const resolvers = {
    submission(parent) {
      return JSON.stringify(parent.submission)
    },
    async reviews(parent, _, ctx) {
      return parent.reviews
        ? parent.reviews
        : (
            await ctx.models.Manuscript.query().findById(parent.id)
          ).$relatedQuery('reviews')
    },
    async teams(parent, _, ctx) {
      return parent.teams
        ? parent.teams
        : (
            await ctx.models.Manuscript.query().findById(parent.id)
          ).$relatedQuery('teams')
    },
    async files(parent, _, ctx) {
      return parent.files
        ? parent.files
        : (
            await ctx.models.Manuscript.query().findById(parent.id)
          ).$relatedQuery('files')
    },

    meta(parent) {
      return { ...parent.meta, manuscriptId: parent.id }
    },
  }

  if (!isVersion) {
    resolvers.manuscriptVersions = async (parent, _, ctx) => {
      if (!parent.manuscriptVersions.length) {
        return ctx.models.Manuscript.relatedQuery('manuscriptVersions')
          .for(parent.id)
          .orderBy('created', 'desc')
      }

      return parent.manuscriptVersions
    }
  }

  return resolvers
}

const commonUpdateManuscript = async (_, { id, input }, ctx) => {
  const manuscriptDelta = JSON.parse(input)
  const manuscript = await ctx.models.Manuscript.query().findById(id)
  const updatedManuscript = merge({}, manuscript, manuscriptDelta)

  // if (manuscript.status === 'revise') {
  //   return manuscript.createNewVersion(update)
  // }
  return ctx.models.Manuscript.query().updateAndFetchById(id, updatedManuscript)
}

const resolvers = {
  Mutation: {
    async createManuscript(_, vars, ctx) {
      const { meta, files } = vars.input

      // We want the submission information to be stored as JSONB
      // but we want the input to come in as a JSON string
      const submission = vars.input.submission
        ? JSON.parse(vars.input.submission)
        : {}

      const emptyManuscript = {
        meta: Object.assign(meta, {
          notes: [
            {
              notesType: 'fundingAcknowledgement',
              content: '',
            },
            {
              notesType: 'specialInstructions',
              content: '',
            },
          ],
        }),
        status: 'new',
        submission,
        submitterId: ctx.user.id,
        // Create two channels: 1. free for all involved, 2. editorial
        channels: [
          {
            topic: 'Manuscript discussion',
            type: 'all',
          },
          {
            topic: 'Editorial discussion',
            type: 'editorial',
          },
        ],
        files: files.map(file => {
          return { ...file, fileType: 'manuscript' }
        }),
        reviews: [],
        teams: [
          {
            role: 'author',
            name: 'Author',
            members: [{ user: { id: ctx.user.id } }],
          },
        ],
      }

      const manuscript = await ctx.models.Manuscript.query().upsertGraphAndFetch(
        emptyManuscript,
        { relate: true },
      )

      manuscript.manuscriptVersions = []
      return manuscript
    },
    async deleteManuscript(_, { id }, ctx) {
      const toDeleteList = []
      const manuscript = await ctx.models.Manuscript.find(id)

      toDeleteList.push(manuscript.id)

      if (manuscript.parentId) {
        const parentManuscripts = await ctx.models.Manuscript.findByField(
          'parent_id',
          manuscript.parentId,
        )

        parentManuscripts.forEach(ms => {
          toDeleteList.push(ms.id)
        })
      }

      // Delete Manuscript
      if (toDeleteList.length > 0) {
        await Promise.all(
          toDeleteList.map(toDeleteItem =>
            ctx.models.Manuscript.query().deleteById(toDeleteItem),
          ),
        )
      }

      return id
    },
    async reviewerResponse(_, { action, teamId }, context) {
      // eslint-disable-next-line global-require
      const { TeamModel, ReviewModel } = require('@pubsweet/models') // Pubsweet models may initially be undefined, so we require only when resolver runs.

      if (action !== 'accepted' && action !== 'rejected')
        throw new Error(
          `Invalid action (revieweResponse): Must be either "accepted" or "rejected"`,
        )

      const team = await TeamModel.query().findById(teamId).eager('members')
      if (!team) throw new Error('No team was found')

      for (let i = 0; i < team.members.length; i += 1) {
        if (team.members[i].userId === context.user.id)
          team.members[i].status = action
      }

      await new TeamModel(team).saveGraph()

      if (action === 'accepted') {
        const review = {
          recommendation: '',
          isDecision: false,
          userId: context.user.id,
          manuscriptId: team.manuscriptId,
        }

        await new ReviewModel(review).save()
      }

      return team
    },
    async updateManuscript(_, { id, input }, ctx) {
      return commonUpdateManuscript(_, { id, input }, ctx) // Currently submitManuscript and updateManuscript have identical action
    },

    async createNewVersion(_, { id }, ctx) {
      const manuscript = await ctx.models.Manuscript.query().findById(id)
      return manuscript.createNewVersion()
    },
    async submitManuscript(_, { id, input }, ctx) {
      return commonUpdateManuscript(_, { id, input }, ctx) // Currently submitManuscript and updateManuscript have identical action
    },

    async makeDecision(_, { id, decision }, ctx) {
      const manuscript = await ctx.models.Manuscript.query().findById(id)
      manuscript.decision = decision

      manuscript.status = decision

      return manuscript.save()
    },
    async addReviewer(_, { manuscriptId, userId }, ctx) {
      const manuscript = await ctx.models.Manuscript.query().findById(
        manuscriptId,
      )

      const existingTeam = await manuscript
        .$relatedQuery('teams')
        .where('role', 'reviewer')
        .first()

      // Add the reviewer to the existing team of reviewers
      if (existingTeam) {
        const reviewerExists =
          (await existingTeam
            .$relatedQuery('users')
            .where('users.id', userId)
            .resultSize()) > 0

        if (!reviewerExists) {
          await new ctx.models.TeamMember({
            teamId: existingTeam.id,
            status: 'invited',
            userId,
          }).save()
        }

        return existingTeam.$query().eager('members.[user]')
      }

      // Create a new team of reviewers if it doesn't exist
      const newTeam = await new ctx.models.Team({
        manuscriptId,
        members: [{ status: 'invited', userId }],
        role: 'reviewer',
        name: 'Reviewers',
      }).saveGraph()

      return newTeam
    },
    async removeReviewer(_, { manuscriptId, userId }, ctx) {
      const manuscript = await ctx.models.Manuscript.query().findById(
        manuscriptId,
      )

      const reviewerTeam = await manuscript
        .$relatedQuery('teams')
        .where('role', 'reviewer')
        .first()

      await ctx.models.TeamMember.query()
        .where({
          userId,
          teamId: reviewerTeam.id,
        })
        .delete()

      return reviewerTeam.$query().eager('members.[user]')
    },
    async publishManuscript(_, { id }, ctx) {
      let manuscript = await ctx.models.Manuscript.query().findById(id)

      if (!manuscript.published) {
        manuscript = ctx.models.Manuscript.query().updateAndFetchById(id, {
          published: new Date(),
        })
      }

      return manuscript
    },
  },
  Query: {
    async manuscript(_, { id }, ctx) {
      // eslint-disable-next-line global-require
      const ManuscriptModel = require('./manuscript') // Pubsweet models may initially be undefined, so we require only when resolver runs.

      const manuscript = await ManuscriptModel.query()
        .findById(id)
        .withGraphFetched(
          '[teams, channels, files, reviews.[user, comments], manuscriptVersions(orderByCreated)]',
        )

      if (!manuscript.meta) {
        manuscript.meta = {}
      }

      manuscript.meta.notes = (manuscript.meta || {}).notes || [
        {
          notesType: 'fundingAcknowledgement',
          content: '',
        },
        {
          notesType: 'specialInstructions',
          content: '',
        },
      ]
      manuscript.decision = ''

      manuscript.manuscriptVersions = await manuscript.getManuscriptVersions()
      // manuscript.channel = await ctx.connectors.Channel.model.find(
      //   manuscript.channelId,
      // )
      return manuscript
    },
    async manuscripts(_, { where }, ctx) {
      return ctx.models.Manuscript.query()
        .withGraphFetched(
          '[teams, reviews, manuscriptVersions(orderByCreated)]',
        )
        .where({ parentId: null })
        .orderBy('created', 'desc')
    },
    async publishedManuscripts(_, { sort, offset, limit }, ctx) {
      const query = ctx.models.Manuscript.query()
        .where(raw('published IS NOT NULL'))
        .eager('[reviews.[comments], files, submitter]')

      const totalCount = await query.resultSize()

      if (sort) {
        const [sortName, sortDirection] = sort.split('_')

        query.orderBy(ref(sortName), sortDirection)
        // }
        // // e.g. 'created_DESC' into 'created' and 'DESC' arguments
        // query.orderBy(...sort.split('_'))
      }

      if (limit) {
        query.limit(limit)
      }

      if (offset) {
        query.offset(offset)
      }

      const manuscripts = await query
      return {
        totalCount,
        manuscripts,
      }
    },
    async paginatedManuscripts(_, { sort, offset, limit, filter }, ctx) {
      const query = ctx.models.Manuscript.query()
        .where({ parentId: null })
        .withGraphFetched('[submitter, manuscriptVersions(orderByCreated)]')
        .modifiers({
          orderByCreated(builder) {
            builder.orderBy('created', 'desc')
          },
        })

      if (filter && filter.status) {
        query.where({ status: filter.status })
      }

      const totalCount = await query.resultSize()

      if (sort) {
        const [sortName, sortDirection] = sort.split('_')

        query.orderBy(ref(sortName), sortDirection)
        // }
        // // e.g. 'created_DESC' into 'created' and 'DESC' arguments
        // query.orderBy(...sort.split('_'))
      }

      if (limit) {
        query.limit(limit)
      }

      if (offset) {
        query.offset(offset)
      }

      const manuscripts = await query
      return {
        totalCount,
        manuscripts,
      }

      // return ctx.connectors.User.fetchAll(where, ctx, { eager })
    },
    async detailsForURL(_, { url }) {
      return detailsForURLResolver(url)
    },
  },
  // We want submission into to come out as a stringified JSON, so that we don't have to
  // change our queries if the submission form changes. We still want to store it as JSONB
  // so that we can easily search through the information within.
  Manuscript: ManuscriptResolvers({ isVersion: false }),
  ManuscriptVersion: ManuscriptResolvers({ isVersion: true }),
}

const typeDefs = `
  extend type Query {
    globalTeams: [Team]
    manuscript(id: ID!): Manuscript!
    manuscripts: [Manuscript]!
    paginatedManuscripts(sort: String, offset: Int, limit: Int, filter: ManuscriptsFilter): PaginatedManuscripts
    detailsForURL(url: String!): URLMetadata
    publishedManuscripts(sort:String, offset: Int, limit: Int): PaginatedManuscripts
  }

  type URLMetadata {
    title: String
    author: String
    date: String
    description: String
    image: String
    logo: String
    publisher: String
  }

  input ManuscriptsFilter {
    status: String
  }

  type PaginatedManuscripts {
    totalCount: Int
    manuscripts: [Manuscript]
  }

  # enum ManuscriptsSort {
  #   meta->>'title'_DESC
  #   created_ASC
  #   created_DESC
  #   updated_ASC
  #   updated_DESC
  # }

  extend type Mutation {
    createManuscript(input: ManuscriptInput): Manuscript!
    updateManuscript(id: ID!, input: String): Manuscript!
    submitManuscript(id: ID!, input: String): Manuscript!
    makeDecision(id: ID!, decision: String): Manuscript!
    deleteManuscript(id: ID!): ID!
    reviewerResponse(currentUserId: ID, action: String, teamId: ID! ): Team
    assignTeamEditor(id: ID!, input: String): [Team]
    addReviewer(manuscriptId: ID!, userId: ID!): Team
    removeReviewer(manuscriptId: ID!, userId: ID!): Team
    publishManuscript(id: ID!): Manuscript
    createNewVersion(id: ID!): Manuscript
  }

  type Manuscript implements Object {
    id: ID!
    created: DateTime!
    updated: DateTime
    manuscriptVersions: [ManuscriptVersion]
    files: [File]
    teams: [Team]
    reviews: [Review!]
    status: String
    decision: String
    suggestions: Suggestions
    authors: [Author]
    meta: ManuscriptMeta
    submission: String
    channels: [Channel]
    submitter: User
    published: DateTime
  }

  type ManuscriptVersion implements Object {
    id: ID!
    created: DateTime!
    updated: DateTime
    files: [File]
    teams: [Team]
    reviews: [Review]
    status: String
    formState: String
    decision: String
    suggestions: Suggestions
    authors: [Author]
    meta: ManuscriptMeta
    submission: String
    submitter: User
    published: DateTime
    parentId: ID
  }

  input ManuscriptInput {
    files: [FileInput]
    meta: ManuscriptMetaInput
    submission: String
  }

  input ManuscriptMetaInput {
    title: String
    source: String
  }

  input FileInput {
    filename: String
    url: String
    mimeType: String
    size: Int
  }

  type Author {
    firstName: String
    lastName: String
    email: String
    affiliation: String
  }

  type Suggestion {
    suggested: String
    opposed: String
  }

  type Suggestions {
    reviewers: Suggestion
    editors: Suggestion
  }

  type ManuscriptMeta {
    title: String!
    source: String
    articleType: String
    declarations: Declarations
    articleSections: [String]
    articleIds: [ArticleId]
    abstract: String
    subjects: [String]
    history: [MetaDate]
    publicationDates: [MetaDate]
    notes: [Note]
    keywords: String
    manuscriptId: ID
  }

  type ArticleId {
    pubIdType: String
    id: String
  }

  type MetaDate {
    type: String
    date: DateTime
  }

  type Declarations {
    openData: String
    openPeerReview: String
    preregistered: String
    previouslySubmitted: String
    researchNexus: String
    streamlinedReview: String
  }

  type Note implements Object {
    id: ID!
    created: DateTime!
    updated: DateTime
    notesType: String
    content: String
  }
`

module.exports = {
  typeDefs,
  resolvers,
}
