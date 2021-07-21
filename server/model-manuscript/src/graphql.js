/* eslint-disable prefer-destructuring */
const { ref } = require('objection')
const axios = require('axios')
const { mergeWith, isArray, uniqBy } = require('lodash')
const { pubsubManager } = require('pubsweet-server')

const { getPubsub } = pubsubManager
const Form = require('../../model-form/src/form')
const publishToCrossref = require('../../publishing/crossref')

const {
  publishToHypothesis,
  deletePublication,
} = require('../../publishing/hypothesis')

const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')
const importArticlesFromBiorxiv = require('../../import-articles/biorxiv-import')
const importArticlesFromPubmed = require('../../import-articles/pubmed-import')
const publishToGoogleSpreadSheet = require('../../publishing/google-spreadsheet')
const importArticlesFromEuropePMC = require('../../import-articles/europepmc-import')

let isImportInProgress = false

const ManuscriptResolvers = ({ isVersion }) => {
  const resolvers = {
    submission(parent) {
      return JSON.stringify(parent.submission)
    },
    evaluationsHypothesisMap(parent) {
      return JSON.stringify(parent.evaluationsHypothesisMap)
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
      if (
        (parent.manuscriptVersions && !parent.manuscriptVersions.length) ||
        !parent.manuscriptVersions
      ) {
        return ctx.models.Manuscript.relatedQuery('manuscriptVersions')
          .for(parent.id)
          .orderBy('created', 'desc')
      }

      return parent.manuscriptVersions
    }
  }

  return resolvers
}

const mergeArrays = (destination, source) => {
  if (isArray(destination)) return source
  return undefined
}

const commonUpdateManuscript = async (id, input, ctx) => {
  const msDelta = JSON.parse(input)
  const ms = await ctx.models.Manuscript.query().findById(id)
  const updatedMs = mergeWith(ms, msDelta, mergeArrays)

  if (
    updatedMs.status &&
    updatedMs.status !== 'new' &&
    !updatedMs.submittedDate
  )
    updatedMs.submittedDate = new Date()

  if (['ncrc', 'colab'].includes(process.env.INSTANCE_NAME)) {
    updatedMs.submission.editDate = new Date().toISOString().split('T')[0]
  }

  return ctx.models.Manuscript.query().updateAndFetchById(id, updatedMs)
}

