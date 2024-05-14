import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import { useTranslation } from 'react-i18next'
import { v4 as uuid } from 'uuid'
import { set } from 'lodash'
import { gql } from '@apollo/client'
import ReadonlyFormTemplate from '../metadata/ReadonlyFormTemplate'
import Review from './Review'
import EditorSection from '../decision/EditorSection'
import {
  Columns,
  Manuscript,
  Chat,
  SectionContent,
  HiddenTabs,
  ErrorBoundary,
  VersionSwitcher,
} from '../../../../shared'
import { ChatButton, CollapseButton } from '../style'
import MessageContainer from '../../../../component-chat/src/MessageContainer'
import SharedReviewerGroupReviews from './SharedReviewerGroupReviews'
import FormTemplate from '../../../../component-submit/src/components/FormTemplate'
import { ConfigContext } from '../../../../config/src'

const ReviewLayout = ({
  currentUser,
  versions,
  reviewForm,
  onSubmit,
  // isValid,
  channels,
  uploadFile,
  channelId,
  submissionForm,
  createFile,
  deleteFile,
  manuscript,
  validateDoi,
  validateSuffix,
  decisionForm,
  threadedDiscussionProps,
  chatProps,
  updateReviewMutation,
  history,
  updateReviewerStatus,
  versionsOfManuscriptCurrentUserIsReviewerOf,
  chatExpand,
}) => {
  const config = useContext(ConfigContext) || {}
  const { urlFrag } = config
  const priorVersions = versions.slice(1)
  priorVersions.reverse() // Convert to chronological order (was reverse-chron)

  const { t } = useTranslation()

  const channelData = chatProps?.channelsData?.find(
    channel => channel?.channelId === channelId,
  )

  const createMetaDataSection = latestManuscript => {
    return (
      <div key={latestManuscript.id}>
        <ReadonlyFormTemplate
          form={submissionForm}
          formData={latestManuscript}
          manuscript={latestManuscript}
          showEditorOnlyFields={false}
          threadedDiscussionProps={threadedDiscussionProps}
        />
      </div>
    )
  }

  const createEditorSection = latestManuscript => {
    return (
      <div key={latestManuscript.id}>
        <EditorSection
          currentUser={currentUser}
          manuscript={latestManuscript}
          readonly
        />
      </div>
    )
  }

  const createReviewsSection = latestManuscript => {
    const sharedReviewsData = latestManuscript.reviews.filter(
      r =>
        r.isSharedWithCurrentUser &&
        r.user?.id !== currentUser.id &&
        !r.isDecision,
    )

    const reviewForCurrentUserData = latestManuscript.reviews?.find(
      r => r.user?.id === currentUser.id && !r.isDecision,
    )

    const reviewData = reviewForCurrentUserData
      ? JSON.parse(reviewForCurrentUserData?.jsonData)
      : {}

    const reviewersTeam = latestManuscript.teams.find(
      team => team.role === 'reviewer',
    ) || { members: [] }

    const reviewerStatus = reviewersTeam.members.find(
      member => member.user.id === currentUser?.id,
    )?.status

    const existingReview = latestManuscript.reviews?.find(
      review => review.user?.id === currentUser.id && !review.isDecision,
    ) || {
      id: uuid(),
      isDecision: false,
      isHiddenReviewerName: true,
      jsonData: {},
      manuscriptId: latestManuscript?.id,
      userId: currentUser.id,
    }

    const updateReviewJsonData = (manuscriptId, review, value, path) => {
      const delta = {} // Only the changed fields
      // E.g. if path is 'foo.bar' and value is 'Baz' this gives { foo: { bar: 'Baz' } }
      //   set(delta, path, value)
      set(delta, path, value)

      const reviewPayload = {
        jsonData: JSON.stringify(delta),
        // TODO The following fields ought to be left out. They are needed only
        // because we are currently catering for unexplained scenarios where there
        // is no pre-existing review object by the time we arrive at this page.
        // Thus we are potentially adding a new entry to the DB and need to supply
        // the relevant values.
        // We should instead ensure that a review object is always created prior to
        // the reviewer visiting this page, then we don't need this.
        isDecision: false,
        manuscriptId,
        userId: review.userId,
        isHiddenReviewerName: review.isHiddenReviewerName,
        isHiddenFromAuthor: review.isHiddenFromAuthor,
      }

      return updateReviewMutation({
        variables: { id: review.id, input: reviewPayload },
        update: (cache, { data: { updateReview: updateReviewTemp } }) => {
          cache.modify({
            id: cache.identify(latestManuscript.id),
            fields: {
              /* eslint-disable-next-line default-param-last */
              reviews(existingReviewRefs = [], { readField }) {
                const newReviewRef = cache.writeFragment({
                  data: updateReviewTemp,
                  fragment: gql`
                    fragment NewReview on Review {
                      id
                    }
                  `,
                })

                if (
                  existingReviewRefs.some(
                    ref => readField('id', ref) === updateReviewTemp.id,
                  )
                ) {
                  return existingReviewRefs
                }

                return [...existingReviewRefs, newReviewRef]
              },
            },
          })
        },
      })
    }

    const handleSubmit = async () => {
      await updateReviewerStatus({
        variables: {
          status: 'completed',
          manuscriptId: latestManuscript.id,
        },
      })

      history.push(`${urlFrag}/dashboard`)
    }

    const isLatestVersion = latestManuscript.id === versions[0].manuscript.id

    return (
      <div key={latestManuscript.id}>
        {reviewerStatus === 'completed' || !isLatestVersion ? (
          <Review
            isOldUnsubmitted={reviewerStatus !== 'completed'}
            isReview
            review={existingReview}
            reviewForm={reviewForm}
            sharedReviews={sharedReviewsData}
            threadedDiscussionProps={threadedDiscussionProps}
          />
        ) : (
          <SectionContent>
            <FormTemplate
              createFile={createFile}
              deleteFile={deleteFile}
              form={reviewForm}
              initialValues={reviewData}
              manuscriptId={latestManuscript.id}
              manuscriptShortId={latestManuscript.shortId}
              manuscriptStatus={latestManuscript.status}
              onChange={(value, path) =>
                updateReviewJsonData(
                  latestManuscript.id,
                  existingReview,
                  value,
                  path,
                )
              }
              onSubmit={handleSubmit}
              shouldStoreFilesInForm
              showEditorOnlyFields={false}
              submissionButtonText={t('reviewPage.Submit')}
              tagForFiles="review"
              threadedDiscussionProps={threadedDiscussionProps}
              validateDoi={validateDoi}
              validateSuffix={validateSuffix}
            />
          </SectionContent>
        )}
      </div>
    )
  }

  const createOtherReviewsSection = latestManuscript => {
    return (
      <div key={latestManuscript.id}>
        <SharedReviewerGroupReviews
          manuscript={latestManuscript}
          reviewerId={currentUser.id}
          reviewForm={reviewForm}
          threadedDiscussionProps={threadedDiscussionProps}
        />
      </div>
    )
  }

  const createDecisionDataSection = latestManuscript => {
    const decision = latestManuscript.reviews.find(r => r.isDecision) || {}

    const decisionIsCompleteData = [
      'accepted',
      'revise',
      'rejected',
      'evaluated',
      'published',
    ].includes(latestManuscript.status)

    const redactedDecisionFormData = decisionIsCompleteData
      ? decisionForm
      : {
          ...decisionForm,
          children: decisionForm.children.filter(
            x => x.component === 'ThreadedDiscussion',
          ),
        }

    let formData = {}

    try {
      formData = JSON.parse(decision.jsonData || '{}')
    } catch (error) {
      console.error('Error parsing decision jsonData:', error)
    }

    return (
      <ReadonlyFormTemplate
        form={redactedDecisionFormData}
        formData={formData}
        hideSpecialInstructions
        manuscript={latestManuscript}
        threadedDiscussionProps={threadedDiscussionProps}
        title={decisionForm.name}
      />
    )
  }

  const reviewTabs = versions
    .filter(({ manuscript: version }) =>
      versionsOfManuscriptCurrentUserIsReviewerOf.includes(version.id),
    )
    .map(({ manuscript: version, label }) => {
      const sharedReviewsForManuscriptVersion = version.reviews.filter(
        r =>
          r.isSharedWithCurrentUser &&
          r.user?.id !== currentUser.id &&
          !r.isDecision,
      )

      const reviewSectionsData = []
      reviewSectionsData.push({
        content: createMetaDataSection(version),
        key: 'metadata',
        label: 'Metadata',
      })
      if (version.meta.source)
        reviewSectionsData.push({
          content: createEditorSection(version),
          key: 'editor',
          label: 'Manuscript',
        })
      reviewSectionsData.push({
        content: createReviewsSection(version),
        key: 'review',
        label: 'Review',
      })
      if (sharedReviewsForManuscriptVersion?.length)
        reviewSectionsData.push({
          content: createOtherReviewsSection(version),
          key: 'other-reviews',
          label: 'Other Reviews',
        })
      if (
        config?.review?.showSummary &&
        version.reviews.find(r => r.isDecision)
      )
        reviewSectionsData.push({
          content: createDecisionDataSection(version),
          key: 'decision-data',
          label: decisionForm.name,
        })

      // eslint-disable-next-line consistent-return
      return {
        key: version.id,
        label,
        content: (
          <HiddenTabs
            defaultActiveKey={reviewSectionsData[0]?.key}
            sections={reviewSectionsData}
          />
        ),
      }
    })

  const [isDiscussionVisible, setIsDiscussionVisible] = React.useState(
    currentUser.chatExpanded,
  )

  const toggleSubmissionDiscussionVisibility = async () => {
    try {
      const { channelsData } = chatProps || {}

      const dataRefetchPromises = channelsData?.map(async channel => {
        await channel?.refetchUnreadMessagesCount?.()
        await channel?.refetchNotificationOptionData?.()
      })

      await Promise.all(dataRefetchPromises)
      chatExpand({ variables: { state: !isDiscussionVisible } })
      setIsDiscussionVisible(prevState => !prevState)
    } catch (error) {
      console.error('Error toggling submission discussion visibility:', error)
    }
  }

  return (
    <Columns>
      <Manuscript>
        <ErrorBoundary>
          <VersionSwitcher key={reviewTabs.length} versions={reviewTabs} />
        </ErrorBoundary>
      </Manuscript>
      {isDiscussionVisible && (
        <Chat>
          <MessageContainer
            channelId={channelId}
            channels={channels}
            chatProps={chatProps}
            currentUser={currentUser}
          />
          <CollapseButton
            iconName="ChevronRight"
            onClick={toggleSubmissionDiscussionVisibility}
            title={t('chat.Hide Chat')}
          />
        </Chat>
      )}
      {!isDiscussionVisible && (
        <ChatButton
          iconName="MessageSquare"
          onClick={toggleSubmissionDiscussionVisibility}
          title={t('chat.Show Chat')}
          unreadMessagesCount={channelData?.unreadMessagesCount}
        />
      )}
    </Columns>
  )
}

ReviewLayout.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  versions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      reviews: PropTypes.arrayOf(PropTypes.shape({})),
      status: PropTypes.string.isRequired,
      meta: PropTypes.shape({ source: PropTypes.string }).isRequired,
      files: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          storedObjects: PropTypes.arrayOf(PropTypes.object.isRequired),
        }).isRequired,
      ).isRequired,
    }).isRequired,
  ).isRequired,
  review: PropTypes.shape({}),
  onSubmit: PropTypes.func,
  uploadFile: PropTypes.func,
  channelId: PropTypes.string.isRequired,
  submissionForm: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        title: PropTypes.string,
        shortDescription: PropTypes.string,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  versionsOfManuscriptCurrentUserIsReviewerOf: PropTypes.arrayOf(
    PropTypes.string.isRequired,
  ).isRequired,
}

ReviewLayout.defaultProps = {
  onSubmit: () => {},
  review: undefined,
  uploadFile: undefined,
}

export default ReviewLayout
