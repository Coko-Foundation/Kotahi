/* eslint-disable prefer-destructuring */
const { ref } = require('objection')
const axios = require('axios')
const { mergeWith, isArray } = require('lodash')
const config = require('config')
const { pubsubManager } = require('@coko/server')
const models = require('@pubsweet/models')

const { getPubsub } = pubsubManager
const Form = require('../../model-form/src/form')
const publishToCrossref = require('../../publishing/crossref')
const { stripSensitiveItems } = require('./manuscriptUtils')

const {
  publishToHypothesis,
  deletePublication,
} = require('../../publishing/hypothesis')

const sendEmailNotification = require('../../email-notifications')

const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')
const importArticlesFromBiorxiv = require('../../import-articles/biorxiv-import')
const importArticlesFromBiorxivWithFullTextSearch = require('../../import-articles/biorxiv-full-text-import')
const importArticlesFromPubmed = require('../../import-articles/pubmed-import')
const publishToGoogleSpreadSheet = require('../../publishing/google-spreadsheet')

const SUBMISSION_FIELD_PREFIX = 'submission'
const META_FIELD_PREFIX = 'meta'

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
        : (await models.Manuscript.query().findById(parent.id)).$relatedQuery(
            'reviews',
          )
    },
    async teams(parent, _, ctx) {
      return parent.teams
        ? parent.teams
        : (await models.Manuscript.query().findById(parent.id)).$relatedQuery(
            'teams',
          )
    },
    async files(parent, _, ctx) {
      return parent.files
        ? parent.files
        : (await models.Manuscript.query().findById(parent.id)).$relatedQuery(
            'files',
          )
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
        return models.Manuscript.relatedQuery('manuscriptVersions')
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
  const ms = await models.Manuscript.query().findById(id)
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

  return models.Manuscript.query().updateAndFetchById(id, updatedMs)
}

/** Get evaluations as [ [submission.review1, submission.review1date], [submission.review2, submission.review2date], ..., [submission.summary, submission.summarydate] ] */
const getEvaluationsAndDates = manuscript => {
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

  return evaluationValues
}

const hasEvaluations = manuscript => {
  const evaluations = getEvaluationsAndDates(manuscript)
  return evaluations.map(checkIsAbstractValueEmpty).some(isEmpty => !isEmpty)
}

/** Send the manuscriptId OR a configured ref; and send token if one is configured */
const tryPublishingWebhook = manuscriptId => {
  const publishingWebhookUrl = config['publishing-webhook'].publishingWebhookUrl

  if (publishingWebhookUrl) {
    const token = config['publishing-webhook'].publishingWebhookToken
    const reference = config['publishing-webhook'].publishingWebhookRef
    const payload = { ref: reference || manuscriptId }
    if (token) payload.token = token

    axios
      .post(publishingWebhookUrl, payload)
      // .then(res => {})
      .catch(error => {
        console.error(
          `Failed to call publishing webhook at ${publishingWebhookUrl} for article ${manuscriptId}`,
        )
        console.error(error)
      })
  }
}

/** Filtering function to discard items with duplicate fields */
const discardDuplicateFields = (item, index, self) =>
  self.findIndex(x => x.field === item.field) === index

/** Checks if the field exists in the form and is validly named (not causing risk of sql injection),
 * and if so returns the groupName ('meta' or 'submission') and the field name.
 * Also returns valuesAreKeyedObjects, which indicates whether values for this field
 * are key-value pairs as opposed to strings.
 */
const getSafelyNamedJsonbFieldInfo = (fieldName, submissionForm) => {
  const groupName = [SUBMISSION_FIELD_PREFIX, META_FIELD_PREFIX].find(x =>
    fieldName.startsWith(`${x}.`),
  )

  if (!groupName) return null

  const field =
    submissionForm &&
    submissionForm.structure.children.find(f => f.name === fieldName)

  if (!field) {
    console.warn(`Ignoring unknown field "${fieldName}"`)
    return null
  }

  const name = fieldName.substring(groupName.length + 1)

  if (!/^[a-zA-Z]\w*$/.test(name)) {
    console.warn(`Ignoring unsupported field "${fieldName}"`)
    return null
  }

  return { groupName, name, valuesAreKeyedObjects: !!field.options }
}

