import React, { useState } from 'react'
import { debounce, cloneDeep, set } from 'lodash'
import { gql, useQuery, useMutation } from '@apollo/client'
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
  query($id: ID!, $form: String!) {
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

    getFile(form: $form)
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

const SubmitPage = ({ match, history, ...props }) => {
  const [confirming, setConfirming] = useState(false)

  const toggleConfirming = () => {
    setConfirming(confirming => !confirming)
  }

  const { data, loading, error } = useQuery(query, {
    variables: { id: match.params.version, form: 'submit' },
    partialRefetch: true,
  })

  const [update] = useMutation(updateMutation)
  const [submit] = useMutation(submitMutation)
  const [createNewVersion] = useMutation(createNewVersionMutation)

  if (loading) return <Spinner />
  if (error) return JSON.stringify(error)

  const manuscript = data?.manuscript
  const form = data?.getFile

  const updateManuscript = (versionId, manuscript) =>
    update({
      variables: {
        id: versionId,
        input: JSON.stringify(manuscript),
      },
    })

  const debouncers = {}

  // This is passed as a custom onChange prop (not belonging/originating from Formik)
  // to support continuous auto-saving
  const handleChange = versionId => (value, path) => {
    const input = {}
    set(input, path, value)
    debouncers[path] = debouncers[path] || debounce(updateManuscript, 3000)
    return debouncers[path](versionId, input)
  }

  const onSubmit = async (versionId, manuscript) => {
    const updateManuscript = {
      status: 'submitted',
    }

    await submit({
      variables: {
        id: versionId,
        input: JSON.stringify(updateManuscript),
      },
    })
    history.push('/journal/dashboard')
  }

  const versions = gatherManuscriptVersions(manuscript)

  return (
    <Submit
      confirming={confirming}
      createNewVersion={createNewVersion}
      form={cloneDeep(form)}
      onChange={handleChange}
      onSubmit={onSubmit}
      parent={manuscript}
      toggleConfirming={toggleConfirming}
      versions={versions}
      {...props}
    />
  )
}

export default SubmitPage
