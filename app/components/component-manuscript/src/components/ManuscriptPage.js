import React from 'react'
import { useQuery, gql } from '@apollo/client'
import ReactRouterPropTypes from 'react-router-prop-types'
// eslint-disable-next-line import/no-unresolved
import { useTranslation } from 'react-i18next'
import Manuscript from './Manuscript'
import { Spinner, CommsErrorBanner } from '../../../shared'
import useChat from '../../../../hooks/useChat'

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
    manuscript(id: $id) {
      ${fragmentFields}
    }
  }
`

const ManuscriptPage = ({ currentUser, match, ...props }) => {
  const { t } = useTranslation()

  const { data, loading, error } = useQuery(query, {
    variables: {
      id: match.params.version,
    },
  })

  const { manuscript } = data || {}

  let editorialChannel, allChannel

  // Protect if channels don't exist for whatever reason
  if (
    Array.isArray(data?.manuscript.channels) &&
    data?.manuscript.channels.length
  ) {
    editorialChannel = data?.manuscript.channels.find(
      c => c.type === 'editorial',
    )
    allChannel = data?.manuscript.channels.find(c => c.type === 'all')
  }

  const channels = [
    {
      id: allChannel?.id,
      name: t('chat.Discussion with author'),
      type: allChannel?.type,
    },
    {
      id: editorialChannel?.id,
      name: t('chat.Editorial discussion'),
      type: editorialChannel?.type,
    },
  ]

  const chatProps = useChat(channels)

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  return (
    <Manuscript
      channel={manuscript.channels.find(c => c.type === 'all')}
      chatProps={chatProps}
      content={manuscript.meta?.source}
      currentUser={currentUser}
      file={manuscript.files.find(file => file.tags.includes('manuscript'))}
    />
  )
}

ManuscriptPage.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
}

export default ManuscriptPage
