import React from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import ReactRouterPropTypes from 'react-router-prop-types'
import Modal from 'react-modal'
import Production from './Production'
import { Spinner, CommsErrorBanner } from '../../../shared'

const useHtml = false

// If this is set to TRUE, we generate HTML and send back the HTML address instead of the PDF address
// This is a temporary measure, though it's useful to test what's coming out.

const fragmentFields = `
  id
  created
  status
  files {
    id
    tags
    storedObjects {
      mimetype
    }
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

// For now, doing this separately from the page query because this takes a long time and we don't want to wait for it.

const getPdfQuery = gql`
  query($manuscriptId: String!, $useHtml: Boolean) {
    convertToPdf(manuscriptId: $manuscriptId, useHtml: $useHtml) {
      pdfUrl
    }
  }
`

const getJatsQuery = gql`
  query($manuscriptId: String!) {
    convertToJats(manuscriptId: $manuscriptId) {
      xml
      error
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
    fetchPolicy: 'cache-and-network',
    variables: {
      manuscriptId: manuscript.id,
      useHtml,
    },
  })

  // Now, download the file
  if (data && !downloading) {
    setDownloading(true)
    const { pdfUrl } = data.convertToPdf // this is the relative url, like "uploads/filename.pdf"
    // console.log(pdfUrl)

    if (useHtml) {
      // use this to open the PDF in a new tab:
      const pdfWindow = window.open(`/${pdfUrl}`)
      pdfWindow.print()
    } else {
      const newWin = window.open(`/${pdfUrl}`)

      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        // if popups are blocked, try downloading it instead.
        const link = document.createElement('a')
        link.href = `/${pdfUrl}`
        link.download = `${manuscript.meta.title || 'title'}.pdf`
        link.target = '_blank'
        link.click()
      }
      // use this code for downloading the PDF:

      // const link = document.createElement('a')
      // link.href = `/${pdfUrl}`
      // link.download = `${manuscript.meta.title || 'title'}.pdf`
      // link.click()

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

const DownloadJatsComponent = ({ manuscript, resetMakingJats }) => {
  const { data, loading, error } = useQuery(getJatsQuery, {
    fetchPolicy: 'cache-and-network',
    variables: {
      manuscriptId: manuscript.id,
    },
  })

  if (loading) return <Spinner />

  if (error) {
    return (
      <div style={{ display: 'none' }}>
        <CommsErrorBanner error={error} />
      </div>
    ) // TODO: improve this!
  }

  if (data) {
    const jats = data.convertToJats.xml

    if (data.convertToJats.error.length) {
      /* eslint-disable */
      console.log(
        'Error making JATS. First error: ',
        JSON.parse(data.convertToJats.error),
      )
      resetMakingJats() // this is bad!
      return null
    }

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
  // const [saving, setSaving] = React.useState(false)
  // const [downloading, setDownloading] = React.useState(false)

  // const [currentJats, setCurrentJats] = React.useState({
  //   xml: '',
  //   error: false,
  // })

  const [update] = useMutation(updateMutation)

  const updateManuscript = async (versionId, manuscriptDelta) => {
    const newQuery = await update({
      variables: {
        id: versionId,
        input: JSON.stringify(manuscriptDelta),
      },
    })

    return newQuery
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
      {makingPdf ? (
        <DownloadPdfComponent
          manuscript={manuscript}
          resetMakingPdf={() => {
            // refetch({ id: match.params.version, manuscriptId: manuscript.id })
            setMakingPdf(false)
          }}
        />
      ) : null}
      {makingJats ? (
        <DownloadJatsComponent
          manuscript={manuscript}
          resetMakingJats={() => {
            setMakingJats(false)
          }}
        />
      ) : null}
      <Production
        currentUser={currentUser}
        file={
          manuscript.files.find(file => file.tags.includes('manuscript')) || {}
        }
        makePdf={setMakingPdf}
        makeJats={setMakingJats}
        manuscript={manuscript}
        updateManuscript={(a, b) => {
          // eslint-disable-next-line
          console.log('in update manuscript!')
          updateManuscript(a, b)
        }}
      />
    </div>
  )
}

ProductionPage.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
}

export default ProductionPage
