import React, { useState, useEffect, useContext } from 'react'
import { debounce, set } from 'lodash'
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import ReactRouterPropTypes from 'react-router-prop-types'
import { ConfigContext } from '../../../config/src'
import Submit from './Submit'
import query, { fragmentFields } from '../userManuscriptFormQuery'
import { Spinner } from '../../../shared'
import gatherManuscriptVersions from '../../../../shared/manuscript_versions'
import {
  publishManuscriptMutation,
  setShouldPublishFieldMutation,
} from '../../../component-review/src/components/queries'
import { validateManuscriptSubmission } from '../../../../shared/manuscriptUtils'
import CommsErrorBanner from '../../../shared/CommsErrorBanner'
import { validateDoi, validateSuffix } from '../../../../shared/commsUtils'
import {
  UPDATE_PENDING_COMMENT,
  COMPLETE_COMMENTS,
  COMPLETE_COMMENT,
  DELETE_PENDING_COMMENT,
} from '../../../component-formbuilder/src/components/builderComponents/ThreadedDiscussion/queries'

export const updateMutation = gql`
  mutation($id: ID!, $input: String) {
    updateManuscript(id: $id, input: $input) {
      id
      ${fragmentFields}
    }
  }
`

const submitMutation = gql`
  mutation($id: ID!, $input: String) {
    submitManuscript(id: $id, input: $input) {
      id
      ${fragmentFields}
    }
  }
`

const createNewVersionMutation = gql`
  mutation($id: ID!) {
    createNewVersion(id: $id) {
      id
      ${fragmentFields}
    }
  }
`

const createFileMutation = gql`
  mutation($file: Upload!, $meta: FileMetaInput!) {
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
  mutation($id: ID!) {
    deleteFile(id: $id)
  }
`

let debouncers = {}

const SubmitPage = ({ match, history }) => {
  const config = useContext(ConfigContext)
  const urlFrag = config.journal.metadata.toplevel_urlfragment
  const [isPublishingBlocked, setIsPublishingBlocked] = useState(false)

  useEffect(() => {
    return () => {
      Object.values(debouncers).forEach(d => d.flush())
      debouncers = {}
    }
  }, [])

  const { data, loading, error } = useQuery(
    query,
    {
      variables: { id: match.params.version },
      partialRefetch: true,
    },
    { refetchOnMount: true },
  )

  const [update] = useMutation(updateMutation)
  const [submit] = useMutation(submitMutation)
  const [createNewVersion] = useMutation(createNewVersionMutation)
  const [publishManuscript] = useMutation(publishManuscriptMutation)
  const [createFile] = useMutation(createFileMutation)
  const [updatePendingComment] = useMutation(UPDATE_PENDING_COMMENT)
  const [completeComments] = useMutation(COMPLETE_COMMENTS)
  const [completeComment] = useMutation(COMPLETE_COMMENT)
  const [deletePendingComment] = useMutation(DELETE_PENDING_COMMENT)
  const [setShouldPublishField] = useMutation(setShouldPublishFieldMutation)

  const [deleteFile] = useMutation(deleteFileMutation, {
    update(cache, { data: { deleteFile: fileToDelete } }) {
      const id = cache.identify({
        __typename: 'File',
        id: fileToDelete,
      })

      cache.evict({ id })
    },
  })

  const [manuscriptChangedFields, setManuscriptChangedFields] = useState({
    submission: {},
  })

  const client = useApolloClient()

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const currentUser = data?.currentUser
  const manuscript = data?.manuscript
  const submissionForm = data?.submissionForm?.structure
  const decisionForm = data?.decisionForm?.structure
  const reviewForm = data?.reviewForm?.structure

  const updateManuscript = (versionId, manuscriptDelta) => {
    return update({
      variables: {
        id: versionId,
        input: JSON.stringify(manuscriptDelta),
      },
    })
  }

  // This is passed as a custom onChange prop (not belonging/originating from Formik)
  // to support continuous auto-saving
  const handleChange = (value, path, versionId) => {
    const manuscriptDelta = {} // Only the changed fields
    set(manuscriptDelta, path, value)
    setManuscriptChangedFields(s => {
      return {
        submission: {
          ...s.submission,
          ...manuscriptDelta.submission,
        },
      }
    })
    debouncers[path] = debouncers[path] || debounce(updateManuscript, 3000)
    return debouncers[path](versionId, manuscriptDelta)
  }

  const republish = async manuscriptId => {
    if (isPublishingBlocked) {
      return
    }

    setIsPublishingBlocked(true)

    const fieldErrors = await validateManuscriptSubmission(
      {
        ...JSON.parse(manuscript.submission),
        ...manuscriptChangedFields.submission,
      },
      submissionForm,
      validateDoi(client),
      validateSuffix(client),
    )

    if (fieldErrors.filter(Boolean).length !== 0) {
      return
    }

    await updateManuscript(manuscriptId, manuscriptChangedFields)
    await publishManuscript({
      variables: {
        id: manuscriptId,
      },
    })

    if (['aperture', 'colab'].includes(config.instanceName)) {
      history.push(`${urlFrag}/dashboard`)
    }

    if (['elife', 'ncrc'].includes(config.instanceName)) {
      history.push(`${urlFrag}/admin/manuscripts`)
    }
  }

  const onSubmit = async versionId => {
    await updateManuscript(versionId, manuscriptChangedFields)

    const delta = {
      status: match.url.includes('/evaluation') ? 'evaluated' : 'submitted',
    }

    await submit({
      variables: {
        id: versionId,
        input: JSON.stringify(delta),
      },
    })

    if (['aperture', 'colab'].includes(config.instanceName)) {
      history.push(`${urlFrag}/dashboard`)
    }

    if (['elife', 'ncrc'].includes(config.instanceName)) {
      history.push(`${urlFrag}/admin/manuscripts`)
    }
  }

  const versions = gatherManuscriptVersions(manuscript)

  const threadedDiscussionProps = {
    threadedDiscussions: data.threadedDiscussions,
    updatePendingComment,
    completeComment,
    completeComments,
    deletePendingComment,
    currentUser,
    firstVersionManuscriptId: manuscript.parentId || manuscript.id,
  }

  return (
    <Submit
      createFile={createFile}
      createNewVersion={createNewVersion}
      currentUser={currentUser}
      decisionForm={decisionForm}
      deleteFile={deleteFile}
      match={match}
      onChange={handleChange}
      onSubmit={onSubmit}
      parent={manuscript}
      republish={republish}
      reviewForm={reviewForm}
      setShouldPublishField={currentUser.admin ? setShouldPublishField : null}
      submissionForm={submissionForm}
      threadedDiscussionProps={threadedDiscussionProps}
      updateManuscript={updateManuscript}
      validateDoi={validateDoi(client)}
      validateSuffix={validateSuffix(client)}
      versions={versions}
    />
  )
}

SubmitPage.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
}

export default SubmitPage
