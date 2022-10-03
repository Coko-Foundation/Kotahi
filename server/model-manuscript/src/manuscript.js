const { BaseModel } = require('@coko/server')
const omit = require('lodash/omit')
const cloneDeep = require('lodash/cloneDeep')
const sortBy = require('lodash/sortBy')

class Manuscript extends BaseModel {
  static get tableName() {
    return 'manuscripts'
  }

  constructor(properties) {
    super(properties)
    this.type = 'Manuscript'
  }

  static get modifiers() {
    return {
      orderByCreated(builder) {
        builder.orderBy('created', 'desc')
      },
      orderBy(query, sort) {
        if (!sort) {
          query.orderBy('created', 'desc')
        } else {
          const [sortName, sortDirection] = sort.split('_')

          if (sortName.includes('submission:')) {
            const fieldName = sortName.split(':')[1]
            const result = `LOWER(manuscripts.submission->>'${fieldName}') ${sortDirection}, id ${sortDirection}`
            query.orderByRaw(result)
          } else if (sortName.includes('meta:')) {
            const fieldName = sortName.split(':')[1]
            const result = `LOWER(manuscripts.meta->>'${fieldName}') ${sortDirection}, id ${sortDirection}`
            query.orderByRaw(result)
          } else {
            const result = `${sortName} ${sortDirection}, id ${sortDirection}`
            query.orderByRaw(result)
          }
        }
      },
    }
  }

  async $afterUpdate(opt, queryContext) {
    await super.$afterUpdate(opt, queryContext)
    delete this.searchTsvector
  }

  async $afterInsert(opt, queryContext) {
    await super.$afterInsert(opt, queryContext)
    delete this.searchTsvector
  }

  async $afterFind(opt, queryContext) {
    await super.$afterFind(opt, queryContext)
    delete this.searchTsvector
  }

  async getReviews() {
    // TODO: Use relationships
    /* eslint-disable-next-line global-require */
    // eslint-disable-next-line
    const Review = require('../../model-review/src/review')

    const manuscriptReviews = await Review.findByField('manuscript_id', this.id)

    // await Promise.all(
    //   manuscriptReviews.map(async review => {
    //     // eslint-disable-next-line no-param-reassign
    //     // eslint-disable-next-line
    //     review.comments = await review.getComments()
    //   }),
    // )

    return manuscriptReviews
  }

  /** Returns an array of all versions other than this version */
  async getManuscriptVersions() {
    // const { File } = require('@pubsweet/models')

    const id = this.parentId || this.id

    const manuscripts = await Manuscript.query()
      .where('parent_id', id)
      .withGraphFetched('[teams.members, reviews.user, files]')

    const firstManuscript = await Manuscript.query()
      .findById(id)
      .withGraphFetched('[teams.members, reviews.user, files]')

    manuscripts.push(firstManuscript)

    const manuscriptVersionsArray = manuscripts.filter(
      manuscript => this.id !== manuscript.id,
    )

    const manuscriptVersions = sortBy(
      manuscriptVersionsArray,
      manuscript => new Date(manuscript.created),
    )

    return manuscriptVersions
  }

  async createNewVersion() {
    // Copy authors and editors to the new version
    const teams = await this.$relatedQuery('teams')
      .whereIn('role', ['author', 'editor', 'seniorEditor', 'handlingEditor'])
      .withGraphFetched('members')

    teams.forEach(t => {
      // eslint-disable-next-line
      delete t.id
      // eslint-disable-next-line
      t.members.forEach(tm => delete tm.id)
    })

    // Copy files as well
    const files = await this.$relatedQuery('files')
    // eslint-disable-next-line
    files.forEach(f => delete f.id)

    const newVersion = cloneDeep(this)
    newVersion.teams = teams
    // eslint-disable-next-line
    newVersion.files = files

    // Copy channels as well
    const channels = await this.$relatedQuery('channels')
    // eslint-disable-next-line
    channels.forEach(c => delete c.id)

    newVersion.channels = channels

    if (this.decision === 'revise') {
      newVersion.status = 'revising'
    }

    // All versions should be linked to one parent, original manuscript
    newVersion.parentId = this.parentId || this.id

    const manuscript = await Manuscript.query().insertGraphAndFetch(
      omit(cloneDeep(newVersion), ['id', 'created', 'updated', 'decision']),
    )

    return manuscript
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const { Channel, User, Review } = require('@pubsweet/models')
    /* eslint-disable-next-line global-require */
    const File = require('@coko/server/src/models/file/file.model')
    /* eslint-disable-next-line global-require */
    const Team = require('../../model-team/src/team')

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
      teams: {
        relation: BaseModel.HasManyRelation,
        modelClass: Team,
        join: {
          from: 'manuscripts.id',
          to: 'teams.objectId',
        },
      },
      files: {
        relation: BaseModel.HasManyRelation,
        modelClass: File,
        join: {
          from: 'manuscripts.id',
          to: 'files.objectId',
        },
      },
      reviews: {
        relation: BaseModel.HasManyRelation,
        modelClass: Review,
        join: {
          from: 'manuscripts.id',
          to: 'reviews.manuscriptId',
        },
      },
      parent: {
        relation: BaseModel.HasOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'manuscripts.id',
          to: 'manuscripts.parentId',
        },
      },
      manuscriptVersions: {
        relation: BaseModel.HasManyRelation,
        modelClass: Manuscript,
        join: {
          from: 'manuscripts.id',
          to: 'manuscripts.parentId',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        shortId: { type: 'integer' },
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
        submittedDate: {
          type: ['string', 'object', 'null'],
          format: 'date-time',
        },
        submitterId: { type: ['string', 'null'], format: 'uuid' },
        published: { type: ['string', 'object', 'null'], format: 'date-time' },
        evaluationsHypothesisMap: {},
        isImported: { type: ['boolean', 'null'] },
        importSource: { type: ['string', 'null'], format: 'uuid' },
        importSourceServer: { type: ['string', 'null'] },
        isHidden: { type: ['boolean', 'null'] },
        formFieldsToPublish: { type: 'array' },
        searchableText: { type: 'string' },
      },
    }
  }
}

Manuscript.type = 'Manuscript'
module.exports = Manuscript
