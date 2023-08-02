/* eslint-disable prefer-destructuring */
const { ref } = require('objection')
const axios = require('axios')
const { map } = require('lodash')
const config = require('config')
const { pubsubManager, File } = require('@coko/server')
const models = require('@pubsweet/models')
const cheerio = require('cheerio')
const { raw } = require('objection')
const { importManuscripts } = require('./importManuscripts')
const { manuscriptHasOverdueTasksForUser } = require('./manuscriptCommsUtils')

const {
  publishToCrossref,
  getReviewOrSubmissionField,
  getDoi,
  doiIsAvailable,
  doiExists,
} = require('../../publishing/crossref')

const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')

const {
  hasEvaluations,
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

const sendEmailNotification = require('../../email-notifications')
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
} = require('../../model-user/src/userCommsUtils')

const {
  addUserToManuscriptChatChannel,
  removeUserFromManuscriptChatChannel,
} = require('../../model-channel/src/channelCommsUtils')

const { getPubsub } = pubsubManager

/** TODO remove oldMetaAbstract param once bug 1193 is diagnosed/fixed */
const updateAndRepackageForGraphql = async (ms, oldMetaAbstract) => {
  if (oldMetaAbstract && ms.meta && !ms.meta.abstract)
    throw new Error(
      `Deleting meta.abstract in manuscript ${
        ms.id
      }, replacing value ${oldMetaAbstract} with ${typeof ms.meta
        .abstract}, is illegal!`,
    )

  return models.Manuscript.query().updateAndFetchById(ms.id, ms)
}

const getCss = async () => {
  const css = await generateCss()
  return css
}

/** Get reviews from the manuscript if present, or from DB. Generate full file info for
 * all files attached to reviews, and stringify JSON data in preparation for serving to client.
 * Note: 'reviews' include the decision object.
 */
