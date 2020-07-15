import config from 'config'
import request from 'pubsweet-client/src/helpers/api'
import gql from 'graphql-tag'
// TOOD: These queries come from the dashboard component,
// making this a tricky dependency. Should we extract them into
// a shared component?
import queries from '../../component-dashboard/src/graphql/queries'

const generateTitle = name =>
  name
    .replace(/[_-]+/g, ' ') // convert hyphens/underscores to space
    .replace(/\.[^.]+$/, '') // remove file extension

// TODO: preserve italics (use parse5?)
const extractTitle = source => {
  const doc = new DOMParser().parseFromString(source, 'text/html')
  const heading = doc.querySelector('h1')

  return heading ? heading.textContent : null
}

const uploadManuscriptMutation = gql`
  mutation($file: Upload!) {
    upload(file: $file) {
      url
    }
  }
`

const createManuscriptMutation = gql`
  mutation($input: ManuscriptInput) {
    createManuscript(input: $input) {
      id
      created
      manuscriptVersions {
        id
      }
      teams {
        id
        role
        name
        object {
          objectId
          objectType
        }
        members {
          id
          user {
            id
            username
          }
          status
        }
      }
      status
      reviews {
        open
        recommendation
        created
        user {
          id
          username
        }
      }
      meta {
        title
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
      }
    }
  }
`

const uploadPromise = (files, client) => {
  const [file] = files
  if (files.length > 1) {
    throw new Error('Only one manuscript file can be uploaded')
  }

  return client.mutate({
    mutation: uploadManuscriptMutation,
    variables: { file },
  })
}

const DocxToHTMLPromise = (file, data) => {
  const body = new FormData()
  body.append('docx', file)

  const url = `${config['pubsweet-client'].baseUrl}/convertDocxToHTML`

  return request(url, { method: 'POST', body }).then(response =>
    Promise.resolve({
      fileURL: data.upload.url,
      response,
    }),
  )
}

const createManuscriptPromise = (
  file,
  client,
  currentUser,
  fileURL,
  response,
) => {
  // In the case of a Docx file, response is the HTML
  // In the case of another type of file, response is true/false
  if (file && !response) {
    throw new Error('The file was not converted')
  }

  // We support file-less submissions too
  let source
  let title
  let files = []
  if (file) {
    source = typeof response === 'string' ? response : undefined
    title = extractTitle(response) || generateTitle(file.name)
    files = [
      {
        filename: file.name,
        url: fileURL,
        mimeType: file.type,
        size: file.size,
      },
    ]
  } else {
    title = `New submission ${new Date().toLocaleString()}`
  }

  const manuscript = {
    files,
    meta: {
      title,
      source,
    },
  }

  return client.mutate({
    mutation: createManuscriptMutation,
    variables: { input: manuscript },
    update: (proxy, { data: { createManuscript } }) => {
      let data = proxy.readQuery({ query: queries.dashboard })
      data.manuscripts.push(createManuscript)
      proxy.writeQuery({ query: queries.dashboard, data })

      data = proxy.readQuery({
        query: queries.getUser,
        variables: { id: currentUser.id },
      })
      data.user.teams.push(createManuscript.teams[0])
      proxy.writeQuery({ query: queries.getUser, data })
    },
  })
}

const redirectPromise = (setConversionState, journals, history, data) => {
  setConversionState(() => ({ converting: false, completed: true }))
  const route = `/journal/versions/${data.createManuscript.id}/submit`
  // redirect after a short delay
  window.setTimeout(() => {
    history.push(route)
  }, 2000)
}

const skipXSweet = file =>
  !(
    file.type ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )

export default ({
  client,
  history,
  journals,
  currentUser,
  setConversion,
}) => async files => {
  setConversion({ converting: true })
  let manuscriptData
  let uploadResponse
  try {
    if (files) {
      const [file] = files
      const { data } = await uploadPromise(files, client)
      if (skipXSweet(file)) {
        uploadResponse = {
          fileURL: data.upload.url,
          response: true,
        }
      } else {
        uploadResponse = await DocxToHTMLPromise(file, data)
      }
      manuscriptData = await createManuscriptPromise(
        file,
        client,
        currentUser,
        uploadResponse.fileURL,
        uploadResponse.response,
      )
    } else {
      // Create a manuscript without a file
      manuscriptData = await createManuscriptPromise(
        undefined,
        client,
        currentUser,
        undefined,
        undefined,
      )
    }
    return redirectPromise(
      setConversion,
      journals,
      history,
      manuscriptData.data,
    )
  } catch (error) {
    setConversion({ error })
  }
}
