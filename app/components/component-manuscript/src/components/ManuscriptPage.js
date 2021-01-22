import PropTypes from 'prop-types'
import React from 'react'
import { useQuery, gql } from '@apollo/client'
import Manuscript from './Manuscript'
import { Spinner } from '../../../shared'

const fragmentFields = `
  id
  created
  status
  files {
    id
    fileType
    mimeType
  }
  meta {
    title
    source
    manuscriptId
  }
  channels {
    id
    type
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

const ManuscriptPage = ({ match, ...props }) => {
  const { data, loading, error } = useQuery(query, {
    variables: {
      id: match.params.version,
    },
  })

  ManuscriptPage.propTypes = {
    match: PropTypes.node.isRequired,
  }

  if (loading) return <Spinner />
  if (error) return JSON.stringify(error)
  const { manuscript } = data

  return (
    <Manuscript
      channel={manuscript.channels.find(c => c.type === 'all')}
      content={manuscript.meta?.source}
      file={manuscript.files.find(file => file.fileType === 'manuscript') || {}}
    />
  )
}

export default ManuscriptPage
