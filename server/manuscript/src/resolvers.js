const merge = require('lodash/merge')
const form = require('../../../app/storage/forms/submit.json')

const resolvers = {
  Mutation: {
    async createManuscript(_, vars, ctx) {
      const { Team } = require('@pubsweet/models')

      const { meta, files } = vars.input
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
      }
      // eslint-disable-next-line
      const manuscript = await new ctx.connectors.Manuscript.model(
        emptyManuscript,
      ).save()
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
          await new ctx.connectors.File.model(newFile).save(),
        )
      })

      manuscript.reviews = []

      const createdTeam = await Team.query().upsertGraphAndFetch(
        {
          role: 'author',
          name: 'Author',
          objectId: manuscript.id,
          objectType: 'Manuscript',
          members: [{ user: { id: ctx.user } }],
        },
        { relate: true },
      )

      manuscript.teams = [createdTeam]
      return manuscript
    },
    async deleteManuscript(_, { id }, ctx) {
      const deleteManuscript = []
      const manuscript = await ctx.connectors.Manuscript.model.find(id)

      deleteManuscript.push(manuscript.id)
      if (manuscript.parentId) {
        const parentManuscripts = await ctx.connectors.Manuscript.model.findByField(
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
          await ctx.connectors.Manuscript.delete(manuscript, ctx)
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
      const manuscript = await ctx.connectors.Manuscript.fetchOne(id, ctx)
      const update = merge({}, manuscript, data)
      return ctx.connectors.Manuscript.update(id, update, ctx)
    },
    async submitManuscript(_, { id, input }, ctx) {
      const data = JSON.parse(input)

      const manuscript = await ctx.connectors.Manuscript.fetchOne(id, ctx)
      const update = merge({}, manuscript, data)
      // eslint-disable-next-line
      const previousVersion = await new ctx.connectors.Manuscript.model(
        update,
      ).createNewVersion()

      const manuscriptVersion = await previousVersion.save()
      return manuscriptVersion
    },
  },
  Query: {
    async manuscript(_, { id }, ctx) {
      const Manuscript = require('./manuscript')

      const manuscript = await Manuscript.find(id)

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
      manuscript.files = await ctx.connectors.File.model.findByObject({
        object: 'Manuscript',
        object_id: manuscript.id,
      })

      manuscript.teams = await manuscript.getTeams()
      manuscript.reviews = await manuscript.getReviews()
      manuscript.manuscriptVersions = await manuscript.getManuscriptVersions()

      return manuscript
    },
    async manuscripts(_, { where }, ctx) {
      return ctx.connectors.Manuscript.fetchAll(where, ctx)
    },
    async getFile() {
      return form
    },
  },
}

module.exports = resolvers
