const { BaseModel } = require('@coko/server')
const omit = require('lodash/omit')
const cloneDeep = require('lodash/cloneDeep')
const { raw } = require('objection')
const sortBy = require('lodash/sortBy')
const { getDecisionForm } = require('../../model-review/src/reviewCommsUtils')

const {
  deleteAlertsForManuscript,
} = require('../../model-task/src/taskCommsUtils')

const { evictFromCache } = require('../../querycache')

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
      orderByCreatedDesc(builder) {
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

  async getManuscriptAuthor() {
    if (!this.id) {
      return null
    }

    const manuscriptWithAuthors = await Manuscript.query()
      .findById(this.id)
      .withGraphFetched('teams(onlyAuthors).members(orderByCreatedDesc).user')

    if (
      !manuscriptWithAuthors.teams.length ||
      !manuscriptWithAuthors.teams[0].members.length
    ) {
      return null
    }

    const authorTeam = manuscriptWithAuthors.teams[0]
    const author = authorTeam.members[0] // picking the author that has latest created date
    return author.user
  }

  async getManuscriptEditor() {
    if (!this.id) {
      return null
    }

    const manuscriptWithEditors = await Manuscript.query()
      .findById(this.id)
      .withGraphFetched(
        '[teams(onlyEditors).[members(orderByCreatedDesc).[user]]]',
      )

    if (
      !manuscriptWithEditors.teams.length ||
      !manuscriptWithEditors.teams[0].members.length
    ) {
      return null
    }

    const editorTeam = manuscriptWithEditors.teams[0]
    const editor = editorTeam.members[0] // picking the editor that has latest created date
    return editor.user
  }

  async createNewVersion() {
    // eslint-disable-next-line global-require
    const Config = require('../../config/src/config')

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

    const decisions = await this.$relatedQuery('reviews').where({
      isDecision: true,
    })

    const decisionForm = await getDecisionForm(this.groupId)

    const threadedDiscussionFieldNames = decisionForm
      ? decisionForm.structure.children
          .filter(field => field.component === 'ThreadedDiscussion')
          .map(field => field.name)
      : []

    const clonedDecisions = decisions.map(decision => {
      const clonedDecision = cloneDeep(decision)
      delete clonedDecision.id
      clonedDecision.jsonData = {}

      Object.entries(decision.jsonData)
        .filter(([key]) => threadedDiscussionFieldNames.includes(key))
        .forEach(([key, value]) => {
          clonedDecision.jsonData[key] = value
        })

      return clonedDecision
    })

    const newVersion = cloneDeep(this)
    newVersion.teams = teams
    // eslint-disable-next-line
    newVersion.reviews = clonedDecisions
    newVersion.files = files

    const activeConfig = await Config.getCached(this.groupId)

    if (
      activeConfig.formData.submission.allowAuthorsSubmitNewVersion ||
      this.status === 'revise'
    ) {
      newVersion.status = 'revising'
    }

    // All versions should be linked to one parent, original manuscript
    newVersion.parentId = this.parentId || this.id

    newVersion.authorFeedback = {}
    evictFromCache(`subVersionsOfMs:${newVersion.parentId}`)

    const manuscript = await Manuscript.query().insertGraphAndFetch(
      omit(cloneDeep(newVersion), ['id', 'created', 'updated', 'decision']),
    )

    await deleteAlertsForManuscript(this.id)

    return manuscript
  }

  async getManuscriptVersions() {
    // const { File } = require('@pubsweet/models')

    const id = this.parentId || this.id

    const manuscripts = await Manuscript.query()
      .where('parent_id', id)
      .withGraphFetched(
        '[invitations.[user], teams.members, reviews.user, files, tasks(orderBySequence).[assignee, emailNotifications(orderByCreated)]]',
      )

    const firstManuscript = await Manuscript.query()
      .findById(id)
      .withGraphFetched(
        '[invitations.[user], teams.members, reviews.user, files, tasks(orderBySequence).[assignee, emailNotifications(orderByCreated)]]',
      )

    manuscripts.push(firstManuscript)

    const manuscriptVersionsArray = manuscripts.filter(
      manuscript => this.id !== manuscript.id,
    )

    const manuscriptVersions = sortBy(
      manuscriptVersionsArray,
      manuscript => -manuscript.created,
    )

    return manuscriptVersions
  }

  /** Find all manuscripts (any version) for which the user serves in any role as a
   * team-member, and return the IDs of the first versions of those manuscripts.
   * E.g. If the given user was invited as a reviewer of the second version of a
   * manuscript, the first version of that manuscript will be included in the results.
   */
  static async getFirstVersionIdsOfManuscriptsUserHasARoleIn(userId, groupId) {
    const records = await Manuscript.query()
      .select(
        raw('coalesce(manuscripts.parent_id, manuscripts.id) AS top_level_id'),
      )
      .join('teams', 'manuscripts.id', '=', 'teams.object_id')
      .join('team_members', 'teams.id', '=', 'team_members.team_id')
      .where('team_members.user_id', userId)
      .where('is_hidden', false)
      .where('group_id', groupId)
      .distinct()

    return records.map(r => r.topLevelId)
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const { Channel, User, Review } = require('@pubsweet/models')
    /* eslint-disable-next-line global-require */
    const File = require('@coko/server/src/models/file/file.model')
    /* eslint-disable-next-line global-require */
    const Team = require('../../model-team/src/team')
    /* eslint-disable-next-line global-require */
    const Task = require('../../model-task/src/task')
    /* eslint-disable-next-line global-require */
    const Invitation = require('../../model-invitations/src/invitations')
    /* eslint-disable-next-line global-require */
    const PublishedArtifact = require('../../model-published-artifact/src/publishedArtifact')
    /* eslint-disable-next-line global-require */
    const ThreadedDiscussion = require('../../model-threaded-discussion/src/threadedDiscussion')
    /* eslint-disable-next-line global-require */
    const Group = require('../../model-group/src/group')

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
        onBuildKnex: (knexBuilder, builder) => {
          // Modify the join condition based on manuscripts.parent_id
          if (builder.parentModel().parent_id !== null) {
            knexBuilder.on(
              'manuscripts.parent_id',
              '=',
              'channels.manuscriptId',
            )
          }
        },
      },
      tasks: {
        relation: BaseModel.HasManyRelation,
        modelClass: Task,
        join: {
          from: 'manuscripts.id',
          to: 'tasks.manuscriptId',
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
      publishedArtifacts: {
        relation: BaseModel.HasManyRelation,
        modelClass: PublishedArtifact,
        join: {
          from: 'manuscripts.id',
          to: 'published_artifacts.manuscriptId',
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
      invitations: {
        relation: BaseModel.HasManyRelation,
        modelClass: Invitation,
        join: {
          from: 'manuscripts.id',
          to: 'invitations.manuscriptId',
        },
      },
      threadedDiscussions: {
        relation: BaseModel.HasManyRelation,
        modelClass: ThreadedDiscussion,
      },
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'manuscripts.groupId',
          to: 'groups.id',
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
        tasks: {
          items: { type: 'object' },
          type: ['array', 'null'],
        },
        reviews: {
          items: { type: 'object' },
          type: ['array', 'null'],
        },
        status: { type: ['string', 'null'] },
        decision: { type: ['string', 'null'] },
        authors: {
          items: { type: 'object' },
          type: ['array', 'null'],
        },
        meta: {
          type: 'object',
          properties: {
            title: { type: 'string' }, // TODO DEPRECATED. Remove once we clean up old migrations.
            abstract: { type: ['string', 'null'] }, // TODO DEPRECATED. Remove once we clean up old migrations.
            source: { type: 'string' },
            history: {
              items: { type: 'object' },
              type: ['array', 'null'],
            },
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
        doi: { type: ['string', 'null'] },
        searchableText: { type: 'string' },
        groupId: { type: ['string', 'null'], format: 'uuid' },
        authorFeedback: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            fileIds: { type: 'array' },
            submitterId: { type: ['string', 'null'], format: 'uuid' },
            edited: {
              type: ['string', 'object', 'null'],
              format: 'date-time',
            },
            submitted: {
              type: ['string', 'object', 'null'],
              format: 'date-time',
            },
            assignedAuthors: {
              items: { type: 'object' },
              type: ['array', 'null'],
            },
          },
        },
      },
    }
  }
}

Manuscript.type = 'Manuscript'
module.exports = Manuscript
