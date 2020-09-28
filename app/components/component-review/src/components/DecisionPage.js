import React from 'react'
import { useQuery } from '@apollo/client'
import DecisionVersion from './DecisionVersion'

import { Columns, Manuscript, Chat } from './style'

import { Spinner, VersionSwitcher, ErrorBoundary } from '../../../shared'

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
  let channelId
  if (Array.isArray(manuscript.channels) && manuscript.channels.length) {
    channelId = manuscript.channels.find(c => c.type === 'editorial').id
  }

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

      <Chat>{channelId && <MessageContainer channelId={channelId} />}</Chat>
    </Columns>
  )
}

export default DecisionPage
