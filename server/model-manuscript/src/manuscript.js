const BaseModel = require('@pubsweet/base-model')
const omit = require('lodash/omit')
const cloneDeep = require('lodash/cloneDeep')
const sortBy = require('lodash/sortBy')
const values = require('lodash/values')

class Manuscript extends BaseModel {
  static get tableName() {
    return 'manuscripts'
  }

  constructor(properties) {
    super(properties)
    this.type = 'Manuscript'
  }

  static async myManuscripts(myManuscripts) {
    const mainManuscript = {}
    myManuscripts.forEach(manuscript => {
      if (!mainManuscript[manuscript.parentId || manuscript.id]) {
        mainManuscript[manuscript.parentId || manuscript.id] = manuscript
      } else {
        const checkManuscript =
          mainManuscript[manuscript.parentId || manuscript.id]
        // Compare Dates
        const dateCheckManuscript = new Date(checkManuscript.created).getTime()
        const dateManuscript = new Date(manuscript.created).getTime()
        if (dateManuscript >= dateCheckManuscript) {
          mainManuscript[manuscript.parentId || manuscript.id] = manuscript
        }
      }
    })

    const latestManuscripts = values(mainManuscript)
    await Promise.all(
      latestManuscripts.map(async manuscript => {
        manuscript.teams = await new Manuscript(manuscript).getTeams()
        manuscript.reviews = await new Manuscript(manuscript).getReviews()
        manuscript.manuscriptVersions =
          (await manuscript.getManuscriptVersions()) || []
        return manuscript
      }),
    )

    return latestManuscripts
  }

  async getTeams() {
    const { Team } = require('@pubsweet/models')
    const myTeams = await Team.query()
      .where({
        objectId: this.id,
        objectType: 'Manuscript',
      })
      .eager('members')

    // const { rows } = await db.raw(
    //   `SELECT id, data FROM entities WHERE ${where.join(' AND ')}`,
    //   Object.values(selector),
    // )

    // const myTeams = rows.map(
    //   result => new Team({ id: result.id, ...result.data }),
    // )

    return myTeams
  }

  async getReviews() {
    const Review = require('../../review/src/review')

    const manuscriptReviews = await Review.findByField('manuscript_id', this.id)

    await Promise.all(
      manuscriptReviews.map(async review => {
        review.comments = await review.getComments()
      }),
    )

    return manuscriptReviews
  }

  async getManuscriptVersions() {
    const { File } = require('@pubsweet/models')

    const id = this.parentId || this.id
    const manuscripts = await Manuscript.findByField('parent_id', id)
    const firstManuscript = await Manuscript.findOneByField('id', id)
    manuscripts.push(firstManuscript)

    const manuscriptVersionsArray = manuscripts.filter(
      manuscript =>
        new Date(manuscript.created).getTime() <
          new Date(this.created).getTime() && this.id !== manuscript.id,
    )

    const manuscriptVersions = sortBy(
      manuscriptVersionsArray,
      manuscript => new Date(manuscript.created),
    )

    await Promise.all(
      manuscriptVersions.map(async manuscript => {
        manuscript.reviews = await manuscript.getReviews()
        manuscript.teams = await manuscript.getTeams()
        manuscript.files = await File.findByObject({
          object: 'Manuscript',
          object_id: manuscript.id,
        })
        return manuscript
      }),
    )

    return manuscriptVersions
  }

