import React from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import ReactRouterPropTypes from 'react-router-prop-types'
import Production from './Production'
import { Spinner, CommsErrorBanner } from '../../../shared'

const fragmentFields = `
  id
  created
  status
  files {
    id
    fileType
    mimeType
  }
	submission
  meta {
    title
    source
		abstract
    manuscriptId
  }
`

const query = gql`
  query($id: ID!) {
    currentUser {
      id
      username
      admin
    }

    manuscript(id: $id) {
      ${fragmentFields}
    }
  }
`

const getPdfQuery = gql`
  query($article: String!) {
    convertToPdf(article: $article) {
      pdfUrl
    }
  }
`

const getJatsQuery = gql`
  query($manuscriptId: String!) {
    convertToJats(manuscriptId: $manuscriptId) {
      xml
    }
  }
`

export const updateMutation = gql`
  mutation($id: ID!, $input: String) {
    updateManuscript(id: $id, input: $input) {
      id
      ${fragmentFields}
    }
  }
`

const DownloadPdfComponent = ({ makingPdf, manuscript, resetMakingPdf }) => {
  if (!makingPdf) {
    return null
  }

  const { data, loading, error } = useQuery(getPdfQuery, {
    variables: {
      article: JSON.stringify(manuscript),
    },
  })

  if (loading) return <Spinner />
  if (error)
    return (
      <div style={{ display: 'none' }}>
        <CommsErrorBanner error={error} />
      </div>
    ) // TODO: improve this!
  // Now, download the file
  const { pdfUrl } = data.convertToPdf // this is the relative url, like "uploads/filename.pdf"
  window.open(`/${pdfUrl}`)

  // use this code for downloading the PDF:

  const link = document.createElement('a')
  link.href = pdfUrl
  link.download = `${manuscript.title || 'title'}.pdf`
  link.click()

  // console.log(`Downloading ${link.download}`)

  // For Firefox it is necessary to delay revoking the ObjectURL.

  setTimeout(() => {
    window.URL.revokeObjectURL(pdfUrl)
    resetMakingPdf()
  }, 1000)
  return null
}

const DownloadJatsComponent = ({ makingJats, manuscript, resetMakingJats }) => {
  if (!makingJats) {
    return null
  }

  const { data, loading, error } = useQuery(getJatsQuery, {
    variables: {
      manuscriptId: manuscript.id,
    },
  })

  if (loading) return <Spinner />
  if (error)
    return (
      <div style={{ display: 'none' }}>
        <CommsErrorBanner error={error} />
      </div>
    ) // TODO: improve this!

  if (data) {
    const jats = data.convertToJats.xml
    /* eslint-disable */
    console.log('XML Selected')
    console.log('HTML:\n\n', manuscript.meta.source)
    console.log('JATS:\n\n', jats)
    // JATS XML file opens in new tab
    let blob = new Blob([jats], { type: 'text/xml' })
    let url = URL.createObjectURL(blob)
    window.open(url)
    URL.revokeObjectURL(url)
    resetMakingJats()
    /* eslint-disable */
  }
  return null
}

const ProductionPage = ({ match, ...props }) => {
  const [makingPdf, setMakingPdf] = React.useState(false)
  const [makingJats, setMakingJats] = React.useState(false)
  const [update] = useMutation(updateMutation)

  const updateManuscript = (versionId, manuscriptDelta) => {
    return update({
      variables: {
        id: versionId,
        input: JSON.stringify(manuscriptDelta),
      },
    })
  }

  const { data, loading, error } = useQuery(query, {
    variables: {
      id: match.params.version,
    },
  })

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />
  const { manuscript, currentUser } = data

  return (
    <div>
      <DownloadPdfComponent
        manuscript={manuscript}
        resetMakingPdf={() => {
          setMakingPdf(false)
        }}
        makingPdf={makingPdf}
      />
      <DownloadJatsComponent
        manuscript={manuscript}
        resetMakingJats={() => {
          setMakingJats(false)
        }}
        makingJats={makingJats}
      />
      <Production
        currentUser={currentUser}
        file={
          manuscript.files.find(file => file.fileType === 'manuscript') || {}
        }
        makePdf={setMakingPdf}
        makeJats={setMakingJats}
        manuscript={manuscript}
        updateManuscript={updateManuscript}
      />
    </div>
  )
}

ProductionPage.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
}

export default ProductionPage
