import React, { useEffect, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client'
import { set, debounce } from 'lodash'
import { useTranslation } from 'react-i18next'
import { ConfigContext } from '../../../config/src'
import { fragmentFields } from '../../../component-submit/src/userManuscriptFormQuery'
import { CommsErrorBanner, Spinner } from '../../../shared'
import DecisionVersions from './DecisionVersions'
import { roles } from '../../../../globals'

import {
  addReviewerMutation,
  makeDecisionMutation,
  publishManuscriptMutation,
  query,
  removeReviewerMutation,
  sendEmail,
  setShouldPublishFieldMutation,
  updateReviewMutation,
} from './queries'

import {
  CREATE_MESSAGE,
  GET_BLACKLIST_INFORMATION,
  UPDATE_SHARED_STATUS_FOR_INVITED_REVIEWER_MUTATION,
  UPDATE_TASK,
  UPDATE_TASKS,
  UPDATE_TASK_NOTIFICATION,
  DELETE_TASK_NOTIFICATION,
  CREATE_TASK_EMAIL_NOTIFICATION_LOGS,
  ASSIGN_AUTHOR_FOR_PROOFING,
} from '../../../../queries'
import {
  CREATE_TEAM_MUTATION,
  updateTeamMemberMutation,
  UPDATE_TEAM_MUTATION,
} from '../../../../queries/team'
import { validateDoi, validateSuffix } from '../../../../shared/commsUtils'
import {
  COMPLETE_COMMENT,
  COMPLETE_COMMENTS,
  DELETE_PENDING_COMMENT,
  UPDATE_PENDING_COMMENT,
} from '../../../component-formbuilder/src/components/builderComponents/ThreadedDiscussion/queries'
import useChat from '../../../../hooks/useChat'

export const updateManuscriptMutation = gql`
  mutation($id: ID!, $input: String) {
    updateManuscript(id: $id, input: $input) {
      id
      ${fragmentFields}
    }
  }
`

const createFileMutation = gql`
  mutation ($file: Upload!, $meta: FileMetaInput!) {
    createFile(file: $file, meta: $meta) {
      id
      created
      name
      updated
      name
      tags
      objectId
      storedObjects {
        key
        mimetype
        url
      }
    }
  }
`

const deleteFileMutation = gql`
  mutation ($id: ID!) {
    deleteFile(id: $id)
  }
`

let debouncers = {}

const DecisionPage = ({ currentUser, match }) => {
  const { t } = useTranslation()
  // start of code from submit page to handle possible form changes
  const client = useApolloClient()
  const config = useContext(ConfigContext)
  const { urlFrag } = config

  useEffect(() => {
    return () => {
      Object.values(debouncers).forEach(d => d.flush())
      debouncers = {}
    }
  }, [])

  const handleChange = (value, path, versionId) => {
    const manuscriptDelta = {} // Only the changed fields
    set(manuscriptDelta, path, value)
    debouncers[path] = debouncers[path] || debounce(updateManuscript, 3000)
    return debouncers[path](versionId, manuscriptDelta)
  }

  // end of code from submit page to handle possible form changes

  const {
    loading,
    data,
    error,
    refetch: refetchManuscript,
  } = useQuery(query, {
    variables: {
      id: match.params.version,
      groupId: config.groupId,
    },
  })

  let editorialChannel, allChannel

  // Protect if channels don't exist for whatever reason
  if (
    Array.isArray(data?.manuscript.channels) &&
    data?.manuscript.channels.length
  ) {
    editorialChannel = data?.manuscript.channels.find(
      c => c.type === 'editorial',
    )
    allChannel = data?.manuscript.channels.find(c => c.type === 'all')
  }

  const channels = [
    {
      id: allChannel?.id,
      name: t('chat.Discussion with author'),
      type: allChannel?.type,
    },
    {
      id: editorialChannel?.id,
      name: t('chat.Editorial discussion'),
      type: editorialChannel?.type,
    },
  ]

  const chatProps = useChat(channels)

  const [selectedEmail, setSelectedEmail] = useState('')
  const [externalEmail, setExternalEmail] = useState('')

  const inputEmail = externalEmail || selectedEmail || ''

  const blacklistInfoQuery = useQuery(GET_BLACKLIST_INFORMATION, {
    variables: {
      email: inputEmail,
      groupId: config.groupId,
    },
  })

  const selectedEmailIsBlacklisted =
    !!blacklistInfoQuery.data?.getBlacklistInformation?.length

  const [sendEmailMutation] = useMutation(sendEmail)

  const [doUpdateManuscript] = useMutation(updateManuscriptMutation)
  const [doSendChannelMessage] = useMutation(CREATE_MESSAGE)
  const [makeDecision] = useMutation(makeDecisionMutation)
  const [publishManuscript] = useMutation(publishManuscriptMutation)
  const [updateTeam] = useMutation(UPDATE_TEAM_MUTATION)
  const [createTeam] = useMutation(CREATE_TEAM_MUTATION)
  const [updateTeamMember] = useMutation(updateTeamMemberMutation)
  const [doUpdateReview] = useMutation(updateReviewMutation)
  const [createFile] = useMutation(createFileMutation)
  const [updatePendingComment] = useMutation(UPDATE_PENDING_COMMENT)
  const [completeComments] = useMutation(COMPLETE_COMMENTS)
  const [completeComment] = useMutation(COMPLETE_COMMENT)
  const [deletePendingComment] = useMutation(DELETE_PENDING_COMMENT)
  const [setShouldPublishField] = useMutation(setShouldPublishFieldMutation)

  const [assignAuthorForProofing] = useMutation(ASSIGN_AUTHOR_FOR_PROOFING, {
    update: (cache, { data: { assignAuthoForProofingManuscript } }) => {
      cache.modify({
        id: cache.identify({
          __typename: 'Manuscript',
          id: assignAuthoForProofingManuscript.id,
        }),
        fields: {
          status: () => assignAuthoForProofingManuscript.status,
          authorFeedback: () => assignAuthoForProofingManuscript.authorFeedback,
        },
      })
    },
  })

  const [updateSharedStatusForInvitedReviewer] = useMutation(
    UPDATE_SHARED_STATUS_FOR_INVITED_REVIEWER_MUTATION,
  )

  const [addReviewer] = useMutation(addReviewerMutation, {
    update: (cache, { data: { addReviewer: revisedReviewersObject } }) => {
      cache.modify({
        id: cache.identify({
          __typename: 'Manuscript',
          id: revisedReviewersObject.objectId,
        }),
        fields: {
          teams(existingTeamRefs = []) {
            const newTeamRef = cache.writeFragment({
              data: revisedReviewersObject,
              fragment: gql`
                fragment NewTeam on Team {
                  id
                  role
                  members {
                    id
                    user {
                      id
                    }
                  }
                }
              `,
            })

            return [...existingTeamRefs, newTeamRef]
          },
        },
      })
    },
  })

  const [removeReviewer] = useMutation(removeReviewerMutation)

  const [createTaskEmailNotificationLog] = useMutation(
    CREATE_TASK_EMAIL_NOTIFICATION_LOGS,
  )

  const [updateTask] = useMutation(UPDATE_TASK, {
    update(cache, { data: { updateTask: updatedTask } }) {
      cache.modify({
        id: cache.identify({
          __typename: 'Manuscript',
          id: updatedTask.manuscriptId,
        }),
        fields: {
          tasks(existingTaskRefs = [], { readField }) {
            const newTaskRef = cache.writeFragment({
              data: updatedTask,
              fragment: gql`
                fragment NewTask on Task {
                  id
                  title
                  dueDate
                  defaultDurationDays
                }
              `,
            })

            if (
              existingTaskRefs.some(
                ref => readField('id', ref) === updatedTask.id,
              )
            ) {
              return existingTaskRefs
            }

            return [...existingTaskRefs, newTaskRef]
          },
        },
      })
    },
  })

  const [updateTaskNotification] = useMutation(UPDATE_TASK_NOTIFICATION)

  const [deleteTaskNotification] = useMutation(DELETE_TASK_NOTIFICATION)

  const [updateTasks] = useMutation(UPDATE_TASKS, {
    update(cache, { data: { updateTasks: updatedTasks } }) {
      if (updatedTasks.length) {
        cache.modify({
          id: cache.identify({
            __typename: 'Manuscript',
            id: updatedTasks[0].manuscriptId,
          }),
          fields: {
            tasks() {
              return updatedTasks
            },
          },
        })
      }
    },
  })

  const [deleteFile] = useMutation(deleteFileMutation, {
    update(cache, { data: { deleteFile: fileToDelete } }) {
      const id = cache.identify({
        __typename: 'File',
        id: fileToDelete,
      })

      cache.evict({ id })
    },
  })

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const updateManuscript = (versionId, manuscriptDelta) =>
    doUpdateManuscript({
      variables: {
        id: versionId,
        input: JSON.stringify(manuscriptDelta),
      },
    })

  const updateReview = async (
    reviewId,
    reviewData,
    manuscriptId,
    shouldNotSetUser = false,
  ) => {
    doUpdateReview({
      variables: {
        id: reviewId || undefined,
        input: reviewData,
        shouldNotSetUser,
      },
      update: (cache, { data: { updateReview: updatedReview } }) => {
        cache.modify({
          id: cache.identify({
            __typename: 'Manuscript',
            id: manuscriptId,
          }),
          fields: {
            reviews(existingReviewRefs = [], { readField }) {
              const newReviewRef = cache.writeFragment({
                data: updatedReview,
                fragment: gql`
                  fragment NewReview on Review {
                    id
                  }
                `,
              })

              if (
                existingReviewRefs.some(
                  ref => readField('id', ref) === updatedReview.id,
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

  const {
    manuscript,
    submissionForm,
    decisionForm: decisionFormOuter,
    reviewForm: reviewFormOuter,
    users,
    threadedDiscussions,
    doisToRegister,
    emailTemplates,
  } = data

  const form = submissionForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const decisionForm = decisionFormOuter?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const reviewForm = reviewFormOuter?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const sendNotifyEmail = async emailData => {
    const response = await sendEmailMutation({
      variables: {
        input: JSON.stringify(emailData),
      },
    })

    await refetchManuscript()

    return response
  }

  const sendChannelMessage = async messageData => {
    const response = await doSendChannelMessage({
      variables: messageData,
    })

    return response
  }

  /** This will only send the modified field, not the entire review object */
  const updateReviewJsonData = (reviewId, value, path, manuscriptVersionId) => {
    const reviewDelta = {} // Only the changed fields
    // E.g. if path is 'submission.$title' and value is 'Foo' this gives { submission: { $title: 'Foo' } }
    set(reviewDelta, path, value)

    const reviewPayload = {
      isDecision: true,
      jsonData: JSON.stringify(reviewDelta),
      manuscriptId: manuscriptVersionId,
      userId: currentUser.id,
    }

    updateReview(reviewId, reviewPayload, manuscriptVersionId)
  }

  const threadedDiscussionProps = {
    threadedDiscussions,
    updatePendingComment,
    completeComment,
    completeComments,
    deletePendingComment,
    currentUser,
    firstVersionManuscriptId: manuscript.parentId || manuscript.id,
  }

  return (
    <DecisionVersions
      addReviewer={addReviewer}
      allUsers={users}
      assignAuthorForProofing={assignAuthorForProofing}
      canHideReviews={config?.controlPanel?.hideReview}
      channels={channels}
      chatProps={chatProps}
      createFile={createFile}
      createTaskEmailNotificationLog={createTaskEmailNotificationLog}
      createTeam={createTeam}
      currentUser={currentUser}
      decisionForm={decisionForm}
      deleteFile={deleteFile}
      deleteTaskNotification={deleteTaskNotification}
      displayShortIdAsIdentifier={
        config?.controlPanel?.displayManuscriptShortId
      }
      dois={doisToRegister}
      emailTemplates={emailTemplates}
      externalEmail={externalEmail}
      form={form}
      handleChange={handleChange}
      makeDecision={makeDecision}
      manuscript={manuscript}
      publishManuscript={publishManuscript}
      refetch={() => {
        refetchManuscript()
      }}
      removeReviewer={removeReviewer}
      reviewers={data?.manuscript?.reviews}
      reviewForm={reviewForm}
      roles={roles}
      selectedEmail={selectedEmail}
      selectedEmailIsBlacklisted={selectedEmailIsBlacklisted}
      sendChannelMessage={sendChannelMessage}
      sendNotifyEmail={sendNotifyEmail}
      setExternalEmail={setExternalEmail}
      setSelectedEmail={setSelectedEmail}
      setShouldPublishField={setShouldPublishField}
      teamLabels={config.teams}
      teams={data?.manuscript?.teams}
      threadedDiscussionProps={threadedDiscussionProps}
      updateManuscript={updateManuscript}
      updateReview={updateReview}
      updateReviewJsonData={updateReviewJsonData}
      updateSharedStatusForInvitedReviewer={
        updateSharedStatusForInvitedReviewer
      }
      updateTask={updateTask}
      updateTaskNotification={updateTaskNotification}
      updateTasks={updateTasks}
      updateTeam={updateTeam}
      updateTeamMember={updateTeamMember}
      urlFrag={urlFrag}
      validateDoi={validateDoi(client)}
      validateSuffix={validateSuffix(client, config.groupId)}
    />
  )
}

DecisionPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      version: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
}

export default DecisionPage