/** Check that the field exists and is not dangerously named (to avoid sql injection) */
const isValidNonJsonbField = (fieldName, submissionForm) => {
  if (!/^[a-zA-Z]\w*$/.test(fieldName)) {
    console.warn(`Ignoring unsupported field "${fieldName}"`)
    return false
  }

  if (
    !submissionForm ||
    submissionForm.structure.children.find(f => f.name === fieldName)
  ) {
    console.warn(`Ignoring unknown field "${fieldName}"`)
    return false
  }

  return true
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
        submitterId: ctx.user,
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
          // In order to match the behaviour of the createFile mutation, we add a prefix to the URL.
          // This gives the URL required for download from the client (see app.js).
          // TODO We should really be storing the URL from the point of view of the server (prefix is 'uploads/'), not of the client.
          // TODO We can then convert to the client-centric URL at the point of passing a file object to the client.
          // TODO This should be changed both here and for the createFile query, and we'll need a migration to convert all existing URLs in the DB.
          return {
            name: file.filename,
            storedObjects: [],
          }
        }),
        reviews: [],
        teams: [
          {
            role: 'author',
            name: 'Author',
            members: [{ user: { id: ctx.user } }],
          },
        ],
      }

      if (['ncrc', 'colab'].includes(process.env.INSTANCE_NAME)) {
        emptyManuscript.submission.editDate = new Date()
          .toISOString()
          .split('T')[0]
      }

      const manuscript = await models.Manuscript.query().upsertGraphAndFetch(
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
        const importedManuscripts = await importArticlesFromBiorxivWithFullTextSearch(
          ctx,
          [
            'membrane protein',
            'ion channel',
            'transporter',
            'pump',
            'gpcr',
            'G protein-coupled receptor',
            'exchanger',
            'uniporter',
            'symporter',
            'antiporter',
            'solute carrier',
            'atpase',
            'rhodopsin',
            'patch-clamp',
            'voltage-clamp',
            'single-channel',
          ],
        )

        isImportInProgress = false

        pubsub.publish('IMPORT_MANUSCRIPTS_STATUS', {
          manuscriptsImportStatus: true,
        })

        return importedManuscripts
      }

      return null
    },
    async deleteManuscripts(_, { ids }, ctx) {
      if (ids.length > 0) {
        await Promise.all(
          ids.map(toDeleteItem =>
            models.Manuscript.query().deleteById(toDeleteItem),
          ),
        )
      }

      return ids
    },
    async deleteManuscript(_, { id }, ctx) {
      const toDeleteList = []
      const manuscript = await models.Manuscript.find(id)

      toDeleteList.push(manuscript.id)

      if (
        config.hypothesis.apiKey &&
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
        const parentManuscripts = await models.Manuscript.findByField(
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
            models.Manuscript.query().deleteById(toDeleteItem),
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
        if (team.members[i].userId === context.user)
          team.members[i].status = action
      }

      await new TeamModel(team).saveGraph()

      if (action === 'accepted') {
        const review = {
          recommendation: '',
          isDecision: false,
          userId: context.user,
          manuscriptId: team.manuscriptId,
        }

        await new ReviewModel(review).save()
      }

      if (
        action === 'rejected' &&
        config['notification-email'].automated === 'true'
      ) {
        // Automated email reviewReject on rejection
        const reviewer = await models.User.query()
          .findById(context.user)
          .withGraphFetched('[defaultIdentity]')

        const reviewerName = (
          reviewer.defaultIdentity.name ||
          reviewer.username ||
          ''
        ).split(' ')[0]

        const manuscript = await models.Manuscript.query()
          .findById(team.manuscriptId)
          .withGraphFetched(
            '[teams.[members.[user.[defaultIdentity]]], submitter.[defaultIdentity]]',
          )

        const handlingEditorTeam =
          manuscript.teams &&
          !!manuscript.teams.length &&
          manuscript.teams.find(manuscriptTeam => {
            return manuscriptTeam.role.includes('handlingEditor')
          })

        const handlingEditor =
          handlingEditorTeam && !!handlingEditorTeam.members.length
            ? handlingEditorTeam.members[0]
            : null

        const receiverEmail = handlingEditor.user.email
        /* eslint-disable-next-line */
        const receiverFirstName = (
          handlingEditor.user.defaultIdentity.name ||
          handlingEditor.user.username ||
          ''
        ).split(' ')[0]

        const selectedTemplate = 'reviewRejectEmailTemplate'
        const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/
        const emailValidationResult = emailValidationRegexp.test(receiverEmail)

        if (!emailValidationResult || !receiverFirstName) {
          return team
        }

        const data = {
          articleTitle: manuscript.meta.title,
          authorName:
            manuscript.submitter.defaultIdentity.name ||
            manuscript.submitter.username ||
            '',
          receiverFirstName,
          reviewerName,
          shortId: manuscript.shortId,
        }

        try {
          await sendEmailNotification(receiverEmail, selectedTemplate, data)
        } catch (e) {
          /* eslint-disable-next-line */
          console.log('email was not sent', e)
        }
      }

      return team
    },
    async updateManuscript(_, { id, input }, ctx) {
      return commonUpdateManuscript(id, input, ctx) // Currently submitManuscript and updateManuscript have identical action
    },

    async createNewVersion(_, { id }, ctx) {
      const manuscript = await models.Manuscript.query().findById(id)
      return manuscript.createNewVersion()
    },
    async submitManuscript(_, { id, input }, ctx) {
      if (config['notification-email'].automated === 'true') {
        // Automated email submissionConfirmation on submission
        const manuscript = await models.Manuscript.query()
          .findById(id)
          .withGraphFetched('submitter.[defaultIdentity]')

        const receiverEmail = manuscript.submitter.email
        /* eslint-disable-next-line */
        const receiverFirstName = (
          manuscript.submitter.defaultIdentity.name ||
          manuscript.submitter.username ||
          ''
        ).split(' ')[0]

        const selectedTemplate = 'submissionConfirmationEmailTemplate'
        const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/
        const emailValidationResult = emailValidationRegexp.test(receiverEmail)

        if (!emailValidationResult || !receiverFirstName) {
          return commonUpdateManuscript(id, input, ctx)
        }

        const data = {
          articleTitle: manuscript.meta.title,
          authorName:
            manuscript.submitter.defaultIdentity.name ||
            manuscript.submitter.username ||
            '',
          receiverFirstName,
          shortId: manuscript.shortId,
        }

        try {
          await sendEmailNotification(receiverEmail, selectedTemplate, data)
        } catch (e) {
          /* eslint-disable-next-line */
          console.log('email was not sent', e)
        }
      }

      return commonUpdateManuscript(id, input, ctx) // Currently submitManuscript and updateManuscript have identical action
    },

    async makeDecision(_, { id, decision }, ctx) {
      const manuscript = await models.Manuscript.query()
        .findById(id)
        .withGraphFetched('submitter.[defaultIdentity]')

      manuscript.decision = decision

      manuscript.status = decision

      if (
        manuscript.decision &&
        config['notification-email'].automated === 'true'
      ) {
        // Automated email evaluvationComplete on decision
        const receiverEmail = manuscript.submitter.email
        /* eslint-disable-next-line */
        const receiverFirstName = (
          manuscript.submitter.defaultIdentity.name ||
          manuscript.submitter.username ||
          ''
        ).split(' ')[0]

        const selectedTemplate = 'evaluationCompleteEmailTemplate'
        const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/
        const emailValidationResult = emailValidationRegexp.test(receiverEmail)

        if (!emailValidationResult || !receiverFirstName) {
          return manuscript.save()
        }

        const data = {
          articleTitle: manuscript.meta.title,
          authorName:
            manuscript.submitter.defaultIdentity.name ||
            manuscript.submitter.username ||
            '',
          receiverFirstName,
          shortId: manuscript.shortId,
        }

        try {
          await sendEmailNotification(receiverEmail, selectedTemplate, data)
        } catch (e) {
          /* eslint-disable-next-line */
          console.log('email was not sent', e)
        }
      }

      return manuscript.save()
    },
    async addReviewer(_, { manuscriptId, userId }, ctx) {
      const manuscript = await models.Manuscript.query().findById(manuscriptId)

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
          await new models.TeamMember({
            teamId: existingTeam.id,
            status: 'invited',
            userId,
          }).save()
        }

        return existingTeam.$query().eager('members.[user]')
      }

      // Create a new team of reviewers if it doesn't exist
      const newTeam = await new models.Team({
        manuscriptId,
        members: [{ status: 'invited', userId }],
        role: 'reviewer',
        name: 'Reviewers',
      }).saveGraph()

      return newTeam
    },
    async removeReviewer(_, { manuscriptId, userId }, ctx) {
      const manuscript = await models.Manuscript.query().findById(manuscriptId)

      const reviewerTeam = await manuscript
        .$relatedQuery('teams')
        .where('role', 'reviewer')
        .first()

      await models.TeamMember.query()
        .where({
          userId,
          teamId: reviewerTeam.id,
        })
        .delete()

      return reviewerTeam.$query().eager('members.[user]')
    },

    async publishManuscript(_, { id }, ctx) {
      const manuscript = await models.Manuscript.query().findById(id)
      const update = {} // This will collect any properties we may want to update in the DB
      update.published = new Date()

      const steps = []

      if (config.crossref.login) {
        const stepLabel = 'Crossref'
        const containsEvaluations = hasEvaluations(manuscript)

        // A 'published' article without evaluations will become 'evaluated'.
        // The intention is that an evaluated article should never revert to any state prior to "evaluated",
        // but that only articles with evaluations can be 'published'.
        update.status = containsEvaluations ? 'published' : 'evaluated'

        let succeeded
        let errorMessage

        if (containsEvaluations || manuscript.status !== 'evaluated') {
          try {
            await publishToCrossref(manuscript)
            succeeded = true
          } catch (e) {
            console.error('error publishing to crossref')
            console.error(e)
            succeeded = false
            errorMessage = e
          }
        }

        steps.push({
          stepLabel,
          succeeded,
          errorMessage,
        })
      }

      if (process.env.INSTANCE_NAME === 'ncrc') {
        let succeeded
        let errorMessage
        let stepLabel

        try {
          if (await publishToGoogleSpreadSheet(manuscript)) {
            stepLabel = 'Google Spreadsheet'
            update.status = 'published'
            update.submission = {
              ...manuscript.submission,
              editDate: new Date().toISOString().split('T')[0],
            }
          } else return null
        } catch (e) {
          console.error('error while publishing in google spreadsheet')
          console.error(e)
          succeeded = false
          errorMessage = e
          return null
        }

        steps.push(succeeded, errorMessage, stepLabel)
      } else if (['colab'].includes(process.env.INSTANCE_NAME)) {
        // TODO: A note in the code said that for Colab instance, submission.editDate should be updated. Is this true? (See commonUpdateManuscript() for example code.)
      }

      if (config.hypothesis.apiKey) {
        const stepLabel = 'Hypothesis'
        let succeeded
        let errorMessage
        if (!manuscript.evaluationsHypothesisMap)
          manuscript.evaluationsHypothesisMap = {}

        try {
          update.evaluationsHypothesisMap = await publishToHypothesis(
            manuscript,
          )
          succeeded = true
        } catch (err) {
          let message = 'Publishing to hypothes.is failed!\n'
          if (err.response) {
            message += `${err.response.status} ${err.response.statusText}\n`
            message += `${JSON.stringify(err.response.data)}`
          } else message += err.toString()
          succeeded = false
          errorMessage = message
          throw new Error(message)
        }

        steps.push(stepLabel, succeeded, errorMessage)
      }

      tryPublishingWebhook(manuscript.id)

      const updatedManuscript = await models.Manuscript.query().updateAndFetchById(
        id,
        update,
      )

      return { manuscript: updatedManuscript, steps }
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
        .withGraphFetched('[teams, channels, files, reviews.[user, comments]]')

      const user = await models.User.query().findById(ctx.user)

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

      if (user && !user.admin) {
        return stripSensitiveItems(manuscript)
      }

      return manuscript
    },
    async manuscriptsUserHasCurrentRoleIn(_, input, ctx) {
      // Get all manuscript versions that this user has a role in
      const teamMemberManuscripts = await models.TeamMember.query()
        .where({ userId: ctx.user })
        .withGraphFetched('[team.[manuscript]]')

      // Get IDs of the top-level manuscripts
      const topLevelManuscriptIds = [
        ...new Set(
          teamMemberManuscripts.map(
            teamMember =>
              teamMember.team.manuscript.parentId ||
              teamMember.team.manuscript.id,
          ),
        ),
      ]

      // Get those top-level manuscripts with all versions, all with teams and members
      const manuscripts = await models.Manuscript.query()
        .withGraphFetched(
          '[teams.[members], manuscriptVersions(orderByCreated).[teams.[members]]]',
        )
        .whereIn('id', topLevelManuscriptIds)
        .orderBy('created', 'desc')

      const filteredManuscripts = []

      manuscripts.forEach(m => {
        const latestVersion =
          m.manuscriptVersions && m.manuscriptVersions.length > 0
            ? m.manuscriptVersions[m.manuscriptVersions.length - 1]
            : m

        if (
          latestVersion.teams.some(t =>
            t.members.some(member => member.userId === ctx.user),
          )
        )
          filteredManuscripts.push(m)
      })

      return filteredManuscripts
    },
    async manuscripts(_, { where }, ctx) {
      return models.Manuscript.query()
        .withGraphFetched(
          '[teams, reviews, manuscriptVersions(orderByCreated)]',
        )
        .where({ parentId: null, isHidden: null })
        .orderBy('created', 'desc')
    },
    async publishedManuscripts(_, { sort, offset, limit }, ctx) {
      const query = models.Manuscript.query()
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
    async paginatedManuscripts(_, { sort, offset, limit, filters }, ctx) {
      const submissionForm = await Form.findOneByField('purpose', 'submit')

      const query = models.Manuscript.query().where({
        parentId: null,
        isHidden: null,
      })

      if (sort) {
        const sortDirection = sort.isAscending ? 'ASC' : 'DESC'

        const jsonbField = getSafelyNamedJsonbFieldInfo(
          sort.field,
          submissionForm,
        )

        if (jsonbField) {
          query.orderByRaw(
            `LOWER(${jsonbField.groupName}->>'${jsonbField.name}') ${sortDirection}, id ${sortDirection}`,
          )
        } else if (isValidNonJsonbField(sort.field, submissionForm)) {
          query.orderBy(sort.field, sort.isAscending ? null : 'DESC')
        } else {
          console.warn(`Could not sort on field "${sort.field}`)
        }
      }

      filters.filter(discardDuplicateFields).forEach(filter => {
        if (!/^[\w :./,()-<>=_]+$/.test(filter.value)) {
          console.warn(
            `Ignoring filter "${filter.field}" with illegal value "${filter.value}"`, // To prevent code injection!
          )
          return // i.e., continue.
        }

        const jsonbField = getSafelyNamedJsonbFieldInfo(
          filter.field,
          submissionForm,
        )

        if (jsonbField) {
          if (jsonbField.valuesAreKeyedObjects) {
            query.whereRaw(
              `(${jsonbField.groupName}->'${jsonbField.name}')::jsonb \\? ?`,
              filter.value,
            )
          } else {
            query.whereRaw(
              `${jsonbField.groupName}->>'${jsonbField.name}' = '%${filter.value}%'`,
            )
          }
        } else if (filter.field === 'status') {
          query.where({ status: filter.value })
        } else {
          console.warn(
            `Could not filter on field "${filter.field}" by value "${filter.value}"`,
          )
        }
      })

      const totalCount = await query.resultSize()

      if (limit) {
        query.limit(limit)
      }

      if (offset) {
        query.offset(offset)
      }

      const manuscripts = await query.withGraphFetched(
        '[submitter, teams.[members.[user.[defaultIdentity]]], manuscriptVersions(orderByCreated).[submitter, teams.[members.[user.[defaultIdentity]]]]]',
      )

      return { totalCount, manuscripts }
    },
    async manuscriptsPublishedSinceDate(_, { startDate, limit }, ctx) {
      const query = models.Manuscript.query()
        .whereNotNull('published')
        .orderBy('published')
        .withGraphFetched('[files]')

      if (startDate) query.where('published', '>=', new Date(startDate))
      if (limit) query.limit(limit)

      const manuscripts = await query

      return manuscripts.map(m => ({
        id: m.id,
        shortId: m.shortId,
        files: m.files,
        status: m.status,
        meta: m.meta,
        submission: JSON.stringify(m.submission),
        publishedDate: m.published,
      }))
    },
    async publishedManuscript(_, { id }, ctx) {
      const m = await models.Manuscript.query()
        .findById(id)
        .whereNotNull('published')
        .withGraphFetched('[files]')

      if (!m) return null

      return {
        id: m.id,
        shortId: m.shortId,
        files: m.files,
        status: m.status,
        meta: m.meta,
        submission: JSON.stringify(m.submission),
        publishedDate: m.published,
      }
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
    paginatedManuscripts(offset: Int, limit: Int, sort: ManuscriptsSort, filters: [ManuscriptsFilter!]!): PaginatedManuscripts
    publishedManuscripts(sort:String, offset: Int, limit: Int): PaginatedManuscripts
    validateDOI(articleURL: String): validateDOIResponse
    manuscriptsUserHasCurrentRoleIn: [Manuscript]

    """ Get published manuscripts with irrelevant fields stripped out. Optionally, you can specify a startDate and/or limit. """
    manuscriptsPublishedSinceDate(startDate: DateTime, limit: Int): [PublishedManuscript]!
    """ Get a published manuscript by ID, or null if this manuscript is not published or not found """
    publishedManuscript(id: ID!): PublishedManuscript
  }

  input ManuscriptsFilter {
    field: String!
    value: String!
  }

  input ManuscriptsSort {
    field: String!
    isAscending: Boolean!
  }

  type validateDOIResponse {
    isDOIValid: Boolean
  }

  type PaginatedManuscripts {
    totalCount: Int
    manuscripts: [Manuscript]
  }

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
    publishManuscript(id: ID!): PublishingResult!
    createNewVersion(id: ID!): Manuscript
    importManuscripts: PaginatedManuscripts
  }

  type Manuscript implements Object {
    id: ID!
    parentId: ID
    created: DateTime!
    updated: DateTime
    manuscriptVersions: [ManuscriptVersion]
    shortId: Int!
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
    shortId: Int!
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

  type PublishingResult {
    manuscript: Manuscript
    steps: [PublishingStepResult]!
  }

  type PublishingStepResult {
    stepLabel: String!
    succeeded: Boolean!
    errorMessage: String
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

  """ A simplified Manuscript object containing only relevant fields for publishing """
  type PublishedManuscript {
    id: ID!
    shortId: Int!
    files: [File]
    status: String
    meta: ManuscriptMeta
    submission: String
    publishedDate: DateTime
  }
`

module.exports = {
  typeDefs,
  resolvers,
  mergeArrays,
}
