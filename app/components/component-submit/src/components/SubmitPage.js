import React, { useState } from 'react'
import { debounce, cloneDeep, isEmpty, set } from 'lodash'
// import { compose, withProps, withState, withHandlers } from 'recompose'
import { gql, useQuery, useMutation } from '@apollo/client'
import { Formik } from 'formik'
import Submit from './Submit'
import { Spinner } from '../../../shared'

const nullToEmpty = obj =>
  JSON.parse(JSON.stringify(obj, (k, v) => (v === null ? '' : v)))

const emptyToUndefined = obj =>
  JSON.parse(JSON.stringify(obj, (k, v) => (v === '' ? undefined : v)))

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
    open
    recommendation
    created
    isDecision
    comments {
      content
    }
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

const createFileMutation = gql`
  mutation($file: Upload!, $meta: FileMetaInput) {
    createFile(file: $file, meta: $meta) {
      id
      created
      label
      filename
      fileType
      mimeType
      size
      url
    }
  }
`

// export default compose(
// graphql(query, {
//   options: ({ match }) => ({
//     variables: {
//       id: match.params.version,
//       form: 'submit',
//     },
//   }),
//   props: ({ data }) => ({ data: nullToEmpty(data) }),
// }),
// graphql(createFileMutation, {
//   props: ({ mutate, ownProps }) => ({
//     createFile: value => {
//       const file = {
//         url: value.url,
//         filename: value.filename,
//         mimeType: value.mimeType,
//         size: value.size,
//         fileType: 'supplementary',
//         object: 'Manuscript',
//         objectId: ownProps.match.params.version,
//       }

//       mutate({
//         variables: {
//           file,
//         },
//       })
//     },
//   }),
// }),
// graphql(uploadSuplementaryFilesMutation, {
//   props: ({ mutate, ownProps }) => ({
//     uploadFile: file =>
//       mutate({
//         variables: {
//           file,
//         },
//       }),
//   }),
// }),
// graphql(updateMutation, {
//   props: ({ mutate, ownProps }) => {
//     const debouncers = {}
//     const onChange = (value, path) => {
//       const input = {}
//       set(input, path, value)
//       debouncers[path] = debouncers[path] || debounce(updateManuscript, 300)
//       return debouncers[path](input)
//     }

//     const updateManuscript = input =>
//       mutate({
//         variables: {
//           id: ownProps.match.params.version,
//           input: JSON.stringify(emptyToUndefined(input)),
//         },
//       })

//     return {
//       onChange,
//     }
//   },
// }),
// graphql(updateMutation, {
//   props: ({ mutate, ownProps }) => ({
//     onSubmit: (manuscript, { history }) => {
//       const updateManuscript = {
//         status: 'submitted',
//       }

//       mutate({
//         variables: {
//           id: ownProps.match.params.version,
//           input: JSON.stringify(updateManuscript),
//         },
//       }).then(() => {
//         history.push('/journal/dashboard')
//       })
//     },
//   }),
// }),
// withProps(({ getFile, manuscript, match: { params: { journal } } }) => ({
//   journal: { id: journal },
//   forms: cloneDeep(getFile),
//   manuscript,
//   submitSubmission: ({ validateForm, setSubmitting, handleSubmit }) =>
//     validateForm().then(props =>
//       isEmpty(props) ? setSubmitting(false) : handleSubmit(),
//     ),
// })),
// withFormik({
//   initialValues: {},
//   mapPropsToValues: ({ manuscript }) =>
//     Object.assign({}, manuscript, {
//       submission: JSON.parse(manuscript.submission),
//     }),
//   displayName: 'submit',
//   handleSubmit: (
//     props,
//     { validateForm, setSubmitting, props: { onSubmit, history } },
//   ) =>
//     validateForm().then(props =>
//       isEmpty(props) ? onSubmit(props, { history }) : setSubmitting(false),
//     ),
// }),
// withState('confirming', 'setConfirming', false),
// withHandlers({
//   toggleConfirming: ({ validateForm, setConfirming, handleSubmit }) => () =>
//     setConfirming(confirming => !confirming),
// }),
// )(Submit)

const SubmitPage = ({ match, history, ...props }) => {
  const [confirming, setConfirming] = useState(false)

  const toggleConfirming = () => {
    setConfirming(confirming => !confirming)
  }

  const { data, loading, error } = useQuery(query, {
    variables: { id: match.params.version, form: 'submit' },
  })

  const [createFile] = useMutation(createFileMutation)

  const createSupplementaryFile = file => {
    const meta = {
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      fileType: 'supplementary',
      object: 'Manuscript',
      objectId: match.params.version,
    }

    createFile({
      variables: {
        file,
        meta,
      },
    })
  }

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
      onSubmit={async (values, { validateForm, setSubmitting, ...other }) => {
        // TODO: Change this to a more Formik idiomatic form
        const isValid = Object.keys(await validateForm()).length === 0
        return isValid ? onSubmit(values) : setSubmitting(false)
      }}
      initialValues={Object.assign({}, manuscript, {
        submission: JSON.parse(manuscript.submission),
      })}
    >
      {props => (
        <Submit
          confirming={confirming}
          createSupplementaryFile={createSupplementaryFile}
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
