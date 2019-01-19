const { Team } = require('pubsweet-server')
const merge = require('lodash/merge')
const Manuscript = require('./manuscript')
const File = require('../../file/src/file')
const Review = require('../../review/src/review')
const form = require('../../../app/storage/forms/submit.json')

const resolvers = {
  Mutation: {
    async createManuscript(_, vars, ctx) {
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
      const manuscript = await new Manuscript(emptyManuscript).save()
      manuscript.manuscriptVersions = []
      manuscript.files = []
      files.map(async file => {
        const newFile = Object.assign({}, file, {
          fileType: 'manuscript',
          object: 'Manuscript',
          objectId: manuscript.id,
        })
        manuscript.files.push(await new File(newFile).save())
      })

      manuscript.reviews = []

      // create Team Author Owner
      const team = new Team({
        teamType: 'author',
        name: 'Author',
        object: {
          objectId: manuscript.id,
          objectType: 'Manuscript',
        },
        members: [ctx.user],
      })

      const createdTeam = await team.save()

      manuscript.teams = [createdTeam]
      return manuscript
    },
    async deleteManuscript(_, { id }, ctx) {
      const deleteManuscript = []
      const manuscript = await Manuscript.findOneByField('id', id)

      deleteManuscript.push(manuscript.id)
      if (manuscript.parentId) {
        const parentManuscripts = await Manuscript.findByField(
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
      if (action !== 'accepted' && action !== 'rejected')
        throw new Error(
          `Invalid action provided to handleInvitation:
           Must be either "accepted" or "rejected"`,
        )

      const team = await Team.find(teamId)

      team.status = team.status.map(status => {
        if (status.user === currentUserId) {
          status.status = action
        }
        return status
      })

      if (!team) throw new Error('No team was found')

      await new Team(team).save()

      if (action === 'accepted') {
        const review = {
          recommendation: '',
          isDecision: false,
          userId: currentUserId,
          manuscriptId: team.object.objectId,
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

      const previousVersion = await new Manuscript(update).createNewVersion()

      const manuscriptVersion = await previousVersion.save()
      return manuscriptVersion
    },
  },
  Query: {
    async manuscript(_, { id }) {
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
      manuscript.files = await File.findByObject({
        object: 'Manuscript',
        object_id: manuscript.id,
      })

      manuscript.teams = await manuscript.getTeams()
      manuscript.reviews = await manuscript.getReviews()
      manuscript.manuscriptVersions = await manuscript.getManuscriptVersions()

      return manuscript
    },
    async manuscripts(_, vars, ctx) {
      return ctx.connectors.Manuscript.fetchAll(ctx)
    },
    async getFile() {
      return form
    },
  },
}

module.exports = resolvers
