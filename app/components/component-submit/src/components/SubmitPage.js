import React, { useState } from 'react'
import { debounce, cloneDeep, set } from 'lodash'
import { gql, useQuery, useMutation } from '@apollo/client'
import config from 'config'
import ReactRouterPropTypes from 'react-router-prop-types'
import Submit from './Submit'
import { Spinner } from '../../../shared'
import gatherManuscriptVersions from '../../../../shared/manuscript_versions'

const commentFields = `
  id
  commentType
  content
  files {
    id
    created
    label
    filename
    fileType
    mimeType
    size
    url
  }
`

const reviewFields = `
  id
  created
  updated
  decisionComment {
    ${commentFields}
  }
  reviewComment {
    ${commentFields}
  }
  confidentialComment {
    ${commentFields}
  }
  isDecision
  recommendation
  user {
    id
    defaultIdentity {
      name
    }
    username
  }
`

const fragmentFields = `
  id
  created
  files {
    id
    created
    label
    filename
    fileType
    mimeType
    size
    url
  }
  reviews {
    ${reviewFields}
  }
  teams {
    id
    role
    members {
      id
      user {
        id
        username
      }
    }
  }
  decision
  status
  meta {
    manuscriptId
    title
    source
    abstract
    declarations {
      openData
      openPeerReview
      preregistered
      previouslySubmitted
      researchNexus
      streamlinedReview
    }
    articleSections
    articleType
    history {
      type
      date
    }
    notes {
      notesType
      content
    }
    keywords
  }
  suggestions {
    reviewers {
      opposed
      suggested
    }
    editors {
      opposed
      suggested
    }
  }
  authors {
    firstName
    lastName
    email
    affiliation
  }
  submission
`

const query = gql`
  query($id: ID!, $formId: String!) {
    currentUser {
      id
      username
      admin
    }

    manuscript(id: $id) {
      ${fragmentFields}
      manuscriptVersions {
        parentId
        ${fragmentFields}
      }
      channels {
        id
        type
        topic
      }
    }

    getForm(formId: $formId)
  }
`

const updateMutation = gql`
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

const urlFrag = config.journal.metadata.toplevel_urlfragment

const SubmitPage = ({ match, history }) => {
  const [confirming, setConfirming] = useState(false)

  const toggleConfirming = () => {
    setConfirming(confirm => !confirm)
  }

  const { data, loading, error } = useQuery(query, {
    variables: { id: match.params.version, formId: 'submit' },
    partialRefetch: true,
  })

  const [update] = useMutation(updateMutation)
  const [submit] = useMutation(submitMutation)
  const [createNewVersion] = useMutation(createNewVersionMutation)

  if (loading) return <Spinner />
  if (error) return JSON.stringify(error)

  const manuscript = data?.manuscript
  const form = data?.getForm

  const updateManuscript = (versionId, manuscriptDelta) => {
    update({
      variables: {
        id: versionId,
        input: JSON.stringify(manuscriptDelta),
      },
    })
  }

  const debouncers = {}

  // This is passed as a custom onChange prop (not belonging/originating from Formik)
  // to support continuous auto-saving
  const handleChange = (value, path, versionId) => {
    const manuscriptDelta = {} // Only the changed fields
    set(manuscriptDelta, path, value)
    debouncers[path] = debouncers[path] || debounce(updateManuscript, 3000)
    return debouncers[path](versionId, manuscriptDelta)
  }

  const onSubmit = async versionId => {
    const delta = {
      status: match.url.includes('/evaluation') ? 'evaluated' : 'submitted',
    }

    await submit({
      variables: {
        id: versionId,
        input: JSON.stringify(delta),
      },
    })

    if (['aperture', 'colab'].includes(process.env.INSTANCE_NAME)) {
      history.push(`${urlFrag}/dashboard`)
    }

    if (['elife', 'ncrc'].includes(process.env.INSTANCE_NAME)) {
      history.push(`${urlFrag}/admin/manuscripts`)
    }
  }

  const versions = gatherManuscriptVersions(manuscript)

  return (
    <Submit
      confirming={confirming}
      createNewVersion={createNewVersion}
      form={cloneDeep(form)}
      match={match}
      onChange={handleChange}
      onSubmit={onSubmit}
      parent={manuscript}
      toggleConfirming={toggleConfirming}
      versions={versions}
    />
  )
}

SubmitPage.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
}

export default SubmitPage
