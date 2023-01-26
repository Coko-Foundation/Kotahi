/* eslint-disable prefer-destructuring */
const { ref } = require('objection')
const axios = require('axios')
const { map } = require('lodash')
const config = require('config')
const { pubsubManager, File } = require('@coko/server')
const models = require('@pubsweet/models')
const cheerio = require('cheerio')
const { raw } = require('objection')

const {
  importManuscripts,
  manuscriptHasOverdueTasksForUser,
} = require('./manuscriptCommsUtils')

const Team = require('../../model-team/src/team')
const TeamMember = require('../../model-team/src/team_member')

const { getPubsub } = pubsubManager
const Form = require('../../model-form/src/form')
const Message = require('../../model-message/src/message')

const {
  publishToCrossref,
  getReviewOrSubmissionField,
  getDoi,
  doiIsAvailable,
  doiExists,
} = require('../../publishing/crossref')

const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')

const {
  fixMissingValuesInFiles,
  hasEvaluations,
  stripConfidentialDataFromReviews,
  buildQueryForManuscriptSearchFilterAndOrder,
  applyTemplatesToArtifacts,
} = require('./manuscriptUtils')

const { applyTemplate, generateCss } = require('../../pdfexport/applyTemplate')
const publicationMetadata = require('../../pdfexport/pdfTemplates/publicationMetadata')
const articleMetadata = require('../../pdfexport/pdfTemplates/articleMetadata')

const {
  getFilesWithUrl,
  replaceImageSrc,
  replaceImageSrcResponsive,
  base64Images,
  uploadImage,
} = require('../../utils/fileStorageUtils')

const {
  publishToHypothesis,
  deletePublication,
} = require('../../publishing/hypothesis')

const sendEmailNotification = require('../../email-notifications')

const publishToGoogleSpreadSheet = require('../../publishing/google-spreadsheet')
const validateApiToken = require('../../utils/validateApiToken')
const { deepMergeObjectsReplacingArrays } = require('../../utils/objectUtils')
const { tryPublishDocMaps } = require('../../publishing/docmaps')

const {
  populateTemplatedTasksForManuscript,
  deleteAlertsForManuscript,
} = require('../../model-task/src/taskCommsUtils')

const {
  convertFilesToFullObjects,
} = require('../../model-review/src/reviewUtils')

const {
  getReviewForm,
  getDecisionForm,
} = require('../../model-review/src/reviewCommsUtils')

const {
  getThreadedDiscussionsForManuscript,
} = require('../../model-threaded-discussion/src/threadedDiscussionCommsUtils')

const { getUsersById } = require('../../model-user/src/userCommsUtils')
const { getActiveForms } = require('../../model-form/src/formCommsUtils')

const repackageForGraphql = async ms => {
  const result = { ...fixMissingValuesInFiles(ms) }
  await regenerateAllFileUris(result)

  if (result.reviews && typeof result.reviews !== 'string')
    result.reviews = result.reviews.map(review => ({
      ...review,
      jsonData: JSON.stringify(review.jsonData),
    }))
  return result
}

const updateAndRepackageForGraphql = async ms => {
  const updatedMs = await models.Manuscript.query().updateAndFetchById(
    ms.id,
    ms,
  )

  return repackageForGraphql(updatedMs)
}

/* eslint-disable no-param-reassign, no-restricted-syntax, no-await-in-loop */
const regenerateAllFileUris = async manuscript => {
  const reviewForm = await getReviewForm()
  const decisionForm = await getDecisionForm()
  const allFiles = []

  if (manuscript.files) {
    manuscript.files = await getFilesWithUrl(manuscript.files)
    allFiles.push(...manuscript.files)
  }

  if (manuscript.reviews) {
    for (const review of manuscript.reviews)
      await convertFilesToFullObjects(
        review,
        review.isDecision ? decisionForm : reviewForm,
        async ids => File.query().findByIds(ids),
        getFilesWithUrl,
      )
  }

  if (manuscript.manuscriptVersions) {
    for (const v of manuscript.manuscriptVersions) {
      if (v.files) {
        v.files = await getFilesWithUrl(v.files)
        allFiles.push(...v.files)
      }

      if (v.reviews) {
        for (const review of v.reviews)
          await convertFilesToFullObjects(
            review,
            review.isDecision ? decisionForm : reviewForm,
            async ids => File.query().findByIds(ids),
            getFilesWithUrl,
          )
      }
    }
  }

  // Currently we're not recreating files in the manuscript when we create a new version,
  // so some files found in the HTML source may actually be owned by a previous version.
  // We therefore need to have ALL files available when doing replacements.
  // TODO Fix this by recreating all files upon creating a new version, and fix old manuscripts via migration.
  if (allFiles.length && typeof manuscript.meta.source === 'string') {
    manuscript.meta.source = await replaceImageSrcResponsive(
      manuscript.meta.source,
      allFiles,
    )
  }

  if (manuscript.manuscriptVersions) {
    for (const v of manuscript.manuscriptVersions) {
      if (allFiles.length && typeof v.meta.source === 'string') {
        v.meta.source = await replaceImageSrcResponsive(v.meta.source, allFiles)
      }
    }
  }
}
/* eslint-enable no-param-reassign, no-restricted-syntax, no-await-in-loop */

