// import { compose, withProps } from 'recompose'
// import { withRouter } from 'react-router-dom'
// import { withApollo } from '@apollo/react-hoc'
import config from 'config'
import request from 'pubsweet-client/src/helpers/api'
import queries from './graphql/queries'
import mutations from './graphql/mutations'
import { extractTitle, generateTitle } from './title'
// import { XpubContext } from 'xpub-with-context'
// import { useContext } from 'react'

const uploadPromise = (files, client) => () => {
  const [file] = files
  if (files.length > 1) {
    throw new Error('Only one manuscript file can be uploaded')
  }

  return client.mutate({
    mutation: mutations.uploadManuscriptMutation,
    variables: { file },
  })
}

const DocxToHTMLPromise = file => ({ data }) => {
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

const createManuscriptPromise = (file, client, currentUser) => ({
  fileURL,
  response,
}) => {
  // In the case of a Docx file, response is the HTML
  // In the case of another type of file, response is true/false
  if (!response) {
    throw new Error('The file was not converted')
  }

  const source = typeof response === 'string' ? response : undefined
  const title = extractTitle(response) || generateTitle(file.name)

  const manuscript = {
    files: [
      {
        filename: file.name,
        url: fileURL,
        mimeType: file.type,
        size: file.size,
      },
    ],
    meta: {
      title,
      source,
    },
  }

  return client.mutate({
    mutation: mutations.createManuscriptMutation,
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

const redirectPromise = (setConversionState, journals, history) => ({
  data,
}) => {
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
}) => files => {
  const [file] = files
  setConversion({ converting: true })
  return Promise.resolve()
    .then(uploadPromise(files, client))
    .then(
      skipXSweet(file)
        ? ({ data }) =>
            Promise.resolve({
              fileURL: data.upload.url,
              response: true,
            })
        : DocxToHTMLPromise(file),
    )
    .then(createManuscriptPromise(file, client, currentUser))
    .then(redirectPromise(setConversion, journals, history))
    .catch(error => {
      setConversion({ error })
    })
}
