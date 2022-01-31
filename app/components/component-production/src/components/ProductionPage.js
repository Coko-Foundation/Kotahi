import React from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import ReactRouterPropTypes from 'react-router-prop-types'
import Modal from 'react-modal'
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

export const updateMutation = gql`
  mutation($id: ID!, $input: String) {
    updateManuscript(id: $id, input: $input) {
      id
      ${fragmentFields}
    }
  }
`

const DownloadPdfComponent = ({ title, manuscript, resetTitle }) => {
  if (!title) {
    return null
  }

  const [modalIsOpen, setModalIsOpen] = React.useState(true)

  const { data, loading, error } = useQuery(getPdfQuery, {
    variables: {
      article: JSON.stringify(manuscript),
    },
  })

  // if (loading) return <Spinner />
  // if (error)
  //   return (
  //     <div style={{ display: 'none' }}>
  //       <CommsErrorBanner error={error} />
  //     </div>
  //   ) // TODO: improve this!
  // Now, download the file
  if (data) {
    console.log('in data')
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
      setModalIsOpen(false)
      resetTitle()
    }, 1000)
  }

  const onError = () => {
    console.error(error)
    resetTitle()
  }

  return (
    <Modal
      isOpen={modalIsOpen}
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <h2 style={{ marginBottom: '1em' }}>
        {error ? 'Error generating PDF' : 'Preparing PDF...'}
      </h2>
      {loading && <Spinner />}
      {error && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <p>Sorry, something went wrong.</p>
          <button onClick={onError} style={{ marginTop: '1em' }} type="submit">
            Close
          </button>
        </div>
      )}
    </Modal>
  )
}

const ProductionPage = ({ match, ...props }) => {
  const [title, setTitle] = React.useState(false)
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
        resetTitle={() => {
          setTitle(false)
        }}
        title={title}
      />
      <Production
        currentUser={currentUser}
        file={
          manuscript.files.find(file => file.fileType === 'manuscript') || {}
        }
        makePdf={setTitle}
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
