import React from 'react'
import Modal from 'react-modal'
import { useQuery, gql } from '@apollo/client'
import { Spinner, CommsErrorBanner } from '../../../shared'

const getJatsQuery = gql`
  query($manuscriptId: String!) {
    convertToJats(manuscriptId: $manuscriptId) {
      xml
      error
    }
  }
`

const DownloadJatsComponent = ({ manuscript, resetMakingJats }) => {
  const [downloading, setDownloading] = React.useState(false)
  const [modalIsOpen, setModalIsOpen] = React.useState(true)

  const { data, loading, error } = useQuery(getJatsQuery, {
    fetchPolicy: 'cache-and-network',
    variables: {
      manuscriptId: manuscript.id,
    },
  })

  if (loading) return <Spinner />

  if (error) {
    // if here, the error is not with the XML but with the query
    console.error(error)
    return (
      <div style={{ display: 'none' }}>
        <CommsErrorBanner error={error} />
      </div>
    ) // TODO: improve this!
  }

  if (data && !downloading) {
    setDownloading(true)
    const jats = data.convertToJats.xml

    if (data.convertToJats.error.length) {
      /* eslint-disable */
      console.log(data.convertToJats.xml)
      console.log('Error making JATS. Errors: ', data.convertToJats.error)
      // resetMakingJats() // this is bad!
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
    // URL.revokeObjectURL(url)
    console.log(url)
    setModalIsOpen(false)
    resetMakingJats()

    /* eslint-disable */
  }

  const onError = () => {
    console.error(error)
    resetMakingJats()
  }

  const cancelGen = () => {
    // console.log('PDF generation canceled')
    resetMakingJats()
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
        {error ? <p>Error generating JATS</p> : <p>Preparing JATS...</p>}
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
      ) : data.convertToJats.error ? (
        <>
          <p>Error: invalid JATS. See console for details.</p>
          <button
            onClick={cancelGen}
            style={{ marginTop: '1em' }}
            type="submit"
          >
            Close
          </button>
        </>
      ) : (
        <button onClick={cancelGen} style={{ marginTop: '1em' }} type="submit">
          Cancel
        </button>
      )}
    </Modal>
  )
}

export default DownloadJatsComponent
