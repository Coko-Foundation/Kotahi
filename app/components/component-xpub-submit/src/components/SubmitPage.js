import { debounce, cloneDeep, isEmpty, set } from 'lodash'
import { compose, withProps, withState, withHandlers } from 'recompose'
import { graphql } from '@apollo/react-hoc'
import { gql } from 'apollo-client-preset'
import { withFormik } from 'formik'
import { withLoader } from 'pubsweet-client'
import Submit from './Submit'

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

const uploadSuplementaryFilesMutation = gql`
  mutation($file: Upload!) {
    upload(file: $file) {
      url
    }
  }
`

const createFileMutation = gql`
  mutation($file: Upload!) {
    createFile(file: $file) {
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

export default compose(
  graphql(query, {
    options: ({ match }) => ({
      variables: {
        id: match.params.version,
        form: 'submit',
      },
    }),
    props: ({ data }) => ({ data: nullToEmpty(data) }),
  }),
  graphql(createFileMutation, {
    props: ({ mutate, ownProps }) => ({
      createFile: value => {
        const file = {
          url: value.url,
          filename: value.filename,
          mimeType: value.mimeType,
          size: value.size,
          fileType: 'supplementary',
          object: 'Manuscript',
          objectId: ownProps.match.params.version,
        }

        mutate({
          variables: {
            file,
          },
        })
      },
    }),
  }),
  graphql(uploadSuplementaryFilesMutation, {
    props: ({ mutate, ownProps }) => ({
      uploadFile: file =>
        mutate({
          variables: {
            file,
          },
        }),
    }),
  }),
  graphql(updateMutation, {
    props: ({ mutate, ownProps }) => {
      const debouncers = {}
      const onChange = (value, path) => {
        const input = {}
        set(input, path, value)
        debouncers[path] = debouncers[path] || debounce(updateManuscript, 300)
        return debouncers[path](input)
      }

      const updateManuscript = input =>
        mutate({
          variables: {
            id: ownProps.match.params.version,
            input: JSON.stringify(emptyToUndefined(input)),
          },
        })

      return {
        onChange,
      }
    },
  }),
  graphql(updateMutation, {
    props: ({ mutate, ownProps }) => ({
      onSubmit: (manuscript, { history }) => {
        const updateManuscript = {
          status: 'submitted',
        }

        mutate({
          variables: {
            id: ownProps.match.params.version,
            input: JSON.stringify(updateManuscript),
          },
        }).then(() => {
          history.push('/dashboard')
        })
      },
    }),
  }),
  withLoader(),
  withProps(({ getFile, manuscript, match: { params: { journal } } }) => ({
    journal: { id: journal },
    forms: cloneDeep(getFile),
    manuscript,
    submitSubmission: ({ validateForm, setSubmitting, handleSubmit }) =>
      validateForm().then(props =>
        isEmpty(props) ? setSubmitting(false) : handleSubmit(),
      ),
  })),
  withFormik({
    initialValues: {},
    mapPropsToValues: ({ manuscript }) => manuscript,
    displayName: 'submit',
    handleSubmit: (
      props,
      { validateForm, setSubmitting, props: { onSubmit, history } },
    ) =>
      validateForm().then(props =>
        isEmpty(props) ? onSubmit(props, { history }) : setSubmitting(false),
      ),
  }),
  withState('confirming', 'setConfirming', false),
  withHandlers({
    toggleConfirming: ({ validateForm, setConfirming, handleSubmit }) => () =>
      setConfirming(confirming => !confirming),
  }),
)(Submit)
