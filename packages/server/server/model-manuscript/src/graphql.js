/* eslint-disable prefer-destructuring */
const { ref } = require('objection')
const axios = require('axios')
const { map, chunk, orderBy } = require('lodash')
const { pubsubManager, File } = require('@coko/server')
const models = require('@pubsweet/models')
const cheerio = require('cheerio')
const { raw } = require('objection')

const {
  importManuscripts,
  importManuscriptsFromSemanticScholar,
} = require('./importManuscripts')

const { manuscriptHasOverdueTasksForUser } = require('./manuscriptCommsUtils')
const { rebuildCMSSite } = require('../../flax-site/flax-api')

const {
  sendAnnouncementNotification,
} = require('../../coar-notify/coar-notify')

const {
  getPublishableReviewFields,
  getPublishableSubmissionFields,
} = require('../../publishing/flax/tools')

const {
  publishToCrossref,
  getReviewOrSubmissionField,
  getDoi,
  doiIsAvailable,
  doiExists,
} = require('../../publishing/crossref')

const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')

const {
  hasElifeStyleEvaluations,
  stripConfidentialDataFromReviews,
  buildQueryForManuscriptSearchFilterAndOrder,
  applyTemplatesToArtifacts,
} = require('./manuscriptUtils')

const { applyTemplate, generateCss } = require('../../pdfexport/applyTemplate')

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

const publishToGoogleSpreadSheet = require('../../publishing/google-spreadsheet')
const validateApiToken = require('../../utils/validateApiToken')
const { deepMergeObjectsReplacingArrays } = require('../../utils/objectUtils')
const { tryPublishDocMaps } = require('../../publishing/docmaps')
const { getActiveForms } = require('../../model-form/src/formCommsUtils')

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
  getSubmissionForm,
} = require('../../model-review/src/reviewCommsUtils')

const {
  getThreadedDiscussionsForManuscript,
} = require('../../model-threaded-discussion/src/threadedDiscussionCommsUtils')

const {
  getUsersById,
  getUserRolesInManuscript,
  getSharedReviewersIds,
  sendEmailWithPreparedData,
} = require('../../model-user/src/userCommsUtils')

const {
  addUserToManuscriptChatChannel,
  removeUserFromManuscriptChatChannel,
} = require('../../model-channel/src/channelCommsUtils')

const { cachedGet } = require('../../querycache')

const { getPubsub } = pubsubManager

const getCss = async () => {
  const css = await generateCss()
  return css
}

// Helper function to extract review and decision data
const extractReviewData = (reviews, isDecision) =>
  reviews
    .filter(review => review.isDecision === isDecision)
    .map(review => ({
      created: review.created,
      updated: review.updated,
      isDecision: review.isDecision,
      isHiddenReviewerName: review.isHiddenReviewerName,
      isHiddenFromAuthor: review.isHiddenFromAuthor,
      canBePublishedPublicly: review.canBePublishedPublicly,
      username: review.user ? review.user.username : null,
      jsonData: JSON.stringify(review.jsonData),
    }))

// Helper function to extract common manuscript or version data
const extractCommonData = item => ({
  created: item.created,
  updated: item.updated,
  status: item.status,
  decision: item.decision,
  submission: JSON.stringify(item.submission),
  importSourceServer: item.importSourceServer,
  shortId: item.shortId,
  teams: item.teams.map(team => ({ ...team })),
})

/** Get reviews from the manuscript if present, or from DB. Generate full file info for
 * all files attached to reviews, and stringify JSON data in preparation for serving to client.
 * Note: 'reviews' include the decision object.
 */
const getRelatedReviews = async (manuscript, ctx) => {
  const reviewForm = await getReviewForm(manuscript.groupId)
  const decisionForm = await getDecisionForm(manuscript.groupId)

  let reviews =
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

  const userRoles = await getUserRolesInManuscript(ctx.user, manuscript.id)

  const sharedReviewersIds = await getSharedReviewersIds(
    manuscript.id,
    ctx.user,
  )

  // Insert isShared flag before userIds are stripped
  // TODO Should this step and the removal of confidential data be moved to the review resolver?
  reviews = reviews.map(r => ({
    ...r,
    isSharedWithCurrentUser: sharedReviewersIds.includes(r.userId),
  }))

  const manuscriptHasDecision = [
    'accepted',
    'revise',
    'rejected',
    'evaluated',
    'published',
  ].includes(manuscript.status)

  reviews = stripConfidentialDataFromReviews(
    reviews,
    reviewForm,
    decisionForm,
    sharedReviewersIds,
    ctx.user,
    userRoles,
    manuscriptHasDecision,
  )

  return reviews.map(review => ({
    ...review,
    jsonData: JSON.stringify(review.jsonData),
  }))
}

/** Get published artifacts from the manuscript if present, or from DB.
 * Expand the templated contents of artifacts in preparation for serving to client.
 */
const getRelatedPublishedArtifacts = async (manuscript, ctx) => {
  const templatedArtifacts =
    manuscript.publishedArtifacts ||
    (await (
      await models.Manuscript.query().findById(manuscript.id)
    ).$relatedQuery('publishedArtifacts'))

  const reviews =
    manuscript.reviews || (await getRelatedReviews(manuscript, ctx))

  const threadedDiscussions =
    manuscript.threadedDiscussions ||
    (await getThreadedDiscussionsForManuscript(manuscript, getUsersById))

  const submission =
    typeof manuscript.submission === 'string'
      ? JSON.parse(manuscript.submission)
      : manuscript.submission

  if (!templatedArtifacts.length) return []

  const { submissionForm, reviewForm, decisionForm } = await getActiveForms(
    manuscript.groupId,
  )

  return applyTemplatesToArtifacts(
    templatedArtifacts,
    { ...manuscript, reviews, submission, threadedDiscussions },
    submissionForm,
    reviewForm,
    decisionForm,
  )
}

const manuscriptAndPublishedManuscriptSharedResolvers = {
  /** We want submission info to come out as a stringified JSON, so that we don't have to
   * change our queries if the submission form changes. We still want to store it as JSONB
   * so that we can easily search through the information within. */
  submission(parent) {
    return JSON.stringify(parent.submission)
  },
  async files(parent, _, ctx) {
    const files = (
      parent.files ||
      (await models.Manuscript.relatedQuery('files').for(parent.id))
    ).map(f => ({
      ...f,
      tags: f.tags || [],
      storedObjects: f.storedObjects || [],
    }))

    return getFilesWithUrl(files)
  },
  async publishedArtifacts(parent, _, ctx) {
    return getRelatedPublishedArtifacts(parent, ctx)
  },
  async meta(parent) {
    return {
      ...(parent.meta || {}),
      manuscriptId: parent.id,
      manuscriptFiles: parent.files, // For use by sub-resolvers only. Not part of return value.
    }
  },
}

/** Modifies the supplied manuscript by replacing all inlined base64 images
 *  with actual images stored to file storage */