  async createNewVersion() {
    const { Team, File } = require('@pubsweet/models')

    const manuscriptReviews = await this.getReviews()
    const manuscriptTeams = await this.getTeams()
    const teams = manuscriptTeams.filter(
      team =>
        team.role === 'author' ||
        team.role === 'seniorEditor' ||
        team.role === 'handlingEditor',
    )

    const manuscriptFiles = await File.findByObject({
      object: 'Manuscript',
      object_id: this.id,
    })

    const manuscriptDecision = manuscriptReviews.find(
      review => review.isDecision,
    )

    const dataManuscript = await new Manuscript(
      omit(cloneDeep(this), ['id', 'created', 'updated', 'decision']),
    )

    dataManuscript.status =
      manuscriptDecision.recommendation === 'revise'
        ? 'revising'
        : manuscriptDecision.recommendation

    dataManuscript.parentId = this.parentId || this.id
    const newManuscript = await dataManuscript.save()

    if (teams.length > 0) {
      // Copy Teams to the new Version
      await Promise.all(
        teams.map(async team => {
          team.objectId = newManuscript.id
          team.members = team.members.map(member => omit(member, 'id'))
          await new Team(omit(team, ['id'])).saveGraph()
        }),
      )
    }

    // Copy Files to the new Version
    await Promise.all(
      manuscriptFiles.map(async file => {
        const newFile = omit(file, ['id'])
        newFile.objectId = newManuscript.id
        await new File(newFile).save()
        return newFile
      }),
    )

    return this
  }

  static get relationMappings() {
    const { Channel, User } = require('@pubsweet/models')

    return {
      submitter: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'manuscripts.submitterId',
          to: 'users.id',
        },
      },
      channels: {
        relation: BaseModel.HasManyRelation,
        modelClass: Channel,
        join: {
          from: 'manuscripts.id',
          to: 'channels.manuscriptId',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        parentId: { type: ['string', 'null'], format: 'uuid' },
        manuscriptVersions: { type: ['object', 'null'] },
        files: {
          items: { type: 'object' },
          type: ['array', 'null'],
        },
        teams: {
          items: { type: 'object' },
          type: ['array', 'null'],
        },
        reviews: {
          items: { type: 'object' },
          type: ['array', 'null'],
        },
        status: { type: ['string', 'null'] },
        decision: { type: ['string', 'null'] },
        suggestions: {
          type: ['object', 'null'],
          properties: {
            reviewers: {
              suggested: { type: ['string', 'null'] },
              opposed: { type: ['string', 'null'] },
            },
            editors: {
              suggested: { type: ['string', 'null'] },
              opposed: { type: ['string', 'null'] },
            },
          },
        },
        authors: {
          items: { type: 'object' },
          type: ['array', 'null'],
        },
        meta: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            abstract: { type: ['string', 'null'] },
            source: { type: 'string' },
            articleType: { type: 'string' },
            declarations: {
              type: 'object',
              properties: {
                openData: { type: ['string', 'null'] },
                openPeerReview: { type: ['string', 'null'] },
                preregistered: { type: ['string', 'null'] },
                previouslySubmitted: { type: ['string', 'null'] },
                researchNexus: { type: ['string', 'null'] },
                streamlinedReview: { type: ['string', 'null'] },
              },
            },
            articleSections: {
              items: { type: 'string' },
              type: ['array', 'null'],
            },
            articleIds: {
              items: { type: 'object' },
              type: ['array', 'null'],
            },
            history: {
              items: { type: 'object' },
              type: ['array', 'null'],
            },
            publicationDates: {
              items: { type: 'object' },
              type: ['array', 'null'],
            },
            notes: {
              items: { type: 'object' },
              type: ['array', 'null'],
            },
            keywords: { type: ['string', 'null'] },
          },
        },
        submission: {},
        submitterId: { type: ['string', 'null'], format: 'uuid' },
      },
    }
  }

  // TODO: Do this on the DB level with cascading deletes
  async $beforeDelete() {
    // const Review = require('../../review/src/review')
    const { Review, Team, File } = require('@pubsweet/models')

    const files = await File.findByObject({
      object_id: this.id,
      object: 'Manuscript',
    })
    if (files.length > 0) {
      files.forEach(async fl => {
        await new File(fl).delete()
      })
    }

    const review = await Review.findByField('manuscript_id', this.id)
    if (review.length > 0) {
      review.forEach(async rv => {
        await new Review(rv).delete()
      })
    }

    this.teams = await this.getTeams()

    this.teams.forEach(async team => {
      await new Team(team).delete()
    })
  }
}

Manuscript.type = 'Manuscript'
module.exports = Manuscript