const isEditorOfManuscript = async (userId, manuscriptWithTeams) => {
  const { teams } = manuscriptWithTeams

  const editorTeamIds = teams
    .filter(t => ['editor', 'handlingEditor', 'seniorEditor'].includes(t.role))
    .map(t => t.id)

  const result = await TeamMember.query()
    .select('id')
    .where({ userId })
    .whereIn('teamId', editorTeamIds)
    .limit(1)

  return !!result.length
}

const getCss = async () => {
  const css = await generateCss()
  return css
}

/** Get reviews from the manuscript if present, or from DB. Generate full file info for
 * all files attached to reviews, and stringify JSON data in preparation for serving to client.
 * Note: 'reviews' include the decision object.
 */
const getRelatedReviews = async manuscript => {
  const reviewForm = await getReviewForm()
  const decisionForm = await getDecisionForm()

  const reviews =
    manuscript.reviews ||
    (await (
      await models.Manuscript.query().findById(manuscript.id)
    ).$relatedQuery('reviews')) ||
    []

  // eslint-disable-next-line no-restricted-syntax
  for (const review of reviews) {
    // eslint-disable-next-line no-await-in-loop
    await convertFilesToFullObjects(
      review,
      review.isDecision ? decisionForm : reviewForm,
      async ids => File.query().findByIds(ids),
      getFilesWithUrl,
    )
  }

  return reviews.map(review => ({
    ...review,
    jsonData: JSON.stringify(review.jsonData),
  }))
}

/** Get published artifacts from the manuscript if present, or from DB.
 * Expand the templated contents of artifacts in preparation for serving to client.
 */
const getRelatedPublishedArtifacts = async manuscript => {
  const templatedArtifacts =
    manuscript.publishedArtifacts ||
    (await (
      await models.Manuscript.query().findById(manuscript.id)
    ).$relatedQuery('publishedArtifacts'))

  const reviews = manuscript.reviews || (await getRelatedReviews(manuscript))

  const threadedDiscussions =
    manuscript.threadedDiscussions ||
    (await getThreadedDiscussionsForManuscript(manuscript, getUsersById))

  const submission =
    typeof manuscript.submission === 'string'
      ? JSON.parse(manuscript.submission)
      : manuscript.submission

  if (!templatedArtifacts.length) return []

  const { submissionForm, reviewForm, decisionForm } = getActiveForms()

  return applyTemplatesToArtifacts(
    templatedArtifacts,
    { ...manuscript, reviews, submission, threadedDiscussions },
    submissionForm,
    reviewForm,
    decisionForm,
  )
}