const getRelatedReviews = async (
  manuscript,
  ctx,
  forceRemovalOfConfidentialData,
) => {
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

  if (
    forceRemovalOfConfidentialData ||
    (!userRoles.admin && !userRoles.anyEditor)
  ) {
    reviews = stripConfidentialDataFromReviews(
      reviews,
      reviewForm,
      decisionForm,
      sharedReviewersIds,
      manuscriptHasDecision,
      ctx.user,
      userRoles,
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
      (await (
        await models.Manuscript.query().findById(parent.id)
      ).$relatedQuery('files'))
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

  const activeConfig = await models.Config.query().findOne({
    groupId: ms.groupId,
    active: true,
  })

  /** Crude hack to circumvent and help diagnose bug 1193 */
  const oldMetaAbstract = ms && ms.meta ? ms.meta.abstract : null

  // If this manuscript is getting its label set for the first time,
  // we will populate its task list from the template tasks
  const isSettingFirstLabels = ['colab'].includes(
    activeConfig.formData.instanceName,
  )
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

  if (['ncrc', 'colab'].includes(activeConfig.formData.instanceName)) {
    updatedMs.submission.editDate = new Date().toISOString().split('T')[0]
  }

  if (isSettingFirstLabels && !updatedMs.tasks.length)
    await populateTemplatedTasksForManuscript(id)

  await uploadAndConvertBase64ImagesInManuscript(updatedMs)
  return updateAndRepackageForGraphql(updatedMs, oldMetaAbstract)
}

/** Send the manuscriptId OR a configured ref; and send token if one is configured */
const tryPublishingWebhook = async manuscriptId => {
  const manuscript = await models.Manuscript.query().findById(manuscriptId)

  const activeConfig = await models.Config.query().findOne({
    groupId: manuscript.groupId,
    active: true,
  })

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

const resolvers = {
  Mutation: {
    async createManuscript(_, vars, ctx) {
      const { meta, files, groupId } = vars.input
      const group = await models.Group.query().findById(groupId)

      const submissionForm = await getSubmissionForm(group.id)

      const activeConfig = await models.Config.query().findOne({
        groupId: group.id,
        active: true,
      })

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
      }

      if (['ncrc', 'colab'].includes(activeConfig.formData.instanceName)) {
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
            // uploadedImagesWithUrl[index].name comes in as something like Image4.png
            // First, get the number so we can identify the image in the DOM

            const imageNumber = uploadedImagesWithUrl[index].name.match(
              /\d+/,
            )[0]

            // We are looking for the image with data-original-name in the form "Picture 4"

            const elem = $(`img[data-original-name="Picture ${imageNumber}"]`)

            // elem.length will be 0 if there is an image without a corresponding file

            if (elem.length) {
              const $elem = $(elem)
              $elem.attr('data-fileid', uploadedImagesWithUrl[index].id)
              $elem.attr('alt', uploadedImagesWithUrl[index].name)
              $elem.attr(
                'src',
                uploadedImagesWithUrl[index].storedObjects.find(
                  storedObject => storedObject.type === 'medium',
                ).url,
              )
            }
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

      // add user to author discussion channel
      await addUserToManuscriptChatChannel({
        manuscriptId: updatedManuscript.id,
        userId: ctx.user,
      })
      return updatedManuscript
    },

    async importManuscripts(_, { groupId }, ctx) {
      return importManuscripts(groupId, ctx)
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

      const activeConfig = await models.Config.query().findOne({
        groupId: manuscript.groupId,
        active: true,
      })

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
    async reviewerResponse(_, { action, teamId }, context) {
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
        if (team.members[i].userId === context.user)
          team.members[i].status = action
      }

      await new models.Team(team).saveGraph()

      const existingReview = await ReviewModel.query().where({
        manuscriptId: team.objectId,
        userId: context.user,
        isDecision: false,
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

        const activeConfig = await models.Config.query().findOne({
          groupId: manuscript.groupId,
          active: true,
        })

        const selectedTemplate =
          activeConfig.formData.eventNotification.reviewRejectedEmailTemplate

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

        if (config['notification-email'].use_colab === 'true') {
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

        const selectedEmailTemplate = await models.EmailTemplate.query().findById(
          selectedTemplate,
        )

        try {
          await sendEmailNotification(
            receiverEmail,
            selectedEmailTemplate,
            data,
            manuscript.groupId,
          )

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
      }

      return team
    },
    async updateManuscript(_, { id, input }, ctx) {
      return commonUpdateManuscript(id, input, ctx)
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
          .withGraphFetched('[submitter.[defaultIdentity], channels]')

        const activeConfig = await models.Config.query().findOne({
          groupId: manuscript.groupId,
          active: true,
        })

        const receiverEmail = manuscript.submitter.email
        /* eslint-disable-next-line */
        const receiverName =
          manuscript.submitter.username ||
          manuscript.submitter.defaultIdentity.name ||
          ''

        const selectedTemplate =
          activeConfig.formData.eventNotification
            .submissionConfirmationEmailTemplate

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

        const selectedEmailTemplate = await models.EmailTemplate.query().findById(
          selectedTemplate,
        )

        try {
          await sendEmailNotification(
            receiverEmail,
            selectedEmailTemplate,
            data,
            manuscript.groupId,
          )

          // Get channel ID
          const channelId = manuscript.channels.find(
            channel => channel.topic === 'Editorial discussion',
          ).id

          models.Message.createMessage({
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

      const activeConfig = await models.Config.query().findOne({
        groupId: manuscript.groupId,
        active: true,
      })

      /** Crude hack to circumvent and help diagnose bug 1193 */
      const oldMetaAbstract =
        manuscript && manuscript.meta ? manuscript.meta.abstract : null

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
          if (
            ['colab', 'aperture'].includes(activeConfig.formData.instanceName)
          ) {
            manuscript.decision = 'accepted'
            manuscript.status = 'accepted'
          } else if (
            ['elife', 'ncrc'].includes(activeConfig.formData.instanceName)
          ) {
            manuscript.decision = 'evaluated'
            manuscript.status = 'evaluated'
          } else {
            throw new Error(
              `Unknown decision type "${decisionString}" received.`,
            )
          }
      }

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

        const selectedTemplate =
          activeConfig.formData.eventNotification
            .evaluationCompleteEmailTemplate

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

            models.Message.createMessage({
              content: body,
              channelId,
              userId: manuscript.submitterId,
            })

            const selectedEmailTemplate = await models.EmailTemplate.query().findById(
              selectedTemplate,
            )

            await sendEmailNotification(
              receiverEmail,
              selectedEmailTemplate,
              data,
              manuscript.groupId,
            )
          } catch (e) {
            /* eslint-disable-next-line */
            console.log('email was not sent', e)
          }
        }
      }

      return updateAndRepackageForGraphql(manuscript, oldMetaAbstract)
    },
    async addReviewer(_, { manuscriptId, userId, invitationId }, ctx) {
      const manuscript = await models.Manuscript.query().findById(manuscriptId)
      const status = invitationId ? 'accepted' : 'invited'

      let invitationData

      if (invitationId) {
        invitationData = await models.Invitation.query().findById(invitationId)
      }

      await addUserToManuscriptChatChannel({
        manuscriptId: manuscript.parentId || manuscriptId,
        userId,
        type: 'editorial',
      })

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

        return existingTeam.$query().withGraphFetched('members.[user]')
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

      return updated
    },
    async publishManuscript(_, { id }, ctx) {
      const manuscript = await models.Manuscript.query()
        .findById(id)
        .withGraphFetched('[reviews, publishedArtifacts]')

      const activeConfig = await models.Config.query().findOne({
        groupId: manuscript.groupId,
        active: true,
      })

      /** Crude hack to circumvent and help diagnose bug 1193 */
      const oldMetaAbstract =
        manuscript && manuscript.meta ? manuscript.meta.abstract : null

      const update = {} // This will collect any properties we may want to update in the DB
      const steps = []
      const containsEvaluations = hasEvaluations(manuscript)

      if (activeConfig.formData.publishing.crossref.login) {
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

      if (process.env.GOOGLE_SPREADSHEET_ID) {
        const stepLabel = 'Google Spreadsheet'
        let succeeded = false
        let errorMessage

        try {
          await publishToGoogleSpreadSheet(manuscript)
          update.submission = {
            ...manuscript.submission,
            editDate: new Date().toISOString().split('T')[0],
          }
          succeeded = true
        } catch (e) {
          console.error('error while publishing to google spreadsheet')
          console.error(e)
          errorMessage = e.message
        }

        steps.push({ succeeded, errorMessage, stepLabel })
      } else if (['colab'].includes(activeConfig.formData.instanceName)) {
        // TODO: A note in the code said that for Colab instance, submission.editDate should be updated. Is this true? (See commonUpdateManuscript() for example code.)
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
        update.published = new Date()

        // A 'published' article without evaluations will become 'evaluated'.
        // The intention is that an evaluated article should never revert to any state prior to "evaluated",
        // but that only articles with evaluations can be 'published'.
        update.status =
          !activeConfig.formData.publishing.crossref.login ||
          containsEvaluations
            ? 'published'
            : 'evaluated'
      }

      // TODO remove this check once bug 1193 is diagnosed/fixed
      if (oldMetaAbstract && update.meta && !update.meta.abstract)
        throw new Error(
          `Deleting meta.abstract from manuscript ${id}, replacing ${oldMetaAbstract} with ${typeof update
            .meta.abstract}, is illegal!`,
        )

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
      return models.Manuscript.query().findById(id)
    },
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
      },
      ctx,
    ) {
      const submissionForm = await getSubmissionForm(groupId)

      // Get IDs of the top-level manuscripts
      // TODO move this query to the model
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
        .where('group_id', groupId)

      // Get those top-level manuscripts with all versions, all with teams and members
      const allManuscriptsWithInfo = await models.Manuscript.query()
        .withGraphFetched(
          '[teams.members, tasks, invitations, manuscriptVersions(orderByCreatedDesc).[teams.members, tasks, invitations]]',
        )
        .whereIn(
          'id',
          topLevelManuscripts.map(m => m.topLevelId),
        )
        .orderBy('created', 'desc')

      // Get the latest version of each manuscript, and check the users role in that version
      const userManuscriptsWithInfo = {}

      allManuscriptsWithInfo.forEach(m => {
        const latestVersion =
          m.manuscriptVersions && m.manuscriptVersions.length > 0
            ? m.manuscriptVersions[0]
            : m

        if (
          latestVersion.teams.some(t =>
            t.members.some(member => {
              return (
                member.userId === ctx.user &&
                wantedRoles.includes(t.role) &&
                (!reviewerStatus || member.status === reviewerStatus)
              )
            }),
          )
        ) {
          // eslint-disable-next-line no-param-reassign
          latestVersion.hasOverdueTasksForUser = manuscriptHasOverdueTasksForUser(
            latestVersion,
            ctx.user,
          )

          userManuscriptsWithInfo[m.id] = m
        }
      })

      // Apply filters to the manuscripts, limiting results to those the user has a role in
      // TODO This should move into the model, as all raw DB interactions should be controlled there
      const [rawQuery, rawParams] = buildQueryForManuscriptSearchFilterAndOrder(
        sort,
        offset,
        limit,
        filters,
        submissionForm,
        timezoneOffsetMinutes || 0,
        Object.keys(userManuscriptsWithInfo),
        groupId,
      )

      const knex = models.Manuscript.knex()
      const rawQResult = await knex.raw(rawQuery, rawParams)
      let totalCount = 0
      if (rawQResult.rowCount)
        totalCount = parseInt(rawQResult.rows[0].full_count, 10)

      // Add in searchRank and searchSnippet
      const result = rawQResult.rows.map(row => ({
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
      { sort, offset, limit, filters, timezoneOffsetMinutes, groupId },
      ctx,
    ) {
      const submissionForm = await getSubmissionForm(groupId)

      // TODO Move this to the model, as only the model should interact with DB directly
      const [rawQuery, rawParams] = buildQueryForManuscriptSearchFilterAndOrder(
        sort,
        offset,
        limit,
        filters,
        submissionForm,
        timezoneOffsetMinutes || 0,
        null,
        groupId,
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

    async manuscriptsPublishedSinceDate(_, { startDate, limit }, ctx) {
      const groupId = ctx.req.headers['group-id']

      const query = models.Manuscript.query()
        .whereNotNull('published')
        .orderBy('published')

      if (groupId) query.where('group_id', groupId)
      if (startDate) query.where('published', '>=', new Date(startDate))
      if (limit) query.limit(limit)

      return query
    },
    async publishedManuscript(_, { id }, ctx) {
      return models.Manuscript.query().findById(id).whereNotNull('published')
    },
    async unreviewedPreprints(_, { token, groupName }, ctx) {
      const group = await models.Group.query().findOne({
        name: groupName,
        isArchived: false,
      })

      if (!group)
        throw new Error('Group does not exist or it has been archived!')

      const activeConfig = await models.Config.query().findOne({
        groupId: group.id,
        active: true,
      })

      if (activeConfig.formData.user.kotahiApiTokens) {
        validateApiToken(token, activeConfig.formData.user.kotahiApiTokens)
      } else {
        throw new Error('Kotahi api tokens are not configured!')
      }

      const manuscripts = await models.Manuscript.query()
        .where({ status: 'new', groupId: group.id })
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
      const manuscript = await models.Manuscript.query()
        .findById(id)
        .withGraphFetched('reviews')

      const activeConfig = await models.Config.query().findOne({
        groupId: manuscript.groupId,
        active: true,
      })

      if (!activeConfig.formData.publishing.crossref.login) {
        return null
      }

      const DOIs = []

      if (
        activeConfig.formData.publishing.crossref.publicationType === 'article'
      ) {
        const manuscriptDOI = getDoi(
          getReviewOrSubmissionField(manuscript, 'doiSuffix') || manuscript.id,
          activeConfig,
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
              activeConfig,
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
            activeConfig,
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
    async validateSuffix(_, { suffix, groupId }, ctx) {
      const activeConfig = await models.Config.query().findOne({
        groupId,
        active: true,
      })

      const doi = getDoi(suffix, activeConfig)
      return { isDOIValid: await doiIsAvailable(doi) }
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
    async reviews(parent, { forceRemovalOfConfidentialData }, ctx) {
      return getRelatedReviews(parent, ctx, forceRemovalOfConfidentialData)
    },
    async teams(parent, _, ctx) {
      return (
        parent.teams || models.Manuscript.relatedQuery('teams').for(parent.id)
      )
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
      const manuscript = await models.Manuscript.query().findById(parent.id)
      return manuscript.getManuscriptVersions()
    },
    async submitter(parent) {
      return (
        parent.submitter ||
        models.Manuscript.relatedQuery('submitter').for(parent.id).first()
      )
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
}

const typeDefs = `
  extend type Query {
    globalTeams: [Team]
    manuscript(id: ID!): Manuscript!
    manuscripts: [Manuscript]!
    paginatedManuscripts(offset: Int, limit: Int, sort: ManuscriptsSort, filters: [ManuscriptsFilter!]!, timezoneOffsetMinutes: Int, groupId: ID!): PaginatedManuscripts
    manuscriptsUserHasCurrentRoleIn(reviewerStatus: String, wantedRoles: [String]!, offset: Int, limit: Int, sort: ManuscriptsSort, filters: [ManuscriptsFilter!]!, timezoneOffsetMinutes: Int, groupId: ID!): PaginatedManuscripts
    publishedManuscripts(sort:String, offset: Int, limit: Int, groupId: ID!): PaginatedManuscripts
    validateDOI(articleURL: String): validateDOIResponse
    validateSuffix(suffix: String, groupId: ID!): validateDOIResponse

    """ Get published manuscripts with irrelevant fields stripped out. Optionally, you can specify a startDate and/or limit. """
    manuscriptsPublishedSinceDate(startDate: DateTime, limit: Int): [PublishedManuscript]!
    """ Get a published manuscript by ID, or null if this manuscript is not published or not found """
    publishedManuscript(id: ID!): PublishedManuscript
    unreviewedPreprints(token: String!, groupName: String!): [Preprint]
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
    importManuscripts(groupId: ID!): Boolean!
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
    reviews(forceRemovalOfConfidentialData: Boolean): [Review]
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
  }

  input ManuscriptInput {
    files: [FileInput]
    meta: ManuscriptMetaInput
    submission: String
    groupId: ID!
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
