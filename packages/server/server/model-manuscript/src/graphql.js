/* eslint-disable prefer-destructuring */
const { ref, raw } = require('objection')
const axios = require('axios')
const { map, chunk, orderBy, uniqBy } = require('lodash')
const { subscriptionManager, File } = require('@coko/server')
const cheerio = require('cheerio')

const {
  importManuscripts,
  importManuscriptsFromSemanticScholar,
} = require('./importManuscripts')

const { manuscriptHasOverdueTasksForUser } = require('./manuscriptCommsUtils')
const { rebuildCMSSite } = require('../../flax-site/flax-api')

const Team = require('../../../models/team/team.model')
const TeamMember = require('../../../models/teamMember/teamMember.model')
const Group = require('../../../models/group/group.model')
const CoarNotification = require('../../../models/coarNotification/coarNotification.model')
const Manuscript = require('../../../models/manuscript/manuscript.model')
const PublishedArtifact = require('../../../models/publishedArtifact/publishedArtifact.model')
const User = require('../../../models/user/user.model')
const Invitation = require('../../../models/invitation/invitation.model')
const Config = require('../../../models/config/config.model')
const ReviewModel = require('../../../models/review/review.model')
const CollaborativeDoc = require('../../../models/collaborative-doc/collaborativeDoc.model')

const {
  sendAnnouncementNotification,
} = require('../../coar-notify/coar-notify')

const {
  sendAnnouncementNotificationToSciety,
} = require('../../coar-notify/sciety')

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

const { publishToDatacite } = require('../../publishing/datacite')

const { publishToDOAJ } = require('../../publishing/doaj')

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

const {
  deepMergeObjectsReplacingArrays,
  objIf,
} = require('../../utils/objectUtils')

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
} = require('../../model-user/src/userCommsUtils')

const {
  addUserToManuscriptChatChannel,
  removeUserFromManuscriptChatChannel,
} = require('../../model-channel/src/channelCommsUtils')

const { cachedGet } = require('../../querycache')

const seekEvent = require('../../../services/notification.service')