const ManuscriptResolvers = ({ isVersion }) => {
  const resolvers = {
    submission(parent) {
      return JSON.stringify(parent.submission)
    },
    async reviews(parent, _, ctx) {
      return getRelatedReviews(parent)
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
    async publishedArtifacts(parent, _, ctx) {
      return getRelatedPublishedArtifacts(parent)
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

/** Modifies the supplied manuscript by replacing all inlined base64 images
 *  with actual images stored to file storage */
const uploadAndConvertBase64ImagesInManuscript = async manuscript => {
  const { source } = manuscript.meta

  if (typeof source === 'string') {
    const images = base64Images(source)

    if (images.length > 0) {
      const uploadedImages = []

      await Promise.all(
        map(images, async image => {
          if (image.blob) {
            const uploadedImage = await uploadImage(image, manuscript.id)
            uploadedImages.push(uploadedImage)
          }
        }),
      )

      const uploadedImagesWithUrl = await getFilesWithUrl(uploadedImages)

      const $ = cheerio.load(source)

      map(images, (image, index) => {
        const elem = $('img').get(image.index)
        const $elem = $(elem)
        $elem.attr('data-fileid', uploadedImagesWithUrl[index].id)
        $elem.attr('alt', uploadedImagesWithUrl[index].name)
        $elem.attr(
          'src',
          uploadedImagesWithUrl[index].storedObjects.find(
            storedObject => storedObject.type === 'medium',
          ).url,
        )
      })

      // eslint-disable-next-line no-param-reassign
      manuscript.meta.source = $.html()
    }
  }
}

const commonUpdateManuscript = async (id, input, ctx) => {
  // ms = manuscript
  const msDelta = JSON.parse(input) // Convert the JSON input to JavaScript object

  const ms = await models.Manuscript.query()
    .findById(id)
    .withGraphFetched('[reviews.user, files, tasks]')

  // If this manuscript is getting its label set for the first time,
  // we will populate its task list from the template tasks
  const isSettingFirstLabels = ['colab'].includes(process.env.INSTANCE_NAME)
    ? !ms.submission.labels &&
      !!msDelta.submission &&
      !!msDelta.submission.labels
    : false

  const updatedMs = deepMergeObjectsReplacingArrays(ms, msDelta)

  // Create a date for new submissions
  if (
    updatedMs.status &&
    updatedMs.status !== 'new' &&
    !updatedMs.submittedDate
  ) {
    updatedMs.submittedDate = new Date()
  }

  if (['ncrc', 'colab'].includes(process.env.INSTANCE_NAME)) {
    updatedMs.submission.editDate = new Date().toISOString().split('T')[0]
  }

  if (isSettingFirstLabels && !updatedMs.tasks.length)
    updatedMs.tasks = await populateTemplatedTasksForManuscript(id)

  await uploadAndConvertBase64ImagesInManuscript(updatedMs)
  return updateAndRepackageForGraphql(updatedMs)
}

/** Send the manuscriptId OR a configured ref; and send token if one is configured */
const tryPublishingWebhook = async manuscriptId => {
  const publishingWebhookUrl = config['publishing-webhook'].publishingWebhookUrl

  if (publishingWebhookUrl) {
    const token = config['publishing-webhook'].publishingWebhookToken
    const reference = config['publishing-webhook'].publishingWebhookRef
    const payload = { ref: reference || manuscriptId }
    if (token) payload.token = token

    await axios
      .post(publishingWebhookUrl, payload)
      // .then(res => {})
      .catch(error => {
        const message = `Failed to call publishing webhook at ${publishingWebhookUrl} for article ${manuscriptId}`
        console.error(error)
        throw new Error(message)
      })
  }
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
        meta,
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
          return {
            ...file,
          }
        }),
        reviews: [],
        teams: [
          {
            role: 'author',
            name: 'Author',
            members: [{ user: { id: ctx.user } }],
            objectType: 'manuscript',
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

      // Base64 conversion moved to server-side as a performance imporvement
      const { source } = manuscript.meta

      if (typeof source === 'string') {
        const images = await base64Images(source)

        if (images.length > 0) {
          const uploadedImages = await Promise.all(
            map(images, async image => {
              const uploadedImage = await uploadImage(image, manuscript.id)
              return uploadedImage
            }),
          )

          const uploadedImagesWithUrl = await getFilesWithUrl(uploadedImages)

          const $ = cheerio.load(source)

          map(images, (image, index) => {
            const elem = $('img').get(index)
            const $elem = $(elem)
            $elem.attr('data-fileid', uploadedImagesWithUrl[index].id)
            $elem.attr('alt', uploadedImagesWithUrl[index].name)
            $elem.attr(
              'src',
              uploadedImagesWithUrl[index].storedObjects.find(
                storedObject => storedObject.type === 'medium',
              ).url,
            )
          })

          manuscript.meta.source = $.html()
        }
      }

      const updatedManuscript = await models.Manuscript.query().updateAndFetchById(
        manuscript.id,
        manuscript,
      )

      // newly uploaded files get tasks populated
      await populateTemplatedTasksForManuscript(manuscript.id)

      updatedManuscript.manuscriptVersions = []

      return updatedManuscript
    },

    async importManuscripts(_, props, ctx) {
      return importManuscripts(ctx)
    },

    async archiveManuscripts(_, { ids }, ctx) {
      await Promise.all(ids.map(id => deleteAlertsForManuscript(id)))

      // finding the ids of the first versions of all manuscripts:
      const selectedManuscripts = await models.Manuscript.query()
        .select('parentId', 'id')
        .whereIn('id', ids)

      const firstVersionIds = selectedManuscripts.map(m => m.parentId || m.id)

      // archiving manuscripts with either firstVersionID or parentID
      const archivedManuscripts = await models.Manuscript.query()
        .returning('id')
        .update({ isHidden: true })
        .whereIn('id', firstVersionIds)
        .orWhereIn('parentId', firstVersionIds)

      return archivedManuscripts.map(m => m.id)
    },

    async archiveManuscript(_, { id }, ctx) {
      await deleteAlertsForManuscript(id)
      const manuscript = await models.Manuscript.find(id)

      // getting the ID of the firstVersion for all manuscripts.
      const firstVersionId = manuscript.parentId || manuscript.id

      // Archive Manuscript
      const archivedManuscript = await models.Manuscript.query()
        .returning('id')
        .update({ isHidden: true })
        .where('id', firstVersionId)
        .orWhere('parentId', firstVersionId)

      return archivedManuscript[0].id
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

      if (manuscript.parentId) {
        const parentManuscripts = await models.Manuscript.findByField(
          'parent_id',
          manuscript.parentId,
        )

        parentManuscripts.forEach(ms => {
          toDeleteList.push(ms.id)
        })
      }

      // Delete all versions of manuscript
      await Promise.all(
        toDeleteList.map(async toDeleteItem => {
          if (config.hypothesis.apiKey) {
            const hypothesisArtifacts = models.PublishedArtifact.query().where({
              manuscriptId: toDeleteItem,
              platform: 'Hypothesis',
            })

            await Promise.all(
              hypothesisArtifacts.map(async artifact =>
                deletePublication(artifact.externalId),
              ),
            )
          }

          models.Manuscript.query().deleteById(toDeleteItem)
        }),
      )

      return id
    },
    // TODO Rename to something like 'setReviewerResponse'
    async reviewerResponse(_, { action, teamId }, context) {
      const {
        Review: ReviewModel,
        // eslint-disable-next-line global-require
      } = require('@pubsweet/models') // Pubsweet models may initially be undefined, so we require only when resolver runs.

      if (action !== 'accepted' && action !== 'rejected')
        throw new Error(
          `Invalid action (reviewerResponse): Must be either "accepted" or "rejected"`,
        )

      const team = await Team.query()
        .findById(teamId)
        .withGraphFetched('members')

      if (!team) throw new Error('No team was found')

      for (let i = 0; i < team.members.length; i += 1) {
        if (team.members[i].userId === context.user)
          team.members[i].status = action
      }

      await new Team(team).saveGraph()

      const existingReview = await ReviewModel.query().where({
        manuscriptId: team.objectId,
        userId: context.user,
      })

      // modify it to check if there exists a review already
      if (action === 'accepted' && existingReview.length === 0) {
        const review = {
          isDecision: false,
          isHiddenReviewerName: true,
          isHiddenFromAuthor: true,
          userId: context.user,
          manuscriptId: team.objectId,
          jsonData: '{}',
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

        const reviewerName =
          reviewer.username || reviewer.defaultIdentity.name || ''

        const manuscript = await models.Manuscript.query()
          .findById(team.objectId)
          .withGraphFetched(
            '[teams.[members.[user.[defaultIdentity]]], submitter.[defaultIdentity], channels]',
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
        const receiverName =
          handlingEditor.user.username ||
          handlingEditor.user.defaultIdentity.name ||
          ''

        const selectedTemplate = 'reviewRejectEmailTemplate'
        const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/
        const emailValidationResult = emailValidationRegexp.test(receiverEmail)

        // Get channel ID
        const editorialChannel = manuscript.channels.find(
          channel => channel.topic === 'Editorial discussion',
        )

        if (!emailValidationResult || !receiverName) {
          return team
        }

        let instance

        if (config['notification-email'].use_colab) {
          instance = 'colab'
        } else {
          instance = 'generic'
        }

        const data = {
          articleTitle: manuscript.meta.title,
          authorName:
            manuscript.submitter.username ||
            manuscript.submitter.defaultIdentity.name ||
            '',
          receiverName,
          reviewerName,
          instance,
          shortId: manuscript.shortId,
        }

        try {
          await sendEmailNotification(receiverEmail, selectedTemplate, data)

          // Send Notification in Editorial Discussion Panel
          Message.createMessage({
            content: `Review Rejection Email sent by Kotahi to ${receiverName}`,
            channelId: editorialChannel.id,
            userId: manuscript.submitterId,
          })
        } catch (e) {
          /* eslint-disable-next-line */
          console.log('email was not sent', e)
        }
      }

      return team
    },
    async updateManuscript(_, { id, input }, ctx) {
      return commonUpdateManuscript(id, input, ctx)
    },

    async createNewVersion(_, { id }, ctx) {
      const manuscript = await models.Manuscript.query().findById(id)
      const newVersion = await manuscript.createNewVersion()
      return repackageForGraphql(newVersion)
    },
    async submitManuscript(_, { id, input }, ctx) {
      if (config['notification-email'].automated === 'true') {
        // Automated email submissionConfirmation on submission
        const manuscript = await models.Manuscript.query()
          .findById(id)
          .withGraphFetched('[submitter.[defaultIdentity], channels]')

        const receiverEmail = manuscript.submitter.email
        /* eslint-disable-next-line */
        const receiverName =
          manuscript.submitter.username ||
          manuscript.submitter.defaultIdentity.name ||
          ''

        const selectedTemplate = 'submissionConfirmationEmailTemplate'
        const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/
        const emailValidationResult = emailValidationRegexp.test(receiverEmail)

        if (!emailValidationResult || !receiverName) {
          return commonUpdateManuscript(id, input, ctx)
        }

        const data = {
          articleTitle: manuscript.meta.title,
          authorName:
            manuscript.submitter.username ||
            manuscript.submitter.defaultIdentity.name ||
            '',
          receiverName,
          shortId: manuscript.shortId,
        }

        try {
          await sendEmailNotification(receiverEmail, selectedTemplate, data)

          // Get channel ID
          const channelId = manuscript.channels.find(
            channel => channel.topic === 'Editorial discussion',
          ).id

          Message.createMessage({
            content: `Submission Confirmation Email sent by Kotahi to ${manuscript.submitter.username}`,
            channelId,
            userId: manuscript.submitterId,
          })
        } catch (e) {
          /* eslint-disable-next-line */
          console.log('email was not sent', e)
        }
      }

      return commonUpdateManuscript(id, input, ctx)
    },

    async makeDecision(_, { id, decision: decisionString }, ctx) {
      const manuscript = await models.Manuscript.query()
        .findById(id)
        .withGraphFetched(
          '[submitter.[defaultIdentity], channels, teams.members.user, reviews.user]',
        )

      let decision = null
      if (decisionString === 'accept') decision = 'accepted'
      else if (decisionString === 'revise') decision = 'revise'
      else if (decisionString === 'reject') decision = 'rejected'
      if (!decision)
        throw new Error(`Unknown decision type "${decisionString}" received.`)
      manuscript.decision = decision
      manuscript.status = decision

      if (
        manuscript.decision &&
        config['notification-email'].automated === 'true'
      ) {
        // Automated email evaluationComplete on decision
        const receiverEmail = manuscript.submitter.email

        const receiverName =
          manuscript.submitter.username ||
          manuscript.submitter.defaultIdentity.name ||
          ''

        const selectedTemplate = 'evaluationCompleteEmailTemplate'
        const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/
        const emailValidationResult = emailValidationRegexp.test(receiverEmail)

        if (emailValidationResult && receiverName) {
          const data = {
            articleTitle: manuscript.meta.title,
            authorName:
              manuscript.submitter.username ||
              manuscript.submitter.defaultIdentity.name ||
              '',
            receiverName,
            shortId: manuscript.shortId,
          }

          try {
            // Add Email Notification Record in Editorial Discussion Panel
            const author = manuscript.teams.find(team => {
              if (team.role === 'author') {
                return team
              }

              return null
            }).members[0].user

            const body = `Editor Decision sent by Kotahi to ${author.username}`

            const channelId = manuscript.channels.find(
              channel => channel.topic === 'Editorial discussion',
            ).id

            Message.createMessage({
              content: body,
              channelId,
              userId: manuscript.submitterId,
            })

            await sendEmailNotification(receiverEmail, selectedTemplate, data)
          } catch (e) {
            /* eslint-disable-next-line */
            console.log('email was not sent', e)
          }
        }
      }

      return updateAndRepackageForGraphql(manuscript)
    },
    async addReviewer(_, { manuscriptId, userId, invitationId }, ctx) {
      const manuscript = await models.Manuscript.query().findById(manuscriptId)
      const status = invitationId ? 'accepted' : 'invited'

      let invitationData

      if (invitationId) {
        invitationData = await models.Invitation.query().findById(invitationId)
      }

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
          await new TeamMember({
            teamId: existingTeam.id,
            status,
            userId,
            isShared: invitationData ? invitationData.isShared : null,
          }).save()
        }

        return existingTeam.$query().withGraphFetched('members.[user]')
      }

      // Create a new team of reviewers if it doesn't exist

      const newTeam = await new Team({
        objectId: manuscriptId,
        objectType: 'manuscript',
        members: [{ status, userId }],
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

      await TeamMember.query()
        .where({
          userId,
          teamId: reviewerTeam.id,
        })
        .delete()

      return reviewerTeam.$query().withGraphFetched('members.[user]')
    },
    /** To identify which data we're making publishable/unpublishable, we need:
     * manuscriptId; the ID of the owning review/decision or manuscript object; and the fieldName.
     * For threaded discussion comments, the fieldName should have the commentId concatenated onto it, like this:
     * 'discussion:97b49766-8513-427e-9f4e-9c463fa9878c'
     */
    async setShouldPublishField(
      _,
      { manuscriptId, objectId, fieldName, shouldPublish },
    ) {
      const manuscript = await models.Manuscript.query()
        .findById(manuscriptId)
        .withGraphFetched('[teams, channels, files, reviews.user]')

      if (shouldPublish) {
        // Add
        let formFields = manuscript.formFieldsToPublish.find(
          ff => ff.objectId === objectId,
        )

        if (!formFields) {
          formFields = { objectId, fieldsToPublish: [] }
          manuscript.formFieldsToPublish.push(formFields)
        }

        if (!formFields.fieldsToPublish.includes(fieldName))
          formFields.fieldsToPublish.push(fieldName)
      } else {
        // Remove
        manuscript.formFieldsToPublish = manuscript.formFieldsToPublish
          .map(ff => {
            if (ff.objectId !== objectId) return ff

            return {
              objectId,
              fieldsToPublish: ff.fieldsToPublish.filter(f => f !== fieldName),
            }
          })
          .filter(ff => ff.fieldsToPublish.length)
      }

      const updated = await models.Manuscript.query().updateAndFetchById(
        manuscriptId,
        manuscript,
      )

      return repackageForGraphql(updated)
    },
    async publishManuscript(_, { id }, ctx) {
      const manuscript = await models.Manuscript.query()
        .findById(id)
        .withGraphFetched('[reviews, publishedArtifacts]')

      const update = {} // This will collect any properties we may want to update in the DB
      update.published = new Date()
      const steps = []
      const containsEvaluations = hasEvaluations(manuscript)

      if (config.crossref.login) {
        const stepLabel = 'Crossref'
        let succeeded = false
        let errorMessage

        if (containsEvaluations || manuscript.status !== 'evaluated') {
          try {
            await publishToCrossref(manuscript)
            succeeded = true
          } catch (e) {
            console.error('error publishing to crossref')
            console.error(e)
            errorMessage = e.message
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
            update.submission = {
              ...manuscript.submission,
              editDate: new Date().toISOString().split('T')[0],
            }
          } else return null
        } catch (e) {
          console.error('error while publishing in google spreadsheet')
          console.error(e)
          succeeded = false
          errorMessage = e.message
          return null
        }

        steps.push({ succeeded, errorMessage, stepLabel })
      } else if (['colab'].includes(process.env.INSTANCE_NAME)) {
        // TODO: A note in the code said that for Colab instance, submission.editDate should be updated. Is this true? (See commonUpdateManuscript() for example code.)
      }

      if (config.hypothesis.apiKey) {
        const stepLabel = 'Hypothesis'
        let succeeded = false
        let errorMessage

        try {
          await publishToHypothesis(manuscript)
          succeeded = true
        } catch (err) {
          console.error(err)
          let message = 'Publishing to hypothes.is failed!\n'
          if (err.response) {
            message += `${err.response.status} ${err.response.statusText}\n`
            message += `${JSON.stringify(err.response.data)}`
          } else message += err.message
          errorMessage = message
        }

        steps.push({ stepLabel, succeeded, errorMessage })
      }

      if (config['publishing-webhook'].publishingWebhookUrl) {
        try {
          await tryPublishingWebhook(manuscript.id)
          steps.push({ stepLabel: 'Publishing webhook', succeeded: true })
        } catch (err) {
          steps.push({
            stepLabel: 'Publishing webhook',
            succeeded: false,
            errorMessage: err.message,
          })
        }
      }

      try {
        if (await tryPublishDocMaps(manuscript))
          steps.push({ stepLabel: 'DOCMAPS', succeeded: true })
      } catch (err) {
        console.error(err)
        steps.push({
          stepLabel: 'DOCMAPS',
          succeeded: false,
          errorMessage: err.message,
        })
      }

      if (!steps.length || steps.some(step => step.succeeded)) {
        // A 'published' article without evaluations will become 'evaluated'.
        // The intention is that an evaluated article should never revert to any state prior to "evaluated",
        // but that only articles with evaluations can be 'published'.
        update.status =
          !config.crossref.login || containsEvaluations
            ? 'published'
            : 'evaluated'
      }

      const updatedManuscript = await models.Manuscript.query().updateAndFetchById(
        id,
        update,
      )

      return { manuscript: await repackageForGraphql(updatedManuscript), steps }
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
          '[teams, channels, files, reviews.user, tasks(orderBySequence).assignee]',
        )

      const user = ctx.user
        ? await models.User.query().findById(ctx.user)
        : null

      if (!manuscript) return null

      if (!manuscript.meta) {
        manuscript.meta = {}
      }

      // manuscript.files = await getFilesWithUrl(manuscript.files)
      // const forms = await models.Form.query()
      // await regenerateFileUrisInReviews(manuscript, forms)

      if (typeof manuscript.meta.source === 'string') {
        manuscript.meta.source = await replaceImageSrc(
          manuscript.meta.source,
          manuscript.files,
          'medium',
        )
      }

      manuscript.decision = ''

      manuscript.manuscriptVersions = await manuscript.getManuscriptVersions()

      if (
        user &&
        !user.admin &&
        manuscript.reviews &&
        manuscript.reviews.length &&
        !(await isEditorOfManuscript(ctx.user, manuscript))
      ) {
        const reviewForm = await getReviewForm()
        const decisionForm = await getDecisionForm()
        manuscript.reviews = stripConfidentialDataFromReviews(
          manuscript.reviews,
          reviewForm,
          decisionForm,
          ctx.user,
        )
      }

      return repackageForGraphql(manuscript)
    },
    async manuscriptsUserHasCurrentRoleIn(_, input, ctx) {
      // Get IDs of the top-level manuscripts
      const topLevelManuscripts = await models.Manuscript.query()
        .distinct(
          raw(
            'coalesce(manuscripts.parent_id, manuscripts.id) AS top_level_id',
          ),
        )
        .join('teams', 'manuscripts.id', '=', 'teams.object_id')
        .join('team_members', 'teams.id', '=', 'team_members.team_id')
        .where('team_members.user_id', ctx.user)
        .where('is_hidden', false)

      // Get those top-level manuscripts with all versions, all with teams and members
      const manuscripts = await models.Manuscript.query()
        .withGraphFetched(
          '[teams.[members], tasks, manuscriptVersions(orderByCreated).[teams.[members], tasks]]',
        )
        .whereIn(
          'id',
          topLevelManuscripts.map(m => m.topLevelId),
        )
        .orderBy('created', 'desc')

      const filteredManuscripts = []

      manuscripts.forEach(m => {
        // picking the first version if present, as the list is sorted by created desc
        const latestVersion =
          m.manuscriptVersions && m.manuscriptVersions.length > 0
            ? m.manuscriptVersions[0]
            : m

        if (
          latestVersion.teams.some(t =>
            t.members.some(member => member.userId === ctx.user),
          )
        ) {
          // eslint-disable-next-line no-param-reassign
          latestVersion.hasOverdueTasksForUser = manuscriptHasOverdueTasksForUser(
            latestVersion,
            ctx.user,
          )

          filteredManuscripts.push(m)
        }
      })

      return Promise.all(filteredManuscripts.map(m => repackageForGraphql(m)))
    },
    async manuscripts(_, { where }, ctx) {
      const manuscripts = models.Manuscript.query()
        .withGraphFetched(
          '[teams, reviews, manuscriptVersions(orderByCreated)]',
        )
        .where({ parentId: null, isHidden: null })
        .orderBy('created', 'desc')

      return Promise.all(manuscripts.map(async m => repackageForGraphql(m)))
    },
    async publishedManuscripts(_, { sort, offset, limit }, ctx) {
      const query = models.Manuscript.query()
        .whereNotNull('published')
        .withGraphFetched('[reviews, files, submitter]')

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

      let manuscripts = await query
      const reviewForm = await getReviewForm()
      const decisionForm = await getDecisionForm()

      manuscripts = manuscripts.map(async m => {
        const manuscript = m

        if (typeof manuscript.meta.source === 'string') {
          manuscript.meta.source = await replaceImageSrc(
            manuscript.meta.source,
            manuscript.files,
            'medium',
          )
        }

        manuscript.reviews = await stripConfidentialDataFromReviews(
          manuscript.reviews,
          reviewForm,
          decisionForm,
        )

        return repackageForGraphql(manuscript)
      })

      return {
        totalCount,
        manuscripts,
      }
    },
    async paginatedManuscripts(
      _,
      { sort, offset, limit, filters, timezoneOffsetMinutes },
      ctx,
    ) {
      const submissionForm = await Form.findOneByField('purpose', 'submit')

      const [rawQuery, rawParams] = buildQueryForManuscriptSearchFilterAndOrder(
        sort,
        offset,
        limit,
        filters,
        submissionForm,
        timezoneOffsetMinutes || 0,
      )

      const knex = models.Manuscript.knex()
      const rawQResult = await knex.raw(rawQuery, rawParams)
      let totalCount = 0
      if (rawQResult.rowCount)
        totalCount = parseInt(rawQResult.rows[0].full_count, 10)

      const ids = rawQResult.rows.map(row => row.id)

      const manuscripts = await models.Manuscript.query()
        .findByIds(ids)
        .withGraphFetched(
          '[submitter, teams.members.user.defaultIdentity, manuscriptVersions(orderByCreated).[submitter, teams.members.user.defaultIdentity]]',
        )

      const result = rawQResult.rows.map(row => ({
        ...manuscripts.find(m => m.id === row.id),
        searchRank: row.rank,
        searchSnippet: row.snippet,
      }))

      return { totalCount, manuscripts: result }
    },
    async manuscriptsPublishedSinceDate(_, { startDate, limit }, ctx) {
      const query = models.Manuscript.query()
        .whereNotNull('published')
        .orderBy('published')
        .withGraphFetched('[files]')

      if (startDate) query.where('published', '>=', new Date(startDate))
      if (limit) query.limit(limit)

      const manuscripts = await query

      return manuscripts.map(async m => {
        const manuscript = m
        manuscript.files = await getFilesWithUrl(manuscript.files)

        if (typeof manuscript.meta.source === 'string') {
          manuscript.meta.source = await replaceImageSrcResponsive(
            manuscript.meta.source,
            manuscript.files,
          )
        }

        const printReadyPdf = manuscript.files.find(file =>
          file.tags.includes('printReadyPdf'),
        )

        return {
          id: manuscript.id,
          shortId: manuscript.shortId,
          files: manuscript.files,
          status: manuscript.status,
          meta: manuscript.meta,
          submission: JSON.stringify(manuscript.submission),
          publishedDate: manuscript.published,
          printReadyPdfUrl: printReadyPdf
            ? printReadyPdf.storedObjects[0].url
            : null,
          styledHtml: applyTemplate(m, true),
          css: getCss(),
          publicationMetadata,
          articleMetadata: articleMetadata(m),
        }
      })
    },
    async publishedManuscript(_, { id }, ctx) {
      const m = await models.Manuscript.query()
        .findById(id)
        .whereNotNull('published')
        .withGraphFetched('[files]')

      if (!m) return null

      m.files = await getFilesWithUrl(m.files)

      if (typeof m.meta.source === 'string') {
        m.meta.source = await replaceImageSrc(m.meta.source, m.files, 'medium')
      }

      return {
        id: m.id,
        shortId: m.shortId,
        files: m.files,
        status: m.status,
        meta: m.meta,
        submission: JSON.stringify(m.submission),
        publishedDate: m.published,
        styledHtml: applyTemplate(m, true),
        css: getCss(),
        publicationMetadata,
        articleMetadata: articleMetadata(m),
      }
    },
    async unreviewedPreprints(_, { token }, ctx) {
      validateApiToken(token, config.api.tokens)

      const manuscripts = await models.Manuscript.query()
        .where({ status: 'new' })
        .whereRaw(`submission->>'labels' = 'readyToEvaluate'`)

      return manuscripts.map(m => ({
        id: m.id,
        shortId: m.shortId,
        title: m.meta.title || m.submission.title || m.submission.description,
        abstract: m.meta.abstract || m.submission.abstract,
        authors: m.submission.authors || m.authors || [],
        doi: m.submission.doi.startsWith('https://doi.org/') // TODO We should strip this at time of import
          ? m.submission.doi.substr(16)
          : m.submission.doi,
        uri:
          m.submission.link ||
          m.submission.biorxivURL ||
          m.submission.url ||
          m.submission.uri,
      }))
    },
    async doisToRegister(_, { id }, ctx) {
      if (!config.crossref.login) {
        return null
      }

      const manuscript = await models.Manuscript.query()
        .findById(id)
        .withGraphFetched('reviews')

      const DOIs = []

      if (config.crossref.publicationType === 'article') {
        const manuscriptDOI = getDoi(
          getReviewOrSubmissionField(manuscript, 'doiSuffix') || manuscript.id,
        )

        if (manuscriptDOI) {
          DOIs.push(manuscriptDOI)
        }
      } else {
        const notEmptyReviews = Object.entries(manuscript.submission)
          .filter(
            ([key, value]) =>
              key.length === 7 &&
              key.includes('review') &&
              !checkIsAbstractValueEmpty(value),
          )
          .map(([key]) => key.replace('review', ''))

        DOIs.push(
          ...notEmptyReviews.map(reviewNumber =>
            getDoi(
              getReviewOrSubmissionField(
                manuscript,
                `review${reviewNumber}suffix`,
              ) || `${manuscript.id}/${reviewNumber}`,
            ),
          ),
        )

        if (
          Object.entries(manuscript.submission).some(
            ([key, value]) =>
              key === 'summary' && !checkIsAbstractValueEmpty(value),
          )
        ) {
          const summaryDOI = getDoi(
            getReviewOrSubmissionField(manuscript, 'summarysuffix') ||
              `${manuscript.id}/`,
          )

          if (summaryDOI) {
            DOIs.push(summaryDOI)
          }
        }
      }

      return DOIs
    },
    /** Return true if the DOI exists (is found in Crossref) */
    async validateDOI(_, { articleURL }, ctx) {
      const doi = encodeURI(articleURL.split('.org/')[1])
      return { isDOIValid: await doiExists(doi) }
    },
    /** Return true if a DOI formed from this suffix has not already been assigned (i.e. not found in Crossref) */
    // To be called in submit manuscript as
    // first validation step for custom suffix
    async validateSuffix(_, { suffix }, ctx) {
      const doi = getDoi(suffix)
      return { isDOIValid: await doiIsAvailable(doi) }
    },
  },
  // We want submission info to come out as a stringified JSON, so that we don't have to
  // change our queries if the submission form changes. We still want to store it as JSONB
  // so that we can easily search through the information within.
  Manuscript: ManuscriptResolvers({ isVersion: false }),
  PublishedManuscript: {
    async publishedArtifacts(parent, _, ctx) {
      return getRelatedPublishedArtifacts(parent)
    },
  },
}

const typeDefs = `
  extend type Query {
    globalTeams: [Team]
    manuscript(id: ID!): Manuscript!
    manuscripts: [Manuscript]!
    paginatedManuscripts(offset: Int, limit: Int, sort: ManuscriptsSort, filters: [ManuscriptsFilter!]!, timezoneOffsetMinutes: Int): PaginatedManuscripts
    publishedManuscripts(sort:String, offset: Int, limit: Int): PaginatedManuscripts
    validateDOI(articleURL: String): validateDOIResponse
    validateSuffix(suffix: String): validateDOIResponse
    manuscriptsUserHasCurrentRoleIn: [Manuscript]

    """ Get published manuscripts with irrelevant fields stripped out. Optionally, you can specify a startDate and/or limit. """
    manuscriptsPublishedSinceDate(startDate: DateTime, limit: Int): [PublishedManuscript]!
    """ Get a published manuscript by ID, or null if this manuscript is not published or not found """
    publishedManuscript(id: ID!): PublishedManuscript
    unreviewedPreprints(token: String!): [Preprint]
    doisToRegister(id: ID!): [String]
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
    addReviewer(manuscriptId: ID!, userId: ID!, invitationId: ID): Team
    removeReviewer(manuscriptId: ID!, userId: ID!): Team
    publishManuscript(id: ID!): PublishingResult!
    createNewVersion(id: ID!): Manuscript
    importManuscripts: Boolean!
    setShouldPublishField(manuscriptId: ID!, objectId: ID!, fieldName: String!, shouldPublish: Boolean!): Manuscript!
    archiveManuscript(id: ID!): ID!
    archiveManuscripts(ids: [ID]!): [ID!]!
  }

  type Manuscript {
    id: ID!
    parentId: ID
    created: DateTime!
    updated: DateTime
    manuscriptVersions: [Manuscript]
    shortId: Int!
    files: [File]
    teams: [Team]
    reviews: [Review]
    status: String
    decision: String
    authors: [Author]
    meta: ManuscriptMeta
    submission: String
    channels: [Channel]
    submitter: User
    submittedDate: DateTime
    published: DateTime
    publishedArtifacts: [PublishedArtifact!]!
    currentRoles: [String]
    formFieldsToPublish: [FormFieldsToPublish!]!
    searchRank: Float
    searchSnippet: String
    importSourceServer: String
    tasks: [Task!]
    hasOverdueTasksForUser: Boolean
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
    name: String!
    storedObjects: [StoredObjectInput!]!
    tags: [String]!
  }

  input ImageMetadataInput {
    width: Int!
    height: Int!
    space: String
    density: Int
  }

  input StoredObjectInput {
    type: ImageSizeInput!
    key: String!
    size: Int
    mimetype: String!
    extension: String!
    imageMetadata: ImageMetadataInput
  }

  enum ImageSizeInput {
    original
    medium
    small
  }

  type Author {
    firstName: String
    lastName: String
    email: String
    affiliation: String
  }

  type ManuscriptMeta {
    title: String!
    source: String
    abstract: String
    subjects: [String]
    history: [MetaDate]
    manuscriptId: ID
  }

  type Preprint {
    id: ID!
    shortId: Int!
    title: String!
    abstract: String
    authors: [Author!]!
    doi: String!
    uri: String!
  }

  type ArticleId {
    pubIdType: String
    id: String
  }

  type MetaDate {
    type: String
    date: DateTime
  }

  type Note {
    id: ID!
    created: DateTime!
    updated: DateTime
    notesType: String
    content: String
  }

  type FormFieldsToPublish {
    objectId: ID!
    fieldsToPublish: [String!]!
  }

  """ A simplified Manuscript object containing only relevant fields for publishing """
  type PublishedManuscript {
    id: ID!
    shortId: Int!
    files: [File]
    status: String
    meta: ManuscriptMeta
    submission: String
    publishedArtifacts: [PublishedArtifact!]!
    publishedDate: DateTime
		printReadyPdfUrl: String
		styledHtml: String
		css: String
  }
`

module.exports = {
  typeDefs,
  resolvers,
}
