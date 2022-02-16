import React from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import ReactRouterPropTypes from 'react-router-prop-types'
import Modal from 'react-modal'
import Production from './Production'
import { Spinner, CommsErrorBanner } from '../../../shared'

const useHtml = true

// If this is set to TRUE, we generate HTML and send back the HTML address instead of the PDF address
// This is a temporary measure!

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
  query($id: ID!, $manuscriptId: String!) {
    currentUser {
      id
      username
      admin
    }



    manuscript(id: $id) {
      ${fragmentFields}
    }

		convertToJats(manuscriptId: $manuscriptId) {
      xml
      error
    }

	}
`

const getPdfQuery = gql`
  query($manuscriptId: String!, $useHtml: Boolean) {
    convertToPdf(manuscriptId: $manuscriptId, useHtml: $useHtml) {
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

const DownloadPdfComponent = ({ manuscript, resetMakingPdf }) => {
  const [downloading, setDownloading] = React.useState(false)
  const [modalIsOpen, setModalIsOpen] = React.useState(true)

  const { data, loading, error } = useQuery(getPdfQuery, {
    variables: {
      manuscriptId: manuscript.id,
      useHtml,
    },
  })

  // Now, download the file
  if (data && !downloading) {
    setDownloading(true)
    const { pdfUrl } = data.convertToPdf // this is the relative url, like "uploads/filename.pdf"

    if (useHtml) {
      // use this to open the PDF in a new tab:
      window.open(pdfUrl)
    } else {
      // use this code for downloading the PDF:

      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${manuscript.meta.title || 'title'}.pdf`
      link.click()

      // console.log(`Downloading ${link.download}`)
    }

    // For Firefox it is necessary to delay revoking the ObjectURL.

    setTimeout(() => {
      window.URL.revokeObjectURL(pdfUrl)
      setModalIsOpen(false)
      resetMakingPdf()
      setDownloading(false)
    }, 1000)
  }

  const onError = () => {
    console.error(error)
    resetMakingPdf()
  }

  const cancelGen = () => {
    // console.log('PDF generation canceled')
    resetMakingPdf()
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
      {error ? (
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
      ) : (
        <button onClick={cancelGen} style={{ marginTop: '1em' }} type="submit">
          Cancel
        </button>
      )}
    </Modal>
  )
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

  const { data, loading, error, refetch } = useQuery(query, {
    variables: {
      id: match.params.version,
      manuscriptId: match.params.version,
    },
  })

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const { manuscript, currentUser, convertToJats } = data

  // console.log(manuscript.meta.source, convertToJats.xml)

  if (makingJats) {
    if (convertToJats.error) {
      // eslint-disable-next-line
      console.error('Error making JATS: ', convertToJats.error)
    } else {
      /* eslint-disable */
      console.log('HTML:\n\n', manuscript.meta.source)
      console.log('JATS:\n\n', convertToJats.xml)
      // JATS XML file opens in new tab
      let blob = new Blob([convertToJats.xml], { type: 'text/xml' })
      let url = URL.createObjectURL(blob)
      window.open(url)
      URL.revokeObjectURL(convertToJats.xml)
    }
    setMakingJats(false)
  }

  return (
    <div>
      {makingPdf ? (
        <DownloadPdfComponent
          manuscript={manuscript}
          resetMakingPdf={() => {
            refetch({ id: match.params.version, manuscriptId: manuscript.id })
            setMakingPdf(false)
          }}
        />
      ) : null}
      <Production
        currentUser={currentUser}
        file={
          manuscript.files.find(file => file.fileType === 'manuscript') || {}
        }
        makePdf={setMakingPdf}
        makeJats={() => {
          // TODO: should we make sure that we've saved the manuscript first?
          // refetch({ id: match.params.version, manuscriptId: manuscript.id })
          setMakingJats(true)
        }}
        manuscript={manuscript}
        updateManuscript={(a, b) => {
          console.log('in update manuscript!')
          updateManuscript(a, b)
          refetch({ id: match.params.version, manuscriptId: manuscript.id })
        }}
      />
    </div>
  )
}

ProductionPage.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
}

export default ProductionPage
