import React, { useState } from 'react'
import { debounce, cloneDeep, set } from 'lodash'
// import { compose, withProps, withState, withHandlers } from 'recompose'
import { gql, useQuery, useMutation } from '@apollo/client'
import { Formik } from 'formik'
import Submit from './Submit'
import { Spinner } from '../../../shared'

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
    id
    open
    recommendation
    created
    isDecision
    user {
      id
      username
    }
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
        ${fragmentFields}
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

// const uploadSuplementaryFilesMutation = gql`
//   mutation($file: Upload!) {
//     upload(file: $file) {
//       url
//     }
//   }
// `

const SubmitPage = ({ match, history, ...props }) => {
  const [confirming, setConfirming] = useState(false)

  const toggleConfirming = () => {
    setConfirming(confirming => !confirming)
  }

  const { data, loading, error } = useQuery(query, {
    variables: { id: match.params.version, form: 'submit' },
  })

  const [update] = useMutation(updateMutation)

  if (loading) return <Spinner />
  if (error) return error

  const manuscript = data?.manuscript
  const getFile = data?.getFile

  const updateManuscript = input =>
    update({
      variables: {
        id: match.params.version,
        input: JSON.stringify(input),
      },
    })

  const debouncers = {}

  const handleChange = (value, path) => {
    const input = {}
    set(input, path, value)
    debouncers[path] = debouncers[path] || debounce(updateManuscript, 300)
    return debouncers[path](input)
  }

  const onSubmit = async manuscript => {
    const updateManuscript = {
      status: 'submitted',
    }

    await update({
      variables: {
        id: match.params.version,
        input: JSON.stringify(updateManuscript),
      },
    })
    history.push('/journal/dashboard')
  }

  return (
    <Formik
      displayName="submit"
      handleChange={handleChange}
      initialValues={Object.assign({}, manuscript, {
        submission: JSON.parse(manuscript.submission),
      })}
      onSubmit={async (values, { validateForm, setSubmitting, ...other }) => {
        // TODO: Change this to a more Formik idiomatic form
        const isValid = Object.keys(await validateForm()).length === 0
        return isValid ? onSubmit(values) : setSubmitting(false)
      }}
    >
      {props => (
        <Submit
          confirming={confirming}
          forms={cloneDeep(getFile)}
          manuscript={manuscript}
          onChange={handleChange}
          toggleConfirming={toggleConfirming}
          {...props}
        />
      )}
    </Formik>
  )
}

export default SubmitPage
