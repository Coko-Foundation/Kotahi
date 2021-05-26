const { ref } = require('objection')
const axios = require('axios')
const { GoogleSpreadsheet } = require('google-spreadsheet')
const { mergeWith, isArray } = require('lodash')
const credentials = require('../../../google_sheets_credentials.json')
const Form = require('../../model-form/src/form')
const publishToCrossref = require('../../publishing/crossref')

const {
  publishToHypothesis,
  deletePublication,
} = require('../../publishing/hypothesis')

const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')

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

const mergeArrays = (destination, source) => {
  if (isArray(destination)) return source
  return undefined
}

const commonUpdateManuscript = async (_, { id, input }, ctx) => {
  const manuscriptDelta = JSON.parse(input)
  const manuscript = await ctx.models.Manuscript.query().findById(id)

  const updatedManuscript = mergeWith(manuscript, manuscriptDelta, mergeArrays)

  // if (manuscript.status === 'revise') {
  //   return manuscript.createNewVersion(update)
  // }
  return ctx.models.Manuscript.query().updateAndFetchById(id, updatedManuscript)
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

      const manuscript = await ctx.models.Manuscript.query().upsertGraphAndFetch(
        emptyManuscript,
        { relate: true },
      )

      manuscript.manuscriptVersions = []
      return manuscript
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

      if (process.env.INSTANCE_NAME === 'elife') {
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
          .map(([propName, value]) => value)

        evaluationValues.push(manuscript.submission.summary)

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
        // eslint-disable-next-line
        const submissionForm = await Form.findOneByField('purpose', 'submit')
        const spreadsheetId = '1OvWJj7ZTFhniC4KbFNbskuYSNMftsG2ocKuY-i9ezVA'

        const fieldsOrder = submissionForm.structure.children
          .filter(el => el.name)
          .map(formElement => formElement.name.split('.')[1])

        const formatSubmissionData = rawSubmissionData => {
          return Object.keys(rawSubmissionData).reduce((acc, key) => {
            return { ...acc, [key]: rawSubmissionData[key].toString() }
          }, {})
        }

        const publishArticleInGoogleSheets = async submissionData => {
          const formattedSubmissionData = formatSubmissionData(submissionData)

          const { articleURL } = formattedSubmissionData
          const doc = new GoogleSpreadsheet(spreadsheetId)

          await doc.useServiceAccountAuth({
            client_email: credentials.client_email,
            private_key: credentials.private_key,
          })

          await doc.loadInfo()
          const sheet = doc.sheetsByIndex[0]
          const rows = await sheet.getRows()

          const indexOfExistingArticle = rows.findIndex(
            row => row.articleURL === articleURL,
          )

          if (indexOfExistingArticle !== -1) {
            fieldsOrder.forEach(fieldName => {
              rows[indexOfExistingArticle][fieldName] =
                formattedSubmissionData[fieldName] || ''
            })
            await rows[indexOfExistingArticle].save()
          } else {
            await sheet.addRow({ ...formattedSubmissionData })
          }
        }

        try {
          await publishArticleInGoogleSheets(manuscript.submission)

          const updatedManuscript = await ctx.models.Manuscript.query().updateAndFetchById(
            id,
            {
              published: new Date(),
              status: 'published',
            },
          )

          return updatedManuscript
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

      if (!ctx.user.admin) {
        const manuscriptObj = { ...manuscript }

        manuscriptObj.reviews.forEach((review, index) => {
          delete manuscriptObj.reviews[index].confidentialComment
        })

        return manuscriptObj
      }

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
        .withGraphFetched('[submitter, manuscriptVersions(orderByCreated)]')
        .modifiers({
          orderByCreated(builder) {
            builder.orderBy('created', 'desc')
          },
        })

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

      const totalCount = await query.resultSize()

      if (sort) {
        const [sortName, sortDirection] = sort.split('_')

        if (sortName.includes('submission:')) {
          const fieldName = sortName.split(':')[1]
          const result = `LOWER(submission->>'${fieldName}') ${sortDirection}`
          query.orderByRaw(result)
        } else {
          query.orderBy(ref(sortName), sortDirection)
        }
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
    evaluationsHypothesisMap: String
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