const resolvers = {
  Mutation: {
    async createManuscript(_, vars, ctx) {
      const submissionForm = await Form.findOneByField('purpose', 'submit')

      const { meta, files } = vars.input

      const parsedFormStructure = submissionForm.structure.children
        .map(formElement => {
          const parsedName = formElement.name && formElement.name.split('.')[1]

          if (parsedName) {
            return {
              name: parsedName,
              component: formElement.component,
            }
          }

          return undefined
        })
        .filter(x => x !== undefined)

      const emptySubmission = parsedFormStructure.reduce((acc, curr) => {
        acc[curr.name] =
          curr.component === 'CheckboxGroup' || curr.component === 'LinksInput'
            ? []
            : ''
        return {
          ...acc,
        }
      }, {})

      // We want the submission information to be stored as JSONB
      // but we want the input to come in as a JSON string
      const submission = vars.input.submission
        ? JSON.parse(vars.input.submission)
        : emptySubmission

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

      if (['ncrc', 'colab'].includes(process.env.INSTANCE_NAME)) {
        emptyManuscript.submission.editDate = new Date()
          .toISOString()
          .split('T')[0]
      }

      const manuscript = await ctx.models.Manuscript.query().upsertGraphAndFetch(
        emptyManuscript,
        { relate: true },
      )

      manuscript.manuscriptVersions = []
      return manuscript
    },
    async importManuscripts(_, props, ctx) {
      if (isImportInProgress) {
        return null
      }

      isImportInProgress = true

      const pubsub = await getPubsub()

      if (process.env.INSTANCE_NAME === 'ncrc') {
        const manuscriptsFromBiorxiv = await importArticlesFromBiorxiv(ctx)

        const manuscriptsFromPubmed = await importArticlesFromPubmed(ctx)
        isImportInProgress = false

        pubsub.publish('IMPORT_MANUSCRIPTS_STATUS', {
          manuscriptsImportStatus: true,
        })

        return manuscriptsFromBiorxiv.concat(manuscriptsFromPubmed)
      }

      if (process.env.INSTANCE_NAME === 'colab') {
        const importedManuscripts = await importArticlesFromEuropePMC(ctx)
        isImportInProgress = false

        pubsub.publish('IMPORT_MANUSCRIPTS_STATUS', {
          manuscriptsImportStatus: true,
        })

        return importedManuscripts
      }
    },
    async deleteManuscripts(_, { ids }, ctx) {
      if (ids.length > 0) {
        await Promise.all(
          ids.map(toDeleteItem =>
            ctx.models.Manuscript.query().deleteById(toDeleteItem),
          ),
        )
      }

      return ids
    },
    async deleteManuscript(_, { id }, ctx) {
      const toDeleteList = []
      const manuscript = await ctx.models.Manuscript.find(id)

      toDeleteList.push(manuscript.id)

      if (
        process.env.INSTANCE_NAME === 'elife' &&
        manuscript.evaluationsHypothesisMap !== null
      ) {
        const deletePromises = Object.values(
          manuscript.evaluationsHypothesisMap,
        )
          .filter(Boolean)
          .map(publicationId => {
            return deletePublication(publicationId)
          })

        await Promise.all(deletePromises)
      }

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
      const {
        Team: TeamModel,
        Review: ReviewModel,
        // eslint-disable-next-line global-require
      } = require('@pubsweet/models') // Pubsweet models may initially be undefined, so we require only when resolver runs.

      if (action !== 'accepted' && action !== 'rejected')
        throw new Error(
          `Invalid action (reviewerResponse): Must be either "accepted" or "rejected"`,
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
      return commonUpdateManuscript(id, input, ctx) // Currently submitManuscript and updateManuscript have identical action
    },

    async createNewVersion(_, { id }, ctx) {
      const manuscript = await ctx.models.Manuscript.query().findById(id)
      return manuscript.createNewVersion()
    },
    async submitManuscript(_, { id, input }, ctx) {
      return commonUpdateManuscript(id, input, ctx) // Currently submitManuscript and updateManuscript have identical action
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

      if (['elife'].includes(process.env.INSTANCE_NAME)) {
        if (manuscript.evaluationsHypothesisMap === null) {
          manuscript.evaluationsHypothesisMap = {}
        }

        const evaluationValues = Object.entries(manuscript.submission)
          .filter(
            ([prop, value]) =>
              !Number.isNaN(Number(prop.split('review')[1])) &&
              prop.includes('review'),
          )
          .map(([propName, value]) => [
            value,
            manuscript.submission[`${propName}date`],
          ])

        evaluationValues.push([
          manuscript.submission.summary,
          manuscript.submission.summarydate,
        ])

        const areEvaluationsEmpty = evaluationValues
          .map(evaluationValue => {
            return checkIsAbstractValueEmpty(evaluationValue)
          })
          .every(isEmpty => isEmpty === true)

        if (areEvaluationsEmpty && manuscript.status === 'evaluated') {
          return manuscript
        }

        const newArticleStatus =
          areEvaluationsEmpty && manuscript.status === 'published'
            ? 'evaluated'
            : 'published'

        await publishToCrossref(manuscript)

        const newEvaluationsHypothesisMap = await publishToHypothesis(
          manuscript,
        )

        const updatedManuscript = await ctx.models.Manuscript.query().updateAndFetchById(
          id,
          {
            published: new Date(),
            status: newArticleStatus,
            evaluationsHypothesisMap: newEvaluationsHypothesisMap,
          },
        )

        return updatedManuscript
      }

      if (process.env.INSTANCE_NAME === 'ncrc') {
        try {
          const manuscriptId = await publishToGoogleSpreadSheet(manuscript)

          if (manuscriptId) {
            const updatedManuscript = await ctx.models.Manuscript.query().updateAndFetchById(
              manuscriptId,
              {
                published: new Date(),
                status: 'published',
                submission: {
                  ...manuscript.submission,
                  editDate: new Date().toISOString().split('T')[0],
                },
              },
            )

            return updatedManuscript
          }

          return null
        } catch (e) {
          // eslint-disable-next-line
          console.log('error while publishing in google spreadsheet')
          // eslint-disable-next-line
          console.log(e)
          return null
        }
      }

      if (
        !manuscript.published &&
        ['aperture', 'colab'].includes(process.env.INSTANCE_NAME)
      ) {
        manuscript = ctx.models.Manuscript.query().updateAndFetchById(id, {
          published: new Date(),
          // for Colab instance submission.editDate should be updated
        })
      }

      return manuscript
    },
  },
  Subscription: {
    manuscriptsImportStatus: {
      subscribe: async (_, vars, context) => {
        const pubsub = await getPubsub()

        return pubsub.asyncIterator(['IMPORT_MANUSCRIPTS_STATUS'])
      },
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

      if (!manuscript) return null

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

      if (ctx.user && !ctx.user.admin) {
        const manuscriptObj = { ...manuscript }

        manuscriptObj.reviews.forEach((review, index) => {
          delete manuscriptObj.reviews[index].confidentialComment
        })

        return manuscriptObj
      }

      return manuscript
    },
    async manuscriptsImReviewerOf(_, input, ctx) {
      const teamMemberManuscripts = await ctx.models.TeamMember.query()
        .where({ userId: ctx.user.id })
        .withGraphFetched('[team.[manuscript]]')

      const onlyReviewerTeams = teamMemberManuscripts.filter(teamMember => {
        return [
          'reviewer',
          'invited:reviewer',
          'accepted:reviewer',
          'completed:reviewer',
        ].includes(teamMember.team.role)
      })

      const manuscripts = uniqBy(
        onlyReviewerTeams.map(teamMember => {
          return { ...teamMember.team.manuscript, userId: teamMember.userId }
        }),
        'id',
      )

      return manuscripts
    },
    async manuscriptsImAuthorOf(_, input, ctx) {
      const teamMemberManuscripts = await ctx.models.TeamMember.query()
        .where({ userId: ctx.user.id })
        .withGraphFetched('[team.[manuscript]]')

      const onlyAuthorTeams = teamMemberManuscripts.filter(teamMember => {
        return ['author'].includes(teamMember.team.role)
      })

      const manuscripts = uniqBy(
        onlyAuthorTeams.map(teamMember => {
          return { ...teamMember.team.manuscript, userId: teamMember.userId }
        }),
        'id',
      )

      return manuscripts
    },
    async manuscriptImEditorOf(_, input, ctx) {
      const teamMemberManuscripts = await ctx.models.TeamMember.query()
        .where({ userId: ctx.user.id })
        .withGraphFetched('[team.[manuscript.[reviews]]]')

      const onlyEditorTeams = teamMemberManuscripts.filter(teamMember => {
        return ['seniorEditor', 'handlingEditor', 'editor'].includes(
          teamMember.team.role,
        )
      })

      const manuscripts = uniqBy(
        onlyEditorTeams.map(teamMember => {
          return { ...teamMember.team.manuscript, userId: teamMember.userId }
        }),
        'id',
      )

      const formattedManuscripts = manuscripts.map(manuscript => {
        const currentRoles = teamMemberManuscripts
          .filter(teamMember => {
            return teamMember.userId === manuscript.userId
          })
          .map(teamMember => teamMember.team.role)

        const teams = teamMemberManuscripts
          .filter(teamMember => {
            return teamMember.team.manuscriptId === manuscript.id
          })
          .map(teamMember => teamMember.team)

        return { ...manuscript, currentRoles, teams }
      })

      return formattedManuscripts
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
        .whereNotNull('published')
        .withGraphFetched('[reviews.[comments], files, submitter]')

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
      let parsedSubmission

      if (filter.submission) {
        parsedSubmission = JSON.parse(filter.submission)
      }

      const query = ctx.models.Manuscript.query()
        .where({ parentId: null })
        .modify('orderBy', sort)

      if (filter && filter.status) {
        query.where({ status: filter.status })
      }

      if (process.env.INSTANCE_NAME === 'ncrc') {
        if (filter && parsedSubmission && parsedSubmission.topics) {
          query.whereRaw("(submission->'topics')::jsonb \\? ?", [
            parsedSubmission.topics,
          ])
        }
      }

      if (
        ['ncrc', 'colab'].includes(process.env.INSTANCE_NAME) &&
        filter &&
        parsedSubmission &&
        parsedSubmission.label
      ) {
        query.whereRaw(
          `submission->>'labels' LIKE '%${parsedSubmission.label}%'`,
        )
      }

      const totalCount = await query.resultSize()

      if (limit) {
        query.limit(limit)
      }

      if (offset) {
        query.offset(offset)
      }

      const manuscripts = await query

      console.log('manuscripts received')

      let detailedManuscripts = []

      try {
        detailedManuscripts = await ctx.models.Manuscript.transaction(
          async trx => {
            const queryResult = await ctx.models.Manuscript.query(trx)
              .whereIn(
                'manuscripts.id',
                manuscripts.map(manuscript => manuscript.id),
              )
              .withGraphJoined(
                '[submitter, manuscriptVersions(orderByCreated), teams.[members.[user.[defaultIdentity]]]]',
              )

            return queryResult
          },
        )

        // detailedManuscripts = await ctx.models.Manuscript.query()
        //   .whereIn(
        //     'manuscripts.id',
        //     manuscripts.map(manuscript => manuscript.id),
        //   )
        //   .withGraphJoined(
        //     '[submitter, manuscriptVersions(orderByCreated), teams.[members.[user.[defaultIdentity]]]]',
        //   )

        console.log('everything is good')
      } catch (e) {
        console.log('error....')
      }

      return {
        totalCount,
        manuscripts: detailedManuscripts,
      }

      // return ctx.connectors.User.fetchAll(where, ctx, { eager })
    },

    async validateDOI(_, { articleURL }, ctx) {
      const DOI = encodeURI(articleURL.split('.org/')[1])

      try {
        await axios.get(`https://api.crossref.org/works/${DOI}/agency`)

        return {
          isDOIValid: true,
        }
      } catch (err) {
        // eslint-disable-next-line
        console.log(err)
        return {
          isDOIValid: false,
        }
      }
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
    publishedManuscripts(sort:String, offset: Int, limit: Int): PaginatedManuscripts
    validateDOI(articleURL: String): validateDOIResponse
    manuscriptImEditorOf: [Manuscript]
    manuscriptsImAuthorOf: [Manuscript]
    manuscriptsImReviewerOf: [Manuscript]
  }

  input ManuscriptsFilter {
    status: String
    submission: String
  }

  type validateDOIResponse {
    isDOIValid: Boolean
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
  
  extend type Subscription {
    manuscriptsImportStatus: Boolean
  }

  extend type Mutation {
    createManuscript(input: ManuscriptInput): Manuscript!
    updateManuscript(id: ID!, input: String): Manuscript!
    submitManuscript(id: ID!, input: String): Manuscript!
    makeDecision(id: ID!, decision: String): Manuscript!
    deleteManuscript(id: ID!): ID!
    deleteManuscripts(ids: [ID]!): [ID]!
    reviewerResponse(currentUserId: ID, action: String, teamId: ID! ): Team
    assignTeamEditor(id: ID!, input: String): [Team]
    addReviewer(manuscriptId: ID!, userId: ID!): Team
    removeReviewer(manuscriptId: ID!, userId: ID!): Team
    publishManuscript(id: ID!): Manuscript
    createNewVersion(id: ID!): Manuscript
    importManuscripts: PaginatedManuscripts
  }

  type Manuscript implements Object {
    id: ID!
    created: DateTime!
    updated: DateTime
    manuscriptVersions: [ManuscriptVersion]
    files: [File]
    teams: [Team]
    reviews: [Review]
    status: String
    decision: String
    suggestions: Suggestions
    authors: [Author]
    meta: ManuscriptMeta
    submission: String
    channels: [Channel]
    submitter: User
    submittedDate: DateTime
    published: DateTime
    evaluationsHypothesisMap: String
    currentRoles: [String]
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
    evaluationsHypothesisMap: String
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