const uploadAndConvertBase64ImagesInManuscript = async manuscript => {
  const { source } = manuscript.meta

  if (typeof source === 'string') {
    const images = base64Images(source)

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
  if (msDelta.submission?.$doi?.startsWith('https://doi.org/'))
    msDelta.submission.$doi =
      msDelta.submission.$doi.split('https://doi.org/')[1]

  const ms = await models.Manuscript.query()
    .findById(id)
    .withGraphFetched('[reviews.user, files, tasks]')

  const activeConfig = await models.Config.getCached(ms.groupId)

  // If this manuscript is getting its label set for the first time,
  // we will populate its task list from the template tasks
  const isSettingFirstLabels = ['prc'].includes(
    activeConfig.formData.instanceName,
  )
    ? !ms.submission.$customStatus && !!msDelta.submission?.$customStatus
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

  // TODO manuscript.doi was added only to allow efficient queries in postgres.
  // We should scrap it, as it prevents single source of truth, and we can directly index the JSON field:
  // CREATE INDEX idx_manuscripts_submission_doi_gin ON manuscripts USING GIN ((submission->>'$doi'));
  // or even
  // CREATE INDEX idx_manuscripts_submission_gin ON manuscripts USING GIN (submission);
  // The latter will help with queries against other submission fields.
  if (msDelta.submission?.$doi) updatedMs.doi = msDelta.submission.$doi

  updatedMs.submission.$editDate = new Date().toISOString().split('T')[0]

  if (isSettingFirstLabels && !updatedMs.tasks.length)
    await populateTemplatedTasksForManuscript(id)

  await uploadAndConvertBase64ImagesInManuscript(updatedMs)
  return models.Manuscript.query().updateAndFetchById(id, updatedMs)
}

/** Send the manuscriptId OR a configured ref; and send token if one is configured */
const tryPublishingWebhook = async manuscriptId => {
  const manuscript = await models.Manuscript.query().findById(manuscriptId)
  const activeConfig = await models.Config.getCached(manuscript.groupId)

  const publishingWebhookUrl = activeConfig.formData.publishing.webhook.url

  if (publishingWebhookUrl) {
    const token = activeConfig.formData.publishing.webhook.token
    const reference = activeConfig.formData.publishing.webhook.ref
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

const getSupplementaryFiles = async parentId => {
  return models.Manuscript.relatedQuery('files')
    .for(models.Manuscript.query().where({ id: parentId }))
    .where('tags', '@>', JSON.stringify(['supplementary']))
}

const publishOnCMS = async (groupId, manuscriptId) => {
  await rebuildCMSSite(groupId, { manuscriptId })
  return true // rebuildCMSSite will throw an exception on any failure, so no need to check its response
}

const sendNotificationToCoar = async (notification, manuscript) => {
  const response = await sendAnnouncementNotification(notification, manuscript)
  return response
}

const getPublishableSubmissionFiles = async manuscript => {
  const submissionForm = await getSubmissionForm(manuscript.groupId)

  const { fieldsToPublish } =
    manuscript.formFieldsToPublish.find(ff => ff.objectId === manuscript.id) ||
    []

  const supplementaryFileField = submissionForm.structure.children.find(
    f =>
      (f.permitPublishing === 'always' ||
        (f.permitPublishing === 'true' &&
          fieldsToPublish &&
          fieldsToPublish.includes(f.name))) &&
      f.component === 'SupplementaryFiles',
  )

  if (!supplementaryFileField) return null

  const fieldTitle = supplementaryFileField ? supplementaryFileField.title : ''
  const supplementaryFiles = await getSupplementaryFiles(manuscript.id)
  const files = await getFilesWithUrl(supplementaryFiles)

  return {
    fieldTitle,
    files,
  }
}

const resolvers = {
  Mutation: {
    async createManuscript(_, vars, ctx) {
      const { meta, files, groupId } = vars.input
      const group = await models.Group.query().findById(groupId)
      const submissionForm = await getSubmissionForm(group.id)

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
            groupId: group.id,
          },
          {
            topic: 'Editorial discussion',
            type: 'editorial',
            groupId: group.id,
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
        groupId: group.id,
        authorFeedback: {},
      }

      emptyManuscript.submission.$editDate = new Date()
        .toISOString()
        .split('T')[0]

      const manuscript = await models.Manuscript.query().upsertGraphAndFetch(
        emptyManuscript,
        { relate: true },
      )

      await uploadAndConvertBase64ImagesInManuscript(manuscript)

      const updatedManuscript =
        await models.Manuscript.query().updateAndFetchById(
          manuscript.id,
          manuscript,
        )

      // newly uploaded files get tasks populated
      await populateTemplatedTasksForManuscript(manuscript.id)

      // add user to author discussion channel
      await addUserToManuscriptChatChannel({
        manuscriptId: updatedManuscript.id,
        userId: ctx.user,
      })
      return updatedManuscript
    },

    async importManuscripts(_, { groupId }, ctx) {
      const importsSucceeded = await importManuscripts(groupId, ctx)

      const semanticScholarSucceeded =
        await importManuscriptsFromSemanticScholar(groupId, ctx)

      return importsSucceeded && semanticScholarSucceeded
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

    async unarchiveManuscripts(_, { ids }, ctx) {
      // finding the ids of the first versions of all manuscripts:
      const selectedManuscripts = await models.Manuscript.query()
        .select('parentId', 'id')
        .whereIn('id', ids)

      const firstVersionIds = selectedManuscripts.map(m => m.parentId || m.id)

      // unarchiving manuscripts with either firstVersionID or parentID
      const unarchivedManuscripts = await models.Manuscript.query()
        .returning('id')
        .update({ isHidden: false })
        .whereIn('id', firstVersionIds)
        .orWhereIn('parentId', firstVersionIds)

      return unarchivedManuscripts.map(m => m.id)
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
    async assignAuthoForProofingManuscript(_, { id }, ctx) {
      const manuscript = await models.Manuscript.query()
        .findById(id)
        .withGraphFetched('[channels]')

      const sender = await models.User.query().findById(ctx.user)
      const author = await manuscript.getManuscriptAuthor()
      const authorName = author?.username || ''

      let assignedAuthors = []

      if (
        manuscript.authorFeedback.assignedAuthors &&
        manuscript.authorFeedback.assignedAuthors.length > 0
      ) {
        assignedAuthors = [...manuscript.authorFeedback.assignedAuthors]
      }

      assignedAuthors.push({
        authorId: author.id,
        authorName,
        assignedOnDate: new Date(),
      })

      const updated = await models.Manuscript.query().patchAndFetchById(
        manuscript.id,
        {
          status: 'assigned',
          authorFeedback: {
            ...manuscript.authorFeedback,
            assignedAuthors: orderBy(
              assignedAuthors,
              [obj => new Date(obj.assignedOnDate)],
              ['desc'],
            ),
          },
        },
      )

      const activeConfig = await models.Config.getCached(manuscript.groupId)

      const receiverEmail = author.email
      /* eslint-disable-next-line */
      const receiverName = authorName

      const selectedTemplate =
        activeConfig.formData.eventNotification
          ?.authorProofingInvitationEmailTemplate

      const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/
      const emailValidationResult = emailValidationRegexp.test(receiverEmail)

      if (!emailValidationResult || !receiverName) {
        return updated
      }

      if (selectedTemplate) {
        const notificationInput = {
          manuscript,
          selectedEmail: receiverEmail,
          selectedTemplate,
          currentUser: sender?.username || '',
          groupId: manuscript.groupId,
        }

        try {
          await sendEmailWithPreparedData(notificationInput, ctx, sender)

          let channelId

          if (manuscript.parentId) {
            const channel = await models.Manuscript.relatedQuery('channels')
              .for(manuscript.parentId)
              .findOne({ topic: 'Editorial discussion' })

            channelId = channel.id
          } else {
            // Get channel ID
            channelId = manuscript.channels.find(
              channel => channel.topic === 'Editorial discussion',
            ).id
          }

          models.Message.createMessage({
            content: `Author proof assigned Email sent by Kotahi to ${author.username}`,
            channelId,
            userId: ctx.user,
          })
        } catch (e) {
          /* eslint-disable-next-line */
          console.log('email was not sent', e)
        }
      } else {
        // eslint-disable-next-line no-console
        console.info(
          'No email template configured for notifying of author proof assigned. Email not sent.',
        )
      }

      return updated
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

      const activeConfig = await models.Config.getCached(manuscript.groupId)

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
          if (activeConfig.formData.publishing.hypothesis.apiKey) {
            const hypothesisArtifacts = models.PublishedArtifact.query().where({
              manuscriptId: toDeleteItem,
              platform: 'Hypothesis',
            })

            const headers = {
              headers: {
                Authorization: `Bearer ${activeConfig.formData.publishing.hypothesis.apiKey}`,
              },
            }

            await Promise.all(
              hypothesisArtifacts.map(async artifact =>
                deletePublication(artifact.externalId, headers),
              ),
            )
          }

          models.Manuscript.query().deleteById(toDeleteItem)
        }),
      )

      return id
    },
    // TODO Rename to something like 'setReviewerResponse'
    async reviewerResponse(_, { action, teamId }, ctx) {
      const {
        Review: ReviewModel,
        // eslint-disable-next-line global-require
      } = require('@pubsweet/models') // Pubsweet models may initially be undefined, so we require only when resolver runs.

      if (action !== 'accepted' && action !== 'rejected')
        throw new Error(
          `Invalid action (reviewerResponse): Must be either "accepted" or "rejected"`,
        )

      const team = await models.Team.query()
        .findById(teamId)
        .withGraphFetched('members')

      if (!team) throw new Error('No team was found')

      for (let i = 0; i < team.members.length; i += 1) {
        if (
          team.members[i].userId === ctx.user &&
          team.members[i].status !== 'completed'
        )
          team.members[i].status = action
      }

      await new models.Team(team).saveGraph()

      if (action === 'accepted') {
        await addUserToManuscriptChatChannel({
          manuscriptId: team.objectId,
          userId: ctx.user,
          type: 'editorial',
        })
      }

      const existingReview = await ReviewModel.query().where({
        manuscriptId: team.objectId,
        userId: ctx.user,
        isDecision: false,
      })

      // modify it to check if there exists a review already
      if (action === 'accepted' && existingReview.length === 0) {
        const review = {
          isDecision: false,
          isHiddenReviewerName: true,
          isHiddenFromAuthor: true,
          userId: ctx.user,
          manuscriptId: team.objectId,
          jsonData: '{}',
        }

        await new ReviewModel(review).save()
      }

      if (action === 'rejected') {
        // Automated email reviewReject on rejection
        const reviewer = await models.User.query()
          .findById(ctx.user)
          .withGraphJoined('[defaultIdentity]')

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

        if (!handlingEditor) {
          // eslint-disable-next-line no-console
          console.info('No handling editor assigned. Email not sent.')
          return team
        }

        const receiverEmail = handlingEditor.user.email
        /* eslint-disable-next-line */
        const receiverName =
          handlingEditor.user.username ||
          handlingEditor.user.defaultIdentity.name ||
          ''

        const activeConfig = await models.Config.getCached(manuscript.groupId)

        const selectedTemplate =
          activeConfig.formData.eventNotification?.reviewRejectedEmailTemplate

        const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/
        const emailValidationResult = emailValidationRegexp.test(receiverEmail)

        // Get channel ID
        const editorialChannel = manuscript.channels.find(
          channel => channel.topic === 'Editorial discussion',
        )

        if (!emailValidationResult || !receiverName) {
          return team
        }

        if (selectedTemplate) {
          const notificationInput = {
            manuscript,
            selectedEmail: receiverEmail,
            selectedTemplate,
            currentUser: reviewerName,
            groupId: manuscript.groupId,
          }

          try {
            await sendEmailWithPreparedData(notificationInput, ctx, reviewer)

            // Send Notification in Editorial Discussion Panel
            models.Message.createMessage({
              content: `Review Rejection Email sent by Kotahi to ${receiverName}`,
              channelId: editorialChannel.id,
              userId: manuscript.submitterId,
            })
          } catch (e) {
            /* eslint-disable-next-line */
            console.log('email was not sent', e)
          }
        } else {
          // eslint-disable-next-line no-console
          console.info(
            'No email template configured for notifying of invited reviewer declining invitation. Email not sent.',
          )
        }
      }

      return team
    },
    async updateManuscript(_, { id, input }, ctx) {
      return commonUpdateManuscript(id, input, ctx)
    },
    async submitAuthorProofingFeedback(_, { id, input }, ctx) {
      let updated = await commonUpdateManuscript(id, input, ctx)

      if (updated.status === 'completed') {
        const manuscript = await models.Manuscript.query()
          .findById(id)
          .withGraphJoined('[teams.members.user.defaultIdentity, channels]')

        // after submission of feedback adding it to 'previousSubmissions' list
        let previousSubmissions = []

        if (manuscript.authorFeedback.previousSubmissions?.length > 0) {
          previousSubmissions = [
            ...manuscript.authorFeedback.previousSubmissions,
          ]
        }

        const submitter = manuscript.authorFeedback.submitterId
          ? await models.User.query().findById(
              manuscript.authorFeedback.submitterId,
            )
          : null

        if (manuscript.authorFeedback.submitted) {
          previousSubmissions.push({
            text: manuscript.authorFeedback.text,
            fileIds: manuscript.authorFeedback.fileIds,
            submitterId: manuscript.authorFeedback.submitterId,
            submitter: {
              id: submitter.id,
              username: submitter.username,
            },
            edited: manuscript.authorFeedback.edited,
            submitted: manuscript.authorFeedback.submitted,
          })

          delete manuscript.authorFeedback.text
          delete manuscript.authorFeedback.fileIds
          delete manuscript.authorFeedback.submitterId
          delete manuscript.authorFeedback.edited
          delete manuscript.authorFeedback.submitted
        }

        updated = await models.Manuscript.query().patchAndFetchById(
          manuscript.id,
          {
            authorFeedback: {
              ...manuscript.authorFeedback,
              previousSubmissions: orderBy(
                previousSubmissions,
                [obj => new Date(obj.submitted)],
                ['desc'],
              ),
            },
          },
        )

        const author = await models.User.query().findById(ctx.user)

        const activeConfig = await models.Config.getCached(manuscript.groupId)

        const editorTeam =
          manuscript.teams &&
          !!manuscript.teams.length &&
          manuscript.teams.find(manuscriptTeam => {
            return manuscriptTeam.role.includes('editor')
          })

        const editor =
          editorTeam && !!editorTeam.members.length
            ? editorTeam.members[0]
            : null

        if (!editor) {
          // eslint-disable-next-line no-console
          console.info('No editor assigned. Email not sent.')
          return updated
        }

        const receiverEmail = editor.user.email
        /* eslint-disable-next-line */
        const receiverName = editor.user.username

        const selectedTemplate =
          activeConfig.formData.eventNotification
            ?.authorProofingSubmittedEmailTemplate

        const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/
        const emailValidationResult = emailValidationRegexp.test(receiverEmail)

        if (!emailValidationResult || !receiverName) {
          return updated
        }

        if (selectedTemplate) {
          const notificationInput = {
            manuscript,
            selectedEmail: receiverEmail,
            selectedTemplate,
            currentUser: author?.username || '',
            groupId: manuscript.groupId,
          }

          try {
            await sendEmailWithPreparedData(notificationInput, ctx, author)

            let channelId

            if (manuscript.parentId) {
              const channel = await models.Manuscript.relatedQuery('channels')
                .for(manuscript.parentId)
                .findOne({ topic: 'Editorial discussion' })

              channelId = channel.id
            } else {
              channelId = manuscript.channels.find(
                channel => channel.topic === 'Editorial discussion',
              ).id
            }

            models.Message.createMessage({
              content: `Author proof completed Email sent by Kotahi to ${editor.user.username}`,
              channelId,
              userId: editor.user.id,
            })
          } catch (e) {
            /* eslint-disable-next-line */
            console.log('email was not sent', e)
          }
        } else {
          // eslint-disable-next-line no-console
          console.info(
            'No email template configured for notifying of author proof completed. Email not sent.',
          )
        }
      }

      return updated
    },
    async createNewVersion(_, { id }, ctx) {
      const manuscript = await models.Manuscript.query().findById(id)
      return manuscript.createNewVersion()
    },
    async submitManuscript(_, { id, input }, ctx) {
      // Automated email submissionConfirmation on submission
      const manuscript = await models.Manuscript.query()
        .findById(id)
        .withGraphFetched('[submitter.defaultIdentity, channels]')

      const activeConfig = await models.Config.getCached(manuscript.groupId)

      const selectedTemplate =
        activeConfig.formData.eventNotification
          ?.submissionConfirmationEmailTemplate

      if (selectedTemplate && manuscript.submitter) {
        const sender = await models.User.query().findById(ctx.user)
        const receiverEmail = manuscript.submitter.email
        /* eslint-disable-next-line */
        const receiverName =
          manuscript.submitter.username ||
          manuscript.submitter.defaultIdentity.name ||
          ''

        const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/
        const emailValidationResult = emailValidationRegexp.test(receiverEmail)

        if (!emailValidationResult || !receiverName) {
          return commonUpdateManuscript(id, input, ctx)
        }

        const notificationInput = {
          manuscript,
          selectedEmail: receiverEmail,
          selectedTemplate,
          currentUser: sender?.username || '',
          groupId: manuscript.groupId,
        }

        try {
          await sendEmailWithPreparedData(notificationInput, ctx, sender)

          let channelId

          if (manuscript.parentId) {
            const channel = await models.Manuscript.relatedQuery('channels')
              .for(manuscript.parentId)
              .findOne({ topic: 'Editorial discussion' })

            channelId = channel.id
          } else {
            // Get channel ID
            channelId = manuscript.channels.find(
              channel => channel.topic === 'Editorial discussion',
            ).id
          }

          models.Message.createMessage({
            content: `Submission Confirmation Email sent by Kotahi to ${manuscript.submitter.username}`,
            channelId,
            userId: manuscript.submitterId,
          })
        } catch (e) {
          /* eslint-disable-next-line */
          console.log('email was not sent', e)
        }
      } else {
        // eslint-disable-next-line no-console
        console.info(
          'No email template configured for notifying of submission confirmation. Email not sent.',
        )
      }

      return commonUpdateManuscript(id, input, ctx)
    },

    async makeDecision(_, { id, decision: decisionString }, ctx) {
      const manuscript = await models.Manuscript.query()
        .findById(id)
        .withGraphFetched(
          '[submitter.[defaultIdentity], channels, teams.members.user, reviews.user]',
        )

      const activeConfig = await models.Config.getCached(manuscript.groupId)

      switch (decisionString) {
        case 'accept':
          manuscript.decision = 'accepted'
          manuscript.status = 'accepted'
          break
        case 'revise':
          manuscript.decision = 'revise'
          manuscript.status = 'revise'
          break
        case 'reject':
          manuscript.decision = 'rejected'
          manuscript.status = 'rejected'
          break

        default:
          if (['prc', 'journal'].includes(activeConfig.formData.instanceName)) {
            manuscript.decision = 'accepted'
            manuscript.status = 'accepted'
          } else if (
            ['preprint1', 'preprint2'].includes(
              activeConfig.formData.instanceName,
            )
          ) {
            manuscript.decision = 'evaluated'
            manuscript.status = 'evaluated'
          } else {
            throw new Error(
              `Unknown decision type "${decisionString}" received.`,
            )
          }
      }

      if (manuscript.decision && manuscript.submitter) {
        // Automated email evaluationComplete on decision
        const receiverEmail = manuscript.submitter.email

        const receiverName =
          manuscript.submitter.username ||
          manuscript.submitter.defaultIdentity.name ||
          ''

        const sender = await models.User.query().findById(ctx.user)

        const selectedTemplate =
          activeConfig.formData.eventNotification
            ?.evaluationCompleteEmailTemplate

        const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/
        const emailValidationResult = emailValidationRegexp.test(receiverEmail)

        if (emailValidationResult && receiverName) {
          if (selectedTemplate) {
            const notificationInput = {
              manuscript,
              selectedEmail: receiverEmail,
              selectedTemplate,
              currentUser: sender?.username || '',
              groupId: manuscript.groupId,
            }

            try {
              await sendEmailWithPreparedData(notificationInput, ctx, sender)

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

              models.Message.createMessage({
                content: body,
                channelId,
                userId: manuscript.submitterId,
              })
            } catch (e) {
              /* eslint-disable-next-line */
              console.log('email was not sent', e)
            }
          } else {
            // eslint-disable-next-line no-console
            console.info(
              'No email template configured for notifying of evaluation complete. Email not sent.',
            )
          }
        }
      }

      return models.Manuscript.query().updateAndFetchById(id, manuscript)
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
          await new models.TeamMember({
            teamId: existingTeam.id,
            status,
            userId,
            isShared: invitationData ? invitationData.isShared : null,
          }).save()
        }

        return existingTeam.$query()
      }

      // Create a new team of reviewers if it doesn't exist

      const newTeam = await new models.Team({
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

      await models.TeamMember.query()
        .where({
          userId,
          teamId: reviewerTeam.id,
        })
        .delete()

      await removeUserFromManuscriptChatChannel({
        manuscriptId,
        userId,
        type: 'editorial',
      })

      return reviewerTeam.$query().withGraphFetched('members.user')
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

      return updated
    },
    async publishManuscript(_, { id }, ctx) {
      const manuscript = await models.Manuscript.query()
        .findById(id)
        .withGraphFetched('[reviews, publishedArtifacts]')

      const containsElifeStyleEvaluations = hasElifeStyleEvaluations(manuscript)

      const activeConfig = await models.Config.getCached(manuscript.groupId)

      // We will roll back to the following values if all publishing steps fail:
      const prevPublishedDate = manuscript.published
      const prevStatus = manuscript.status

      const newPublishedDate = new Date()
      // We update the manuscript in advance, so that external services such as Flax
      // will be able to retrieve it as a "published" manuscript. If all publishing steps
      // fail, we will revert these changes at the end.
      await models.Manuscript.query().patchAndFetchById(id, {
        published: newPublishedDate,
        status: 'published',
      })

      const notification = await models.CoarNotification.query().findOne({
        manuscriptId: manuscript.id,
      })

      const update = { published: newPublishedDate, status: 'published' } // This will also collect any properties we may want to update in the DB
      const steps = []

      if (activeConfig.formData.publishing.crossref.login) {
        const stepLabel = 'Crossref'
        let succeeded = false
        let errorMessage

        if (
          containsElifeStyleEvaluations ||
          manuscript.status !== 'evaluated'
        ) {
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

      if (process.env.GOOGLE_SPREADSHEET_ID) {
        const stepLabel = 'Google Spreadsheet'
        let succeeded = false
        let errorMessage

        try {
          await publishToGoogleSpreadSheet(manuscript)
          update.submission = {
            ...manuscript.submission,
            $editDate: new Date().toISOString().split('T')[0],
          }
          succeeded = true
        } catch (e) {
          console.error('error while publishing to google spreadsheet')
          console.error(e)
          errorMessage = e.message
        }

        steps.push({ succeeded, errorMessage, stepLabel })
      }

      if (activeConfig.formData.publishing.hypothesis.apiKey) {
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

      if (activeConfig.formData.publishing.webhook.url) {
        try {
          await tryPublishingWebhook(manuscript.id)
          steps.push({ stepLabel: 'Publishing webhook', succeeded: true })
        } catch (err) {
          console.error(err)
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

      try {
        if (await publishOnCMS(manuscript.groupId, manuscript.id))
          steps.push({ stepLabel: 'Publishing CMS', succeeded: true })
      } catch (err) {
        console.error(err)
        steps.push({
          stepLabel: 'Publishing CMS',
          succeeded: false,
          errorMessage: err.message,
        })
      }

      if (notification) {
        try {
          if (await sendNotificationToCoar(notification, manuscript))
            steps.push({
              stepLabel: 'COAR Notify review complete announcement sent',
              succeeded: true,
            })
        } catch (err) {
          console.error(err)
          steps.push({
            stepLabel: 'COAR Notify review complete announcement sent',
            succeeded: false,
            errorMessage: err.message,
          })
        }
      }

      let updatedManuscript

      if (steps.some(step => step.succeeded)) {
        updatedManuscript = await models.Manuscript.query().patchAndFetchById(
          id,
          update,
        )
      } else {
        // Revert the changes to published date and status
        updatedManuscript = await models.Manuscript.query().patchAndFetchById(
          id,
          { published: prevPublishedDate, status: prevStatus },
        )
      }

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
      return models.Manuscript.query().findById(id)
    },
    // TODO This is overcomplicated, trying to do three things at once (find manuscripts
    // where user is author, reviewer or editor).
    async manuscriptsUserHasCurrentRoleIn(
      _,
      {
        reviewerStatus,
        wantedRoles,
        sort,
        offset,
        limit,
        filters,
        timezoneOffsetMinutes,
        groupId,
        searchInAllVersions,
      },
      ctx,
    ) {
      const submissionForm = await getSubmissionForm(groupId)

      const firstVersionIds =
        await models.Manuscript.getFirstVersionIdsOfManuscriptsUserHasARoleIn(
          ctx.user,
          groupId,
        )

      // Get those top-level manuscripts with all versions, all with teams and members
      const allManuscriptsWithInfo = []

      // eslint-disable-next-line no-restricted-syntax
      for (const someIds of chunk(firstVersionIds, 20)) {
        // eslint-disable-next-line no-await-in-loop
        const someManuscriptsWithInfo = await models.Manuscript.query()
          .withGraphFetched(
            '[teams.members, tasks, invitations, manuscriptVersions(orderByCreatedDesc).[teams.members, tasks, invitations]]',
          )
          .whereIn('id', someIds)
          .orderBy('created', 'desc')

        allManuscriptsWithInfo.push(...someManuscriptsWithInfo)
      }

      // Get the latest version of each manuscript, and check the users role in that version
      const userManuscriptsWithInfo = {}

      allManuscriptsWithInfo.forEach(m => {
        const latestVersion =
          m.manuscriptVersions && m.manuscriptVersions.length > 0
            ? m.manuscriptVersions[0]
            : m

        const versionsToSearch = searchInAllVersions
          ? [m, ...(m.manuscriptVersions ?? [])]
          : [latestVersion]

        const rolesFound = new Set()

        versionsToSearch.forEach(v =>
          v.teams
            .filter(t => wantedRoles.includes(t.role))
            .forEach(t => {
              if (
                t.members.some(
                  member =>
                    member.userId === ctx.user &&
                    (!reviewerStatus || member.status === reviewerStatus),
                )
              )
                rolesFound.add(t.role)
            }),
        )

        if (rolesFound.size) {
          // eslint-disable-next-line no-param-reassign
          latestVersion.hasOverdueTasksForUser =
            manuscriptHasOverdueTasksForUser(latestVersion, ctx.user)
          latestVersion.rolesFound = [...rolesFound]

          userManuscriptsWithInfo[latestVersion.id] = latestVersion
        }
      })

      // Apply filters to the manuscripts, limiting results to those the user has a role in
      // TODO This should move into the model, as all raw DB interactions should be controlled there
      const [rawQuery, rawParams] = buildQueryForManuscriptSearchFilterAndOrder(
        sort,
        offset,
        limit,
        filters,
        false,
        submissionForm,
        timezoneOffsetMinutes || 0,
        Object.keys(userManuscriptsWithInfo),
        groupId,
      )

      const knex = models.Manuscript.knex()
      const rawQResult = await knex.raw(rawQuery, rawParams)
      let totalCount = 0

      const resultRows =
        Object.keys(userManuscriptsWithInfo).length > 0 ? rawQResult.rows : []

      totalCount = parseInt(resultRows.length, 10)

      // Add in searchRank and searchSnippet
      const result = resultRows.map(row => ({
        ...userManuscriptsWithInfo[row.id],
        searchRank: row.rank,
        searchSnippet: row.snippet,
      }))

      return { totalCount, manuscripts: result }
    },
    async manuscripts(_, { where }, ctx) {
      return models.Manuscript.query()
        .where({ parentId: null })
        .whereNot({ isHidden: true })
        .orderBy('created', 'desc')
    },
    async publishedManuscripts(_, { sort, offset, limit, groupId }, ctx) {
      const query = models.Manuscript.query()
        .where({ groupId })
        .whereNotNull('published')

      const totalCount = await query.resultSize()

      if (sort) {
        const [sortName, sortDirection] = sort.split('_')
        query.orderBy(ref(sortName), sortDirection)
      }

      if (limit) query.limit(limit)
      if (offset) query.offset(offset)
      const manuscripts = await query

      return {
        totalCount,
        manuscripts,
      }
    },

    async paginatedManuscripts(
      _,
      {
        sort,
        offset,
        limit,
        filters,
        timezoneOffsetMinutes,
        archived,
        groupId,
      },
      ctx,
    ) {
      const groupIdFromHeader = ctx.req.headers['group-id']
      const finalGroupId = groupId || groupIdFromHeader
      const submissionForm = await getSubmissionForm(finalGroupId)

      // TODO Move this to the model, as only the model should interact with DB directly
      const [rawQuery, rawParams] = buildQueryForManuscriptSearchFilterAndOrder(
        sort,
        offset,
        limit,
        filters,
        archived,
        submissionForm,
        timezoneOffsetMinutes || 0,
        null,
        finalGroupId,
      )

      const knex = models.Manuscript.knex()
      const rawQResult = await knex.raw(rawQuery, rawParams)
      let totalCount = 0
      if (rawQResult.rowCount)
        totalCount = parseInt(rawQResult.rows[0].full_count, 10)

      const ids = rawQResult.rows.map(row => row.id)
      const manuscripts = await models.Manuscript.query().findByIds(ids)

      const result = rawQResult.rows.map(row => ({
        ...manuscripts.find(m => m.id === row.id),
        searchRank: row.rank,
        searchSnippet: row.snippet,
      }))

      return { totalCount, manuscripts: result }
    },

    async manuscriptsPublishedSinceDate(
      _,
      { startDate, limit, offset, groupName },
      ctx,
    ) {
      const groups = await models.Group.query().where({ isArchived: false })
      let group = null
      const groupIdFromHeader = ctx.req.headers['group-id']

      if (groupIdFromHeader)
        group = groups.find(g => g.id === groupIdFromHeader)
      else if (groupName) group = groups.find(g => g.name === groupName)
      else if (groups.length === 1) [group] = groups

      if (!group) throw new Error(`Group with name '${groupName}' not found`)

      const subQuery = models.Manuscript.query()
        .select('short_id')
        .max('created as latest_created')
        .where('group_id', group.id)
        .groupBy('short_id')

      const query = models.Manuscript.query()
        .select('m.*', raw('count(*) over () as totalCount'))
        .from(models.Manuscript.query().as('m'))
        .innerJoin(subQuery.as('sub'), 'm.short_id', 'sub.short_id')
        .andWhere('m.created', '=', raw('sub.latest_created'))
        .whereNotNull('m.published')
        .where('m.group_id', group.id)
        .orderBy('m.published', 'desc')

      if (startDate) query.where('m.published', '>=', new Date(startDate))
      if (limit) query.limit(limit)
      if (offset) query.offset(offset)

      return query
    },
    async publishedManuscript(_, { id }, ctx) {
      return models.Manuscript.query().findById(id).whereNotNull('published')
    },
    async unreviewedPreprints(_, { token, groupName = null }, ctx) {
      const groups = await models.Group.query().where({ isArchived: false })
      let group = null
      if (groupName) group = groups.find(g => g.name === groupName)
      else if (groups.length === 1) [group] = groups
      if (!group) throw new Error(`Group with name '${groupName}' not found`)

      const activeConfig = await models.Config.getCached(group.id)

      if (activeConfig.formData.kotahiApis.tokens) {
        validateApiToken(token, activeConfig.formData.kotahiApis.tokens)
      } else {
        throw new Error('Kotahi api tokens are not configured!')
      }

      const manuscripts = await models.Manuscript.query()
        .where({ status: 'new', groupId: group.id })
        .whereRaw(`submission->>'$customStatus' = 'readyToEvaluate'`)

      return manuscripts.map(m => ({
        id: m.id,
        shortId: m.shortId,
        title: m.submission.$title,
        abstract: m.submission.$abstract,
        authors: m.submission.$authors || [],
        doi: m.submission.$doi,
        uri: m.submission.$sourceUri,
      }))
    },
    async doisToRegister(_, { id }, ctx) {
      const manuscript = await models.Manuscript.query()
        .findById(id)
        .withGraphJoined('reviews')

      const activeConfig = await models.Config.getCached(manuscript.groupId)

      if (!activeConfig.formData.publishing.crossref.login) {
        return null
      }

      const DOIs = []

      if (
        activeConfig.formData.publishing.crossref.publicationType === 'article'
      ) {
        try {
          const manuscriptDOI = await getDoi(
            getReviewOrSubmissionField(manuscript, '$doiSuffix') ||
              manuscript.id,
            activeConfig,
          )

          if (manuscriptDOI) {
            DOIs.push(manuscriptDOI)
          }
        } catch (error) {
          console.error('Error while getting manuscript DOI:', error)
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
          ...notEmptyReviews.map(async reviewNumber => {
            try {
              const reviewDOI = await getDoi(
                getReviewOrSubmissionField(
                  manuscript,
                  `review${reviewNumber}suffix`,
                ) || `${manuscript.id}/${reviewNumber}`,
                activeConfig,
              )

              return reviewDOI
            } catch (error) {
              console.error(
                `Error while getting review ${reviewNumber} DOI:`,
                error,
              )
              return null
            }
          }),
        )

        if (
          Object.entries(manuscript.submission).some(
            ([key, value]) =>
              key === 'summary' && !checkIsAbstractValueEmpty(value),
          )
        ) {
          try {
            const summaryDOI = await getDoi(
              getReviewOrSubmissionField(manuscript, 'summarysuffix') ||
                `${manuscript.id}/`,
              activeConfig,
            )

            if (summaryDOI) {
              DOIs.push(summaryDOI)
            }
          } catch (error) {
            console.error('Error while getting summary DOI:', error)
          }
        }
      }

      return DOIs
    },
    /** Return true if the DOI exists (is found in Crossref) */
    async validateDOI(_, { doiOrUrl }, ctx) {
      const doi = doiOrUrl.startsWith('https://doi.org/')
        ? encodeURI(doiOrUrl.split('.org/')[1])
        : doiOrUrl

      return { isDOIValid: await doiExists(doi) }
    },
    /** Return true if a DOI formed from this suffix has not already been assigned (i.e. not found in Crossref) */
    // To be called in submit manuscript as
    // first validation step for custom suffix
    async validateSuffix(_, { suffix, groupId }, ctx) {
      const activeConfig = await models.Config.getCached(groupId)

      const doi = getDoi(suffix, activeConfig)
      return { isDOIValid: await doiIsAvailable(doi) }
    },

    async getManuscriptsData(_, { selectedManuscripts }, ctx) {
      const manuscripts = await models.Manuscript.query()
        .findByIds(selectedManuscripts)
        .withGraphFetched('[reviews.[user], teams.[members]]')

      const exportData = []

      // eslint-disable-next-line no-restricted-syntax
      for (const manuscript of manuscripts) {
        // eslint-disable-next-line no-await-in-loop
        const manuscriptVersions = await manuscript.getManuscriptVersions()

        const manuscriptData = {
          versionIdentifier: manuscriptVersions.length + 1,
          ...extractCommonData(manuscript),
          reviews: extractReviewData(manuscript.reviews, false),
          decisions: extractReviewData(manuscript.reviews, true),
          manuscriptVersions: manuscriptVersions.map((version, index) => ({
            versionIdentifier: manuscriptVersions.length - index,
            ...extractCommonData(version),
            reviews: extractReviewData(version.reviews, false),
            decisions: extractReviewData(version.reviews, true),
          })),
        }

        exportData.push(manuscriptData)
      }

      return exportData
    },
    /** Return all version IDs for which the current user is assigned as a reviewer */
    async versionsOfManuscriptCurrentUserIsReviewerOf(
      _,
      { manuscriptId },
      ctx,
    ) {
      const otherVersions = await (
        await models.Manuscript.query().findById(manuscriptId)
      ).getManuscriptVersions()

      const versionIds = [manuscriptId, ...otherVersions.map(v => v.id)]

      const assignments = await models.User.relatedQuery('teams')
        .for(ctx.user)
        .select('objectId')
        .where({ role: 'reviewer' })
        .whereIn('objectId', versionIds)

      return [...new Set(assignments.map(a => a.objectId))]
    },
  },
  Manuscript: {
    ...manuscriptAndPublishedManuscriptSharedResolvers,
    async channels(parent) {
      return (
        parent.channels ||
        models.Manuscript.relatedQuery('channels').for(
          parent.parentId || parent.id, // chat channels belong to the first-version manuscript
        )
      )
    },
    async reviews(parent, _, ctx) {
      return getRelatedReviews(parent, ctx)
    },
    async teams(parent, _, ctx) {
      return parent.teams || cachedGet(`teamsForObject:${parent.id}`)
    },
    async invitations(parent) {
      return (
        parent.invitations ||
        models.Manuscript.relatedQuery('invitations').for(parent.id)
      )
    },
    async tasks(parent) {
      return (
        parent.tasks ||
        models.Manuscript.relatedQuery('tasks')
          .for(parent.id)
          .orderBy('sequenceIndex')
      )
    },
    async manuscriptVersions(parent) {
      return cachedGet(`subVersionsOfMs:${parent.id}`)
    },
    async submitter(parent) {
      return parent.submitter ?? cachedGet(`submitterOfMs:${parent.id}`)
    },
    async firstVersionCreated(parent) {
      if (parent.created && !parent.parentId) return parent.created
      const id = parent.parentId || parent.id

      const record = await models.Manuscript.query()
        .findById(id)
        .select('created')

      return record.created
    },
    async authorFeedback(parent) {
      if (parent.authorFeedback && parent.authorFeedback.submitterId) {
        const submitter = await models.User.query().findById(
          parent.authorFeedback.submitterId,
        )

        return {
          ...parent.authorFeedback,
          submitter,
        }
      }

      return parent.authorFeedback || {}
    },
  },
  PublishedManuscript: {
    ...manuscriptAndPublishedManuscriptSharedResolvers,
    async printReadyPdfUrl(parent) {
      // TODO reduce shared code with files resolver
      const files = (
        parent.files ||
        (await (
          await models.Manuscript.query().findById(parent.id)
        ).$relatedQuery('files'))
      ).map(f => ({
        ...f,
        tags: f.tags || [],
        storedObjects: f.storedObjects || [],
      }))

      const printReadyPdf = files.find(f => f.tags.includes('printReadyPdf'))
      return printReadyPdf ? printReadyPdf.storedObjects[0].url : null
    },
    async styledHtml(parent) {
      // TODO reduce shared code with files resolver
      let files = (
        parent.files ||
        (await (
          await models.Manuscript.query().findById(parent.id)
        ).$relatedQuery('files'))
      ).map(f => ({
        ...f,
        tags: f.tags || [],
        storedObjects: f.storedObjects || [],
      }))

      files = await getFilesWithUrl(files)

      const source =
        typeof parent.meta.source === 'string'
          ? await replaceImageSrcResponsive(parent.meta.source, files, 'medium')
          : null

      return applyTemplate(
        { ...parent, files, meta: { ...parent.meta, ...source } },
        true,
      )
    },
    async css(parent) {
      return getCss()
    },
    async publishedDate(parent) {
      return parent.published
    },
    async reviews(parent, { _ }, ctx) {
      let reviews = await getRelatedReviews(parent, ctx)

      if (!Array.isArray(reviews)) {
        return []
      }

      reviews = reviews.filter(review => !review.isDecision)
      const reviewForm = await getReviewForm(parent.groupId)

      const threadedDiscussions =
        parent.threadedDiscussions ||
        (await getThreadedDiscussionsForManuscript(parent, getUsersById))

      return getPublishableReviewFields(
        reviews,
        reviewForm,
        threadedDiscussions,
        parent,
      )
    },

    async decisions(parent, { _ }, ctx) {
      // filtering decisions in Kotahi itself so that we can change
      // the logic easily in future.
      const reviews = await getRelatedReviews(parent, ctx)

      if (!Array.isArray(reviews)) {
        return []
      }

      const decisions = reviews.filter(review => review.isDecision)
      const decisionForm = await getDecisionForm(parent.groupId)

      const threadedDiscussions =
        parent.threadedDiscussions ||
        (await getThreadedDiscussionsForManuscript(parent, getUsersById))

      return getPublishableReviewFields(
        decisions,
        decisionForm,
        threadedDiscussions,
        parent,
      )
    },
    async editors(parent) {
      const teams = await models.Team.query()
        .where({ objectId: parent.id })
        .whereIn('role', ['seniorEditor', 'handlingEditor', 'editor'])

      const teamMembers = await models.TeamMember.query().whereIn(
        'team_id',
        teams.map(t => t.id),
      )

      const editorAndRoles = await Promise.all(
        teamMembers.map(async member => {
          const user = await models.User.query().findById(member.userId)
          const team = teams.find(t => t.id === member.teamId)
          return {
            name: user.username,
            role: team.role,
          }
        }),
      )

      return editorAndRoles
    },
    async submissionWithFields(parent) {
      const submissionForm = await getSubmissionForm(parent.groupId)

      const submissionWithFields = getPublishableSubmissionFields(
        submissionForm,
        parent,
      )

      return submissionWithFields
    },
    async supplementaryFiles(parent) {
      const supplementaryFilesWithTitles = await getPublishableSubmissionFiles(
        parent,
      )

      return JSON.stringify(supplementaryFilesWithTitles)
    },

    // Since we can not change the api response structure right now
    // So Adding the totalCount field in the manuscript itself.
    async totalCount(parent) {
      return parent.totalcount
    },
  },
  ManuscriptMeta: {
    async source(parent, _, ctx, info) {
      if (typeof parent.source !== 'string') return null

      let files =
        parent.manuscriptFiles ||
        (await (
          await models.Manuscript.query().findById(parent.manuscriptId)
        ).$relatedQuery('files'))

      files = await getFilesWithUrl(files)
      // TODO Any reason not to use replaceImageSrcResponsive here?
      return replaceImageSrc(parent.source, files, 'medium')
    },
  },
  PublishedReview: {
    async user(parent) {
      if (parent.isHiddenReviewerName) {
        return { id: '', username: 'Anonymous User' }
      }

      const user = await models.User.query().findById(parent.userId)
      return user
    },
  },
}

const typeDefs = `
  extend type Query {
    globalTeams: [Team]
    manuscript(id: ID!): Manuscript!
    manuscripts: [Manuscript]!
    paginatedManuscripts(offset: Int, limit: Int, sort: ManuscriptsSort, filters: [ManuscriptsFilter!]!, timezoneOffsetMinutes: Int, archived: Boolean!, groupId: ID!): PaginatedManuscripts
    manuscriptsUserHasCurrentRoleIn(reviewerStatus: String, wantedRoles: [String]!, offset: Int, limit: Int, sort: ManuscriptsSort, filters: [ManuscriptsFilter!]!, timezoneOffsetMinutes: Int, groupId: ID!, searchInAllVersions: Boolean!): PaginatedManuscripts
    publishedManuscripts(sort:String, offset: Int, limit: Int, groupId: ID!): PaginatedManuscripts
    validateDOI(doiOrUrl: String): validateDOIResponse
    validateSuffix(suffix: String, groupId: ID!): validateDOIResponse

    """ Get published manuscripts with irrelevant fields stripped out. Optionally, you can specify a startDate and/or limit. """
    manuscriptsPublishedSinceDate(startDate: DateTime, limit: Int, offset: Int, groupName: String): [PublishedManuscript!]!
    """ Get a published manuscript by ID, or null if this manuscript is not published or not found """
    publishedManuscript(id: ID!): PublishedManuscript
    unreviewedPreprints(token: String!, groupName: String): [Preprint!]!
    doisToRegister(id: ID!): [String]
    getManuscriptsData(selectedManuscripts: [ID!]!): [ManuscriptExport!]!
    versionsOfManuscriptCurrentUserIsReviewerOf(manuscriptId: ID!): [ID!]!
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
    submitAuthorProofingFeedback(id: ID!, input: String): Manuscript!
    makeDecision(id: ID!, decision: String): Manuscript!
    deleteManuscript(id: ID!): ID!
    deleteManuscripts(ids: [ID]!): [ID]!
    reviewerResponse(currentUserId: ID, action: String, teamId: ID! ): Team
    assignTeamEditor(id: ID!, input: String): [Team]
    addReviewer(manuscriptId: ID!, userId: ID!, invitationId: ID): Team
    removeReviewer(manuscriptId: ID!, userId: ID!): Team
    publishManuscript(id: ID!): PublishingResult!
    createNewVersion(id: ID!): Manuscript
    importManuscripts(groupId: ID!): Boolean!
    setShouldPublishField(manuscriptId: ID!, objectId: ID!, fieldName: String!, shouldPublish: Boolean!): Manuscript!
    archiveManuscript(id: ID!): ID!
    archiveManuscripts(ids: [ID]!): [ID!]!
    unarchiveManuscripts(ids: [ID]!): [ID!]!
    assignAuthoForProofingManuscript(id: ID!): Manuscript!
  }

  type Manuscript {
    id: ID!
    parentId: ID
    created: DateTime!
    firstVersionCreated: DateTime!
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
    formFieldsToPublish: [FormFieldsToPublish!]!
    searchRank: Float
    searchSnippet: String
    importSourceServer: String
    tasks: [Task!]
    hasOverdueTasksForUser: Boolean
    invitations: [Invitation]
    authorFeedback: ManuscriptAuthorFeeback
    rolesFound: [String!]
  }

  type ReviewExport {
    created: DateTime!
    updated: DateTime
    username: String
    isDecision: Boolean
    isHiddenReviewerName: Boolean
    isHiddenFromAuthor: Boolean
    jsonData: String
  }

  type ManuscriptExport {
    versionIdentifier: Int!
    created: DateTime!
    updated: DateTime
    manuscriptVersions: [ManuscriptExport]
    shortId: Int!
    teams: [Team]
    reviews: [ReviewExport]
    decisions: [ReviewExport]
    status: String
    decision: String
    authors: [Author]
    submission: String
    importSourceServer: String
  }

  input ManuscriptInput {
    files: [FileInput]
    meta: ManuscriptMetaInput
    submission: String
    groupId: ID!
  }

  input ManuscriptMetaInput {
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
    full
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
    title: String
    source: String
    abstract: String
    subjects: [String]
    history: [MetaDate]
    manuscriptId: ID
  }

  type ManuscriptAuthorFeeback {
    text: String
    fileIds: [String!]
    submitter: User
    edited: DateTime
    submitted: DateTime
    assignedAuthors: [AssignedAuthor!]
    previousSubmissions: [previousSubmission!]
  }

  type AssignedAuthor {
    authorId: ID!
    authorName: String!
    assignedOnDate: DateTime!
  }

  type previousSubmission {
    text: String!
    fileIds: [String!]
    submitter: User
    edited: DateTime
    submitted: DateTime!
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
    submission: String!
    submissionWithFields: String
    supplementaryFiles: String
    publishedArtifacts: [PublishedArtifact!]!
    publishedDate: DateTime
		printReadyPdfUrl: String
		styledHtml: String
		css: String
    decision: String
    totalCount: Int
    editors: [Editor!]
    reviews: [PublishedReview!]
    decisions: [PublishedReview!]
  }

  type PublishedReview {
    id: ID!
    created: DateTime!
    updated: DateTime
    isDecision: Boolean
    open: Boolean
    user: ReviewUser
    isHiddenFromAuthor: Boolean
    isHiddenReviewerName: Boolean
    isSharedWithCurrentUser: Boolean!
    canBePublishedPublicly: Boolean!
    jsonData: String
    userId: String
    files: [File]
  }

  type Editor {
    id: ID
    name: String!
    role: String!
  }

  type ReviewUser {
    id: ID
    username: String
  }

`

module.exports = {
  typeDefs,
  resolvers,
}
