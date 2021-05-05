import React, { useState, useEffect } from 'react'
import { debounce, set } from 'lodash'
import { gql, useQuery, useMutation } from '@apollo/client'
import config from 'config'
import ReactRouterPropTypes from 'react-router-prop-types'
import Submit from './Submit'
import { Spinner } from '../../../shared'
import gatherManuscriptVersions from '../../../../shared/manuscript_versions'
import { publishManuscriptMutation } from '../../../component-review/src/components/queries'
import pruneEmpty from '../../../../shared/pruneEmpty'

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

export const query = gql`
  query($id: ID!) {
    currentUser {
      id
      username
      admin
    }

    manuscript(id: $id) {
      hypothesisPublicationId
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

    formForPurpose(purpose: "submit") {
      structure {
        name
        description
        haspopup
        popuptitle
        popupdescription
        children {
          title
          shortDescription
          id
          component
          name
          description
          doiValidation
          placeholder
          parse
          format
          options {
            id
            label
            value
          }
          validate {
            id
            label
            value
          }
          validateValue {
            minChars
            maxChars
            minSize
          }
        }
      }
    }
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

const cleanForm = form => {
  if (!form) return form
  // Remove any form items that are incomplete/invalid
  return { ...form, children: form.children.filter(f => f.component && f.name) }
}

let debouncers = {}

const SubmitPage = ({ match, history }) => {
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    return () => {
      debouncers = {}
    }
  }, [])

  const toggleConfirming = () => {
    setConfirming(confirm => !confirm)
  }

  const { data, loading, error } = useQuery(query, {
    variables: { id: match.params.version },
    partialRefetch: true,
  })
  
  const [update] = useMutation(updateMutation)
  const [submit] = useMutation(submitMutation)
  const [createNewVersion] = useMutation(createNewVersionMutation)
  const [publishManuscript] = useMutation(publishManuscriptMutation)
  const [manuscriptChangedFields, setManuscriptChangedFields] = useState({submission: {}})
  
  if (loading) return <Spinner />
  if (error) return JSON.stringify(error)
  
  const manuscript = data?.manuscript
  const form = cleanForm(data?.formForPurpose?.structure)
  
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
        }
      }
    })
    debouncers[path] = debouncers[path] || debounce(updateManuscript, 3000)
    return debouncers[path](versionId, manuscriptDelta)
  }

  const republish = async (manuscriptId, manuscriptDelta) => {
    await updateManuscript(manuscriptId, manuscriptChangedFields)
    await publishManuscript({
      variables: {
        id: manuscriptId,
        input: JSON.stringify(manuscriptDelta),
      },
    })
    
    if (['aperture', 'colab'].includes(process.env.INSTANCE_NAME)) {
      history.push(`${urlFrag}/dashboard`)
    }

    if (['elife', 'ncrc'].includes(process.env.INSTANCE_NAME)) {
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
      form={pruneEmpty(form)}
      match={match}
      onChange={handleChange}
      onSubmit={onSubmit}
      parent={manuscript}
      republish={republish}
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