const ThreadedDiscussion = require('../../../models/threadedDiscussion/threadedDiscussion.model')

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
const getRelatedReviews = async (
  manuscript,
  ctx,
  shouldGetPublicReviewsOnly = false,
) => {
  const reviewForm = await getReviewForm(manuscript.groupId)
  const decisionForm = await getDecisionForm(manuscript.groupId)

  let reviews =
    manuscript.reviews ||
    (await Manuscript.relatedQuery('reviews').for(manuscript.id)) ||
    []

  reviews = await ReviewModel.orderReviewPerUsername(reviews)

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

  const userRoles = shouldGetPublicReviewsOnly
    ? {}
    : await getUserRolesInManuscript(ctx.userId, manuscript.id)

  const sharedReviewersIds = await getSharedReviewersIds(
    manuscript.id,
    ctx.userId,
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
    ctx.userId,
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
    (await Manuscript.relatedQuery('publishedArtifacts').for(manuscript.id))

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
      parent.files || (await Manuscript.relatedQuery('files').for(parent.id))
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
  const msDelta = JSON.parse(input) // Convert the JSON input to JavaScript object
  if (msDelta.submission?.$doi?.startsWith('https://doi.org/'))
    msDelta.submission.$doi =
      msDelta.submission.$doi.split('https://doi.org/')[1]

  const ms = await Manuscript.query()
    .findById(id)
    .withGraphFetched('[reviews.user, files, tasks]')

  const activeConfig = await Config.getCached(ms.groupId)

  // If this manuscript is getting its label set for the first time,
  // we will populate its task list from the template tasks
  const isSettingFirstLabels = ['prc'].includes(
    activeConfig.formData.instanceName,
  )
    ? !ms.submission.$customStatus && !!msDelta.submission?.$customStatus
    : false

  const updatedMs = deepMergeObjectsReplacingArrays(ms, msDelta)

  if (updatedMs.meta?.comments && !Array.isArray(updatedMs.meta.comments)) {
    updatedMs.meta.comments = JSON.parse(updatedMs.meta.comments)
  }

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

  // If the status is `submitted` or 'embargoReleased' and `submission.$embargoDate` is present we update the staus to `underEmbargo`
  if (
    updatedMs.submission?.$embargoDate &&
    updatedMs.submission?.$embargoDate?.length &&
    ['submitted', 'embargoReleased'].includes(updatedMs.status) &&
    updatedMs.status !== 'underEmbargo'
  ) {
    updatedMs.status = 'underEmbargo'
  }

  if (isSettingFirstLabels && !updatedMs.tasks.length)
    await populateTemplatedTasksForManuscript(id)

  await uploadAndConvertBase64ImagesInManuscript(updatedMs)

  // convert to json, otherwise you're bypassing validation
  return Manuscript.query().updateAndFetchById(id, updatedMs.$toJson())
}

/** Send the manuscriptId OR a configured ref; and send token if one is configured */
const tryPublishingWebhook = async manuscriptId => {
  const manuscript = await Manuscript.query()
    .findById(manuscriptId)
    .select('groupId')

  const activeConfig = await Config.getCached(manuscript.groupId)

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

const getSupplementaryFiles = async manuscriptId => {
  return Manuscript.relatedQuery('files')
    .for(manuscriptId)
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

const sendNotificationToSciety = async manuscript => {
  const response = await sendAnnouncementNotificationToSciety(manuscript)
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
      const group = await Group.query().findById(groupId)
      if (!group)
        throw new Error(`Cannot create manuscript for unknown group ${groupId}`)
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
        submitterId: ctx.userId,
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
            displayName: 'Author',
            members: [{ user: { id: ctx.userId } }],
            objectType: 'manuscript',
          },
        ],
        groupId: group.id,
        authorFeedback: {},
      }

      emptyManuscript.submission.$editDate = new Date()
        .toISOString()
        .split('T')[0]

      const manuscript = await Manuscript.query().upsertGraphAndFetch(
        emptyManuscript,
        { relate: true },
      )

      await uploadAndConvertBase64ImagesInManuscript(manuscript)

      const updatedManuscript = await Manuscript.query().updateAndFetchById(
        manuscript.id,
        manuscript,
      )

      // newly uploaded files get tasks populated
      await populateTemplatedTasksForManuscript(manuscript.id)

      // add user to author discussion channel
      await addUserToManuscriptChatChannel({
        manuscriptId: updatedManuscript.id,
        userId: ctx.userId,
      })
      return updatedManuscript
    },

    async importManuscripts(_, { groupId }, ctx) {
      const importsSucceeded = await importManuscripts(groupId, ctx)

      const semanticScholarSucceeded =
        await importManuscriptsFromSemanticScholar(groupId, ctx)

      seekEvent('manuscript-import', { groupId })
      return importsSucceeded && semanticScholarSucceeded
    },

    async archiveManuscripts(_, { ids }, ctx) {
      await Promise.all(ids.map(id => deleteAlertsForManuscript(id)))

      // finding the ids of the first versions of all manuscripts:
      const selectedManuscripts = await Manuscript.query()
        .select('parentId', 'id')
        .whereIn('id', ids)

      const firstVersionIds = selectedManuscripts.map(m => m.parentId || m.id)

      // archiving manuscripts with either firstVersionID or parentID
      const archivedManuscripts = await Manuscript.query()
        .returning('id')
        .update({ isHidden: true })
        .whereIn('id', firstVersionIds)
        .orWhereIn('parentId', firstVersionIds)

      return archivedManuscripts.map(m => m.id)
    },

    async unarchiveManuscripts(_, { ids }, ctx) {
      // finding the ids of the first versions of all manuscripts:
      const selectedManuscripts = await Manuscript.query()
        .select('parentId', 'id')
        .whereIn('id', ids)

      const firstVersionIds = selectedManuscripts.map(m => m.parentId || m.id)

      // unarchiving manuscripts with either firstVersionID or parentID
      const unarchivedManuscripts = await Manuscript.query()
        .returning('id')
        .update({ isHidden: false })
        .whereIn('id', firstVersionIds)
        .orWhereIn('parentId', firstVersionIds)

      return unarchivedManuscripts.map(m => m.id)
    },

    async archiveManuscript(_, { id }, ctx) {
      await deleteAlertsForManuscript(id)
      const manuscript = await Manuscript.findById(id)

      // getting the ID of the firstVersion for all manuscripts.
      const firstVersionId = manuscript.parentId || manuscript.id

      // Archive Manuscript
      const archivedManuscript = await Manuscript.query()
        .returning('id')
        .update({ isHidden: true })
        .where('id', firstVersionId)
        .orWhere('parentId', firstVersionId)

      return archivedManuscript[0].id
    },
    // TODO fix this typo: should be 'author'
    async assignAuthoForProofingManuscript(_, { id }, ctx) {
      const manuscript = await Manuscript.query()
        .findById(id)
        .withGraphFetched('[channels]')

      const { groupId } = manuscript
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

      const updated = await Manuscript.query().patchAndFetchById(
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

      const receiverEmail = author.email
      const receiverName = authorName

      const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/
      const emailValidationResult = emailValidationRegexp.test(receiverEmail)

      if (!emailValidationResult || !receiverName) {
        return updated
      }

      let channelId

      if (manuscript.parentId) {
        const channel = await Manuscript.relatedQuery('channels')
          .for(manuscript.parentId)
          .findOne({ topic: 'Editorial discussion' })

        channelId = channel.id
      } else {
        channelId = manuscript.channels.find(
          channel => channel.topic === 'Editorial discussion',
        ).id
      }

      const messageContent = {
        content: `Author proof assigned Email sent by Kotahi to ${author.username}`,
        channelId,
        userId: ctx.userId,
      }

      seekEvent('author-proofing-assign', {
        manuscript: updated,
        context: { recipient: receiverEmail, messageContent },
        groupId,
      })
      return updated
    },
    async deleteManuscripts(_, { ids }, ctx) {
      if (ids.length > 0) {
        await Promise.all(
          ids.map(toDeleteItem => Manuscript.query().deleteById(toDeleteItem)),
        )
      }

      return ids
    },

    async deleteManuscript(_, { id }, ctx) {
      const toDeleteList = []
      const manuscript = await Manuscript.findById(id)

      const activeConfig = await Config.getCached(manuscript.groupId)

      toDeleteList.push(manuscript.id)

      if (manuscript.parentId) {
        const parentManuscripts = await Manuscript.query().where({
          parent_id: manuscript.parentId,
        })

        parentManuscripts.forEach(ms => {
          toDeleteList.push(ms.id)
        })
      }

      // Delete all versions of manuscript
      await Promise.all(
        toDeleteList.map(async toDeleteItem => {
          if (activeConfig.formData.publishing.hypothesis.apiKey) {
            const hypothesisArtifacts = PublishedArtifact.query().where({
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

          Manuscript.query().deleteById(toDeleteItem)
        }),
      )

      return id
    },

    // TODO Rename to something like 'setReviewerResponse'
    async reviewerResponse(_, { action, teamId }, ctx) {
      if (action !== 'accepted' && action !== 'rejected')
        throw new Error(
          `Invalid action (reviewerResponse): Must be either "accepted" or "rejected"`,
        )

      const team = await Team.query()
        .findById(teamId)
        .withGraphFetched('members')

      if (!team) throw new Error('No team was found')

      await Promise.all(
        team.members.map(async member => {
          if (member.userId === ctx.userId && member.status !== 'completed') {
            await TeamMember.query().patchAndFetchById(member.id, {
              status: action,
            })
          }
        }),
      )

      if (action === 'accepted') {
        await addUserToManuscriptChatChannel({
          manuscriptId: team.objectId,
          userId: ctx.userId,
          type: 'editorial',
        })
      }

      const existingReview = await ReviewModel.query().where({
        manuscriptId: team.objectId,
        userId: team.role === 'collaborativeReviewer' ? null : ctx.userId,
        isDecision: false,
      })

      // modify it to check if there exists a review already
      if (action === 'accepted' && existingReview.length === 0) {
        const review = {
          isDecision: false,
          isHiddenReviewerName: true,
          isHiddenFromAuthor: true,
          userId: team.role === 'collaborativeReviewer' ? null : ctx.userId,
          manuscriptId: team.objectId,
          isCollaborative: team.role === 'collaborativeReviewer',
          jsonData: '{}',
        }

        await ReviewModel.query().insert(review)
      }

      const manuscript = await Manuscript.query()
        .findById(team.objectId)
        .withGraphFetched(
          '[teams.[members.[user.[defaultIdentity]]], submitter.[defaultIdentity], channels]',
        )

      const editorialChannel = manuscript?.channels.find(
        channel => channel.topic === 'Editorial discussion',
      )

      const messageContent = {
        content: `Review Rejection Email sent by Kotahi to {{ receiverName }}`,
        channelId: editorialChannel?.id,
        userId: manuscript?.submitterId,
      }

      const eventName =
        team.role === 'collaborativeReviewer'
          ? `collaborative-review-${action}`
          : `review-${action}`

      seekEvent(eventName, {
        manuscript,
        context: {
          userId: ctx.userId,
          reviewAction: action,
          reviewerId: ctx.userId,
          teamId,
          recipient: 'handlingEditor',
          messageContent,
        },
        groupId: manuscript.groupId,
      })

      return team
    },

    async updateManuscript(_, { id, input }, ctx) {
      return commonUpdateManuscript(id, input, ctx)
    },

    async submitAuthorProofingFeedback(_, { id, input }, ctx) {
      let updated = await commonUpdateManuscript(id, input, ctx)

      const manuscript = await Manuscript.query()
        .findById(id)
        .withGraphJoined('[teams.members.user.defaultIdentity, channels]')

      if (updated.status === 'completed') {
        // after submission of feedback adding it to 'previousSubmissions' list
        let previousSubmissions = []

        if (manuscript.authorFeedback.previousSubmissions?.length > 0) {
          previousSubmissions = [
            ...manuscript.authorFeedback.previousSubmissions,
          ]
        }

        const submitter = manuscript.authorFeedback.submitterId
          ? await User.query().findById(manuscript.authorFeedback.submitterId)
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

        updated = await Manuscript.query().patchAndFetchById(manuscript.id, {
          authorFeedback: {
            ...manuscript.authorFeedback,
            previousSubmissions: orderBy(
              previousSubmissions,
              [obj => new Date(obj.submitted)],
              ['desc'],
            ),
          },
        })
      }

      const author = await User.query().findById(ctx.userId)

      const editorTeam = manuscript?.teams?.find(team => {
        return team.role.includes('editor')
      })

      const [editor] = editorTeam?.members ?? []
      let channelId

      if (manuscript.parentId) {
        const channel = await Manuscript.relatedQuery('channels')
          .for(manuscript.parentId)
          .findOne({ topic: 'Editorial discussion' })

        channelId = channel.id
      } else {
        channelId = manuscript.channels.find(
          channel => channel.topic === 'Editorial discussion',
        ).id
      }

      const messageContent = objIf(editor, {
        content: `Author proof completed Email sent by Kotahi to ${editor.user.username}`,
        channelId,
        userId: editor.user.id,
      })

      updated.status === 'completed' &&
        seekEvent('author-proofing-submit-feedback', {
          manuscript,
          author,
          context: { recipient: 'Editor', messageContent },
          groupId: manuscript.groupId,
        })

      return updated
    },

    async createNewVersion(_, { id }) {
      const manuscript = await Manuscript.query().findById(id)

      seekEvent('manuscript-new-version', {
        manuscript,
        groupId: manuscript.groupId,
      })

      return manuscript.createNewVersion()
    },

    async submitManuscript(_, { id, input }, ctx) {
      // Automated email submissionConfirmation on submission
      const manuscript = await Manuscript.query()
        .findById(id)
        .withGraphFetched('[submitter.defaultIdentity, channels]')

      const recipient = await User.query().findById(ctx.userId)

      let channelId

      if (manuscript.parentId) {
        const channel = await Manuscript.relatedQuery('channels')
          .for(manuscript.parentId)
          .findOne({ topic: 'Editorial discussion' })

        channelId = channel.id
      } else {
        channelId = manuscript.channels.find(
          channel => channel.topic === 'Editorial discussion',
        ).id
      }

      const messageContent = {
        content: `Submission Confirmation Email sent by Kotahi to ${manuscript?.submitter?.username}`,
        channelId,
        userId: manuscript?.submitterId,
      }

      seekEvent('manuscript-submit', {
        manuscript,
        context: {
          recipient: recipient?.email,
          messageContent,
          groupId: manuscript.groupId,
        },
      })

      return commonUpdateManuscript(id, input, ctx)
    },

    async makeDecision(_, { id, decision: decisionKey }, ctx) {
      const manuscript = await Manuscript.query()
        .findById(id)
        .withGraphFetched(
          '[submitter.[defaultIdentity], channels, teams.members.user, reviews.user]',
        )

      const activeConfig = await Config.getCached(manuscript.groupId)
      const currentUser = await User.query().findById(ctx.userId)
      const { instanceName } = activeConfig.formData
      const decisionHasChanged = manuscript.decision !== decisionKey
      const isPreprint = ['preprint1', 'preprint2'].includes(instanceName)

      const decisionMap = {
        accept: 'accepted',
        revise: 'revise',
        reject: 'rejected',
      }

      const decision = decisionMap[decisionKey] || (isPreprint && 'evaluated')

      manuscript.decision = decision
      manuscript.status = decision

      if (manuscript.decision && manuscript.submitter) {
        // Automated email evaluationComplete on decision
        const recipientEmail = manuscript.submitter.email

        // Add Email Notification Record in Editorial Discussion Panel
        const channelId = manuscript.channels.find(
          channel => channel.topic === 'Editorial discussion',
        ).id

        const messageContent = {
          content: `Editor Decision sent by Kotahi to {{ recipientName }}`,
          channelId,
          userId: manuscript.submitterId,
        }

        const hasVerdict = manuscript.decision !== 'evaluated'

        const eventName = `decision-form-make-decision${
          hasVerdict ? '-with-verdict' : ''
        }`

        decisionHasChanged &&
          seekEvent(eventName, {
            manuscript,
            decision: decisionKey,
            currentUser: currentUser?.username,
            context: { recipient: recipientEmail, messageContent },
            groupId: manuscript.groupId,
          })
      }

      return Manuscript.query().updateAndFetchById(id, manuscript)
    },

    async addReviewer(
      _,
      { manuscriptId, userId, invitationId, isCollaborative },
    ) {
      const manuscript = await Manuscript.query().findById(manuscriptId)
      const status = invitationId ? 'accepted' : 'invited'

      const team = isCollaborative
        ? {
            role: 'collaborativeReviewer',
            displayName: 'Collaborative Reviewers',
          }
        : { role: 'reviewer', displayName: 'Reviewers' }

      let invitationData

      if (invitationId) {
        invitationData = await Invitation.query().findById(invitationId)
      }

      const existingTeam = await manuscript
        .$relatedQuery('teams')
        .where('role', team.role)
        .first()

      // Add the reviewer to the existing team of reviewers
      if (existingTeam) {
        const reviewerExists =
          (await existingTeam
            .$relatedQuery('users')
            .where('users.id', userId)
            .resultSize()) > 0

        if (!reviewerExists) {
          await TeamMember.query().insert({
            teamId: existingTeam.id,
            status,
            userId,
            isShared: invitationData ? invitationData.isShared : null,
          })
        }

        return existingTeam.$query()
      }

      // Create a new team of reviewers if it doesn't exist

      const newTeam = await Team.query().insert({
        objectId: manuscriptId,
        objectType: 'manuscript',
        role: team.role,
        displayName: team.displayName,
      })

      await TeamMember.query().insert({
        userId,
        teamId: newTeam.id,
        status,
      })

      return newTeam
    },

    async removeReviewer(_, { manuscriptId, userId }) {
      const manuscript = await Manuscript.query().findById(manuscriptId)

      const reviewerTeams = await manuscript
        .$relatedQuery('teams')
        .whereIn('role', ['reviewer', 'collaborativeReviewer'])

      const [deletedTeamMember] = await TeamMember.query()
        .whereIn(
          'teamId',
          reviewerTeams.map(reviewerTeam => reviewerTeam.id),
        )
        .andWhere({
          userId,
        })
        .delete()
        .returning('*')

      await removeUserFromManuscriptChatChannel({
        manuscriptId,
        userId,
        type: 'editorial',
      })

      const reviewerTeam = await Team.query().findOne({
        id: deletedTeamMember.teamId,
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
      const manuscript = await Manuscript.query()
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

      const updated = await Manuscript.query().updateAndFetchById(
        manuscriptId,
        manuscript,
      )

      return updated
    },

    // TODO: useTransaction to handle rollbacks
    async publishManuscript(_, { id }, ctx) {
      const manuscript = await Manuscript.query()
        .findById(id)
        .withGraphFetched('[publishedArtifacts]')

      manuscript.reviews = await manuscript.getReviews('completed')
      const decisions = await manuscript.getDecisions()

      manuscript.reviews = [...manuscript.reviews, ...decisions]

      const containsElifeStyleEvaluations = hasElifeStyleEvaluations(manuscript)

      const activeConfig = await Config.getCached(manuscript.groupId)

      // We will roll back to the following values if all publishing steps fail:
      const prevPublishedDate = manuscript.published
      const prevStatus = manuscript.status

      const newPublishedDate = new Date()
      // We update the manuscript in advance, so that external services such as Flax
      // will be able to retrieve it as a "published" manuscript. If all publishing steps
      // fail, we will revert these changes at the end.
      await Manuscript.query().patchAndFetchById(id, {
        published: newPublishedDate,
        status: 'published',
      })

      const notification = await CoarNotification.query().findOne({
        manuscriptId: manuscript.id,
      })

      const update = { published: newPublishedDate, status: 'published' } // This will also collect any properties we may want to update in the DB
      const steps = []

      if (activeConfig.formData.publishing.crossref?.login) {
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

      if (activeConfig.formData.publishing.datacite?.login) {
        const stepLabel = 'Datacite'
        let succeeded = false
        let errorMessage

        if (
          containsElifeStyleEvaluations ||
          manuscript.status !== 'evaluated'
        ) {
          try {
            await publishToDatacite(manuscript)
            succeeded = true
          } catch (e) {
            console.error('error publishing to datacite')
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

      if (activeConfig.formData.publishing.doaj?.login) {
        const stepLabel = 'DOAJ'
        let succeeded = false
        let errorMessage

        if (
          containsElifeStyleEvaluations ||
          manuscript.status !== 'evaluated'
        ) {
          try {
            await publishToDOAJ(manuscript)
            succeeded = true
          } catch (e) {
            console.error('error publishing to DOAJ')
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

      try {
        if (await sendNotificationToSciety(manuscript))
          steps.push({
            stepLabel: 'COAR Notify review announcement sent to Sciety',
            succeeded: true,
          })
      } catch (err) {
        console.error(err)
        steps.push({
          stepLabel: 'COAR Notify review announcement sent to Sciety',
          succeeded: false,
          errorMessage: err.message,
        })
      }

      let updatedManuscript

      if (steps.some(step => step.succeeded)) {
        updatedManuscript = await Manuscript.query().patchAndFetchById(
          id,
          update,
        )

        const commentsToPublish = []

        updatedManuscript.formFieldsToPublish.forEach(formField => {
          formField.fieldsToPublish.forEach(fieldToPublish => {
            const publishFieldValues = fieldToPublish.split(':')

            if (
              publishFieldValues[0] === 'discussion' &&
              publishFieldValues[1]
            ) {
              commentsToPublish.push(publishFieldValues[1])
            }
          })
        })

        const manuscriptThreadDiscussions =
          await ThreadedDiscussion.query().where({
            manuscriptId: updatedManuscript.parentId || updatedManuscript.id,
          })

        await Promise.all(
          manuscriptThreadDiscussions.map(async threadDiscussion => {
            const unsetThreads = threadDiscussion.threads.map(thread => ({
              ...thread,
              comments: thread.comments.map(comment => ({
                ...comment,
                published: commentsToPublish.includes(comment.id)
                  ? newPublishedDate
                  : undefined,
              })),
            }))

            await ThreadedDiscussion.query().patchAndFetchById(
              threadDiscussion.id,
              { threads: JSON.stringify(unsetThreads) },
            )
          }),
        )
      } else {
        // Revert the changes to published date and status
        updatedManuscript = await Manuscript.query().patchAndFetchById(id, {
          published: prevPublishedDate,
          status: prevStatus,
        })
      }

      seekEvent('manuscript-publish', {
        manuscript: updatedManuscript,
        groupId: ctx.req.headers['group-id'],
      })

      return { manuscript: updatedManuscript, steps }
    },
  },
  Subscription: {
    manuscriptsImportStatus: {
      subscribe: async (_, vars, context) => {
        return subscriptionManager.asyncIterator(['IMPORT_MANUSCRIPTS_STATUS'])
      },
    },
  },
  Query: {
    async manuscript(_, { id }, ctx) {
      const manuscript = await Manuscript.query().findById(id)

      const submission =
        typeof manuscript.submission === 'string'
          ? JSON.parse(manuscript.submission)
          : manuscript.submission

      // Intermittent solution - optimzed way would be to use as scheduler based on embargo date
      if (
        submission?.$embargoDate &&
        submission?.$embargoDate?.length &&
        manuscript.status === 'underEmbargo'
      ) {
        const embargoTimestamp = new Date(submission?.$embargoDate).getTime()

        const currentTimestamp = Date.now()

        if (
          !Number.isNaN(embargoTimestamp) &&
          embargoTimestamp <= currentTimestamp
        ) {
          const updatedManuscript = await Manuscript.query().patchAndFetchById(
            id,
            {
              status: 'embargoReleased',
            },
          )

          return updatedManuscript
        }
      }

      return manuscript
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
        await Manuscript.getFirstVersionIdsOfManuscriptsUserHasARoleIn(
          ctx.userId,
          groupId,
        )

      // Get those top-level manuscripts with all versions, all with teams and members
      const allManuscriptsWithInfo = []

      // eslint-disable-next-line no-restricted-syntax
      for (const someIds of chunk(firstVersionIds, 20)) {
        // eslint-disable-next-line no-await-in-loop
        const someManuscriptsWithInfo = await Manuscript.query()
          .withGraphFetched(
            '[teams.members, tasks, invitations, manuscriptVersions(orderByCreatedDesc).[teams.members, tasks, invitations]]',
          )
          .whereIn('id', someIds)
          .orderBy('created', 'desc')

        allManuscriptsWithInfo.push(
          ...someManuscriptsWithInfo.map(m => ({
            ...m,
            invitations: uniqBy(
              m.invitations.sort(
                (a, b) => new Date(b.responseDate) - new Date(a.responseDate),
              ),
              'toEmail',
            ),
          })),
        )
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
                    member.userId === ctx.userId &&
                    (!reviewerStatus || member.status === reviewerStatus),
                )
              )
                rolesFound.add(t.role)
            }),
        )

        if (rolesFound.size) {
          // eslint-disable-next-line no-param-reassign
          latestVersion.hasOverdueTasksForUser =
            manuscriptHasOverdueTasksForUser(latestVersion, ctx.userId)
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

      const knex = Manuscript.knex()
      const rawQResult = await knex.raw(rawQuery, rawParams)
      let totalCount = 0

      const resultRows =
        Object.keys(userManuscriptsWithInfo).length > 0 ? rawQResult.rows : []

      if (resultRows.length) {
        totalCount = parseInt(resultRows[0].full_count, 10)
      }

      // Add in searchRank and searchSnippet
      const result = resultRows.map(row => ({
        ...userManuscriptsWithInfo[row.id],
        searchRank: row.rank,
        searchSnippet: row.snippet,
      }))

      return { totalCount, manuscripts: result }
    },
    async manuscripts(_, { where }, ctx) {
      return Manuscript.query()
        .where({ parentId: null })
        .whereNot({ isHidden: true })
        .orderBy('created', 'desc')
    },
    async publishedManuscripts(_, { sort, offset, limit, groupId }, ctx) {
      const query = Manuscript.query()
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

      const knex = Manuscript.knex()
      const rawQResult = await knex.raw(rawQuery, rawParams)
      let totalCount = 0
      if (rawQResult.rowCount)
        totalCount = parseInt(rawQResult.rows[0].full_count, 10)

      const ids = rawQResult.rows.map(row => row.id)
      const manuscripts = await Manuscript.query().findByIds(ids)

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
      const groups = await Group.query().where({ isArchived: false })
      let group = null
      const groupIdFromHeader = ctx.req.headers['group-id']

      if (groupIdFromHeader)
        group = groups.find(g => g.id === groupIdFromHeader)
      else if (groupName) group = groups.find(g => g.name === groupName)
      else if (groups.length === 1) [group] = groups

      if (!group) throw new Error(`Group with name '${groupName}' not found`)

      const subQuery = Manuscript.query()
        .select('short_id')
        .max('created as latest_created')
        .where('group_id', group.id)
        .groupBy('short_id')

      const query = Manuscript.query()
        .select('m.*', raw('count(*) over () as totalCount'))
        .from(Manuscript.query().as('m'))
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
      return Manuscript.query().findById(id).whereNotNull('published')
    },
    async unreviewedPreprints(_, { token, groupName = null }, ctx) {
      const groups = await Group.query().where({ isArchived: false })
      let group = null
      if (groupName) group = groups.find(g => g.name === groupName)
      else if (groups.length === 1) [group] = groups
      if (!group) throw new Error(`Group with name '${groupName}' not found`)

      const activeConfig = await Config.getCached(group.id)

      if (activeConfig.formData.integrations.kotahiApis.tokens) {
        validateApiToken(
          token,
          activeConfig.formData.integrations.kotahiApis.tokens,
        )
      } else {
        throw new Error('Kotahi api tokens are not configured!')
      }

      const manuscripts = await Manuscript.query()
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
      const manuscript = await Manuscript.query()
        .findById(id)
        .withGraphJoined('reviews')

      const activeConfig = await Config.getCached(manuscript.groupId)

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
      const activeConfig = await Config.getCached(groupId)

      const doi = getDoi(suffix, activeConfig)
      return { isDOIValid: await doiIsAvailable(doi) }
    },

    async getManuscriptsData(_, { selectedManuscripts }, ctx) {
      const manuscripts = await Manuscript.query()
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
        await Manuscript.query().findById(manuscriptId)
      ).getManuscriptVersions()

      const versionIds = [manuscriptId, ...otherVersions.map(v => v.id)]

      const assignments = await User.relatedQuery('teams')
        .for(ctx.userId)
        .select('objectId')
        .whereIn('role', ['reviewer', 'collaborativeReviewer'])
        .whereIn('objectId', versionIds)

      return [...new Set(assignments.map(a => a.objectId))]
    },
  },
  Manuscript: {
    ...manuscriptAndPublishedManuscriptSharedResolvers,
    async channels(parent) {
      return (
        parent.channels ||
        Manuscript.relatedQuery('channels').for(
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
        Manuscript.relatedQuery('invitations').for(parent.id)
      )
    },
    async tasks(parent) {
      return (
        parent.tasks ||
        Manuscript.relatedQuery('tasks').for(parent.id).orderBy('sequenceIndex')
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

      const record = await Manuscript.query().findById(id).select('created')

      return record.created
    },
    async authorFeedback(parent) {
      if (parent.authorFeedback && parent.authorFeedback.submitterId) {
        const submitter = await User.query().findById(
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
        parent.files || (await Manuscript.relatedQuery('files').for(parent.id))
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
        parent.files || (await Manuscript.relatedQuery('files').for(parent.id))
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
      let reviews = await getRelatedReviews(parent, ctx, true)

      if (!Array.isArray(reviews)) {
        return []
      }

      reviews = reviews.filter(review => !review.isDecision)
      const reviewForm = await getReviewForm(parent.groupId)

      const threadedDiscussions =
        parent.threadedDiscussions ||
        (await getThreadedDiscussionsForManuscript(parent, getUsersById))

      // eslint-disable-next-line no-restricted-syntax
      for (const review of reviews) {
        const jsonData = JSON.parse(review.jsonData)

        if (review.isCollaborative) {
          const collaborativeFormData =
            // eslint-disable-next-line no-await-in-loop
            await CollaborativeDoc.getFormData(review.id, reviewForm)

          review.jsonData = JSON.stringify({
            ...jsonData,
            ...collaborativeFormData,
          })
        }
      }

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
      const teams = await Team.query()
        .where({ objectId: parent.id })
        .whereIn('role', ['seniorEditor', 'handlingEditor', 'editor'])

      const teamMembers = await TeamMember.query().whereIn(
        'team_id',
        teams.map(t => t.id),
      )

      const editorAndRoles = await Promise.all(
        teamMembers.map(async member => {
          const user = await User.query().findById(member.userId)
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
        (await Manuscript.relatedQuery('files').for(parent.manuscriptId))

      files = await getFilesWithUrl(files)
      // TODO Any reason not to use replaceImageSrcResponsive here?
      return replaceImageSrc(parent.source, files, 'medium')
    },
    async comments(parent) {
      return JSON.stringify(parent.comments)
    },
  },
  PublishedReview: {
    async users(parent) {
      if (parent.isHiddenReviewerName) {
        return [{ id: '', username: 'Anonymous User' }]
      }

      let users = []

      if (parent.isCollaborative) {
        const manuscript = await Manuscript.query().findById(
          parent.manuscriptId,
        )

        const existingTeam = await manuscript
          .$relatedQuery('teams')
          .where('role', 'collaborativeReviewer')
          .first()

        users = await existingTeam.$relatedQuery('users')
      } else {
        users = await User.query().where({ id: parent.userId })
      }

      users = await Promise.all(
        users.map(async user => {
          const defaultIdentity = await cachedGet(
            `defaultIdentityOfUser:${user.id}`,
          )

          return { defaultIdentity, ...user }
        }),
      )

      return users
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
    addReviewer(manuscriptId: ID!, userId: ID!, invitationId: ID, isCollaborative: Boolean!): Team
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
    isCollaborative: Boolean!
    isLock: Boolean!
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
    comments: String
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

  type PreviousVersionUser {
    userName: String!
    id: ID!
  }

  type PreviousVersion {
    source: String
    title: String
    user: PreviousVersionUser!
    created: DateTime!
  }

  type ManuscriptMeta {
    title: String
    source: String
    comments: String
    abstract: String
    subjects: [String]
    history: [MetaDate]
    manuscriptId: ID
    previousVersions: [PreviousVersion]
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
    users: [ReviewUser!]!
    isHiddenFromAuthor: Boolean
    isCollaborative: Boolean
    isLock: Boolean
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
    defaultIdentity: ReviewIdentity
  }

  type ReviewIdentity {
    id: ID
    name: String
    aff: String # JATS <aff>
    email: String # JATS <aff>
    type: String
    identifier: String
  }
`

module.exports = {
  typeDefs,
  resolvers,
}
