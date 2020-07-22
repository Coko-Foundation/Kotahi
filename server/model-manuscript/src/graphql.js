const merge = require('lodash/merge')
const form = require('../../../app/storage/forms/submit.json')
const { ref } = require('objection')

const resolvers = {
  Mutation: {
    async createManuscript(_, vars, ctx) {
      const { Team } = require('@pubsweet/models')

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
      }

      // eslint-disable-next-line
      const manuscript = await new ctx.models.Manuscript(
        emptyManuscript,
      ).saveGraph()

      // Create two channels: 1. free for all involved, 2. editorial
      const allChannel = new ctx.models.Channel({
        manuscriptId: manuscript.id,
        topic: 'Manuscript discussion',
        type: 'all',
      }).save()

      const editorialChannel = new ctx.models.Channel({
        manuscriptId: manuscript.id,
        topic: 'Editorial discussion',
        type: 'editorial',
      }).save()

      manuscript.manuscriptVersions = []
      manuscript.files = []
      files.map(async file => {
        const newFile = Object.assign({}, file, {
          fileType: 'manuscript',
          object: 'Manuscript',
          objectId: manuscript.id,
        })
        manuscript.files.push(
          // eslint-disable-next-line
          await new ctx.models.File(newFile).save(),
        )
      })

      manuscript.reviews = []

      const createdTeam = await Team.query().upsertGraphAndFetch(
        {
          role: 'author',
          name: 'Author',
          objectId: manuscript.id,
          objectType: 'Manuscript',
          members: [{ user: { id: ctx.user.id } }],
        },
        { relate: true },
      )

      manuscript.teams = [createdTeam]
      manuscript.channels = [allChannel, editorialChannel]
      return manuscript
    },
    async deleteManuscript(_, { id }, ctx) {
      const deleteManuscript = []
      const manuscript = await ctx.models.Manuscript.find(id)

      deleteManuscript.push(manuscript.id)
      if (manuscript.parentId) {
        const parentManuscripts = await ctx.models.Manuscript.findByField(
          'parent_id',
          manuscript.parentId,
        )

        parentManuscripts.forEach(manuscript => {
          deleteManuscript.push(manuscript.id)
        })
      }

      // Delete Manuscript
      if (deleteManuscript.length > 0) {
        deleteManuscript.forEach(async manuscript => {
          await ctx.models.Manuscript.query().deleteById(manuscript)
        })
      }
      return id
    },
    async reviewerResponse(_, { currentUserId, action, teamId }, context) {
      const { Team, Review } = require('@pubsweet/models')

      if (action !== 'accepted' && action !== 'rejected')
        throw new Error(
          `Invalid action provided to handleInvitation:
           Must be either "accepted" or "rejected"`,
        )

      const team = await Team.query()
        .findById(teamId)
        .eager('members')

      team.members = team.members.map(m => {
        if (m.userId === currentUserId) {
          m.status = action
        }
        return m
      })
      if (!team) throw new Error('No team was found')

      await new Team(team).saveGraph()

      if (action === 'accepted') {
        const review = {
          recommendation: '',
          isDecision: false,
          userId: currentUserId,
          manuscriptId: team.objectId,
        }
        await new Review(review).save()
      }

      return team
    },
    async updateManuscript(_, { id, input }, ctx) {
      const data = JSON.parse(input)
      const manuscript = await ctx.models.Manuscript.findById(id)
      const update = merge({}, manuscript, data)
      return ctx.models.Manuscript.update(id, update, ctx)
    },
    async makeDecision(_, { id, decision }, ctx) {
      const manuscript = await ctx.models.Manuscript.findById(id)
      manuscript.decision = decision

      manuscript.status = decision

      return manuscript.save()
    },
  },
  Query: {
    async manuscript(_, { id }, ctx) {
      const Manuscript = require('./manuscript')

      const manuscript = await Manuscript.query()
        .findById(id)
        .eager('[teams, channels, reviews]')

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
      manuscript.files = await ctx.models.File.findByObject({
        object: 'Manuscript',
        object_id: manuscript.id,
      })

      manuscript.manuscriptVersions = await manuscript.getManuscriptVersions()
      // manuscript.channel = await ctx.connectors.Channel.model.find(
      //   manuscript.channelId,
      // )
      return manuscript
    },
    async manuscripts(_, { where }, ctx) {
      return ctx.models.Manuscript.query().eager('[teams, reviews]')
    },
    async paginatedManuscripts(_, { sort, offset, limit, filter }, ctx) {
      const query = ctx.models.Manuscript.query().eager('submitter')

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
    async getFile() {
      return form
    },
  },
  // We want submission into to come out as a stringified JSON, so that we don't have to
  // change our queries if the submission form changes. We still want to store it as JSONB
  // so that we can easily search through the information within.
  Manuscript: {
    submission(parent) {
      return JSON.stringify(parent.submission)
    },
  },
  ManuscriptVersion: {
    submission(parent) {
      return JSON.stringify(parent.submission)
    },
  },
}

const typeDefs = `
  extend type Query {
    globalTeams: [Team]
    manuscript(id: ID!): Manuscript!
    manuscripts: [Manuscript]!
    paginatedManuscripts(sort: String, offset: Int, limit: Int, filter: ManuscriptsFilter): PaginatedManuscripts
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
    makeDecision(id: ID!, decision: String): Manuscript!
    deleteManuscript(id: ID!): ID!
    reviewerResponse(currentUserId: ID, action: String, teamId: ID! ): Team
    assignTeamEditor(id: ID!, input: String): [Team]
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
