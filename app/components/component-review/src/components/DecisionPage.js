import React from 'react'
import { useQuery } from '@apollo/client'
import DecisionVersion from './DecisionVersion'

import {
  Spinner,
  VersionSwitcher,
  ErrorBoundary,
  Columns,
  Manuscript,
  Chat,
} from '../../../shared'

import gatherManuscriptVersions from '../../../../shared/manuscript_versions'

import MessageContainer from '../../../component-chat/src'

import { query } from './queries'

const DecisionPage = ({ match }) => {
  const { loading, error, data } = useQuery(query, {
    variables: {
      id: match.params.version,
    },
    // fetchPolicy: 'cache-and-network',
  })

  if (loading) return <Spinner />
  if (error) return `Error! ${error.message}`

  const { manuscript } = data
  const versions = gatherManuscriptVersions(manuscript)

  // Protect if channels don't exist for whatever reason
  let editorialChannelId, allChannelId
  if (Array.isArray(manuscript.channels) && manuscript.channels.length) {
    editorialChannelId = manuscript.channels.find(c => c.type === 'editorial')
      .id
    allChannelId = manuscript.channels.find(c => c.type === 'all').id
  }

  const channels = [
    { id: allChannelId, name: 'Discussion with author' },
    { id: editorialChannelId, name: 'Editorial discussion' },
  ]

  return (
    <Columns>
      <Manuscript>
        <ErrorBoundary>
          <VersionSwitcher>
            {versions.map((version, index) => (
              <DecisionVersion
                current={index === 0}
                key={version.manuscript.id}
                label={version.label}
                parent={manuscript}
                version={version.manuscript}
              />
            ))}
          </VersionSwitcher>
        </ErrorBoundary>
      </Manuscript>
      <Chat>
        <MessageContainer channels={channels} />
      </Chat>
    </Columns>
  )
}

export default DecisionPage
