import React from 'react'
import styled from 'styled-components'

import { File } from '@pubsweet/ui'

const Root = styled.div``

const Title = styled.div``

const Table = styled.table`
  border-spacing: 0;
`

const Heading = styled.th`
  font-weight: inherit;
  color: var(--color-quiet);
  padding: 0 1em 0 0;
`

const Cell = styled.td`
  padding: 0;
`

const ReviewMetadata = ({ version, handlingEditors }) => (
  <Root>
    <Title>Metadata</Title>

    <Table>
      <tbody>
        <tr>
          <Heading>peer review:</Heading>
          <Cell>
            {version.declarations.openPeerReview === 'yes' ? 'open' : 'closed'}
          </Cell>
        </tr>

        {!!handlingEditors && (
          <tr>
            <Heading>handling editor:</Heading>
            <Cell>
              {handlingEditors.map(user => (
                <span key={user.username}>{user.username}</span>
              ))}
            </Cell>
          </tr>
        )}

        {!!version.files.supplementary.length && (
          <tr>
            <Heading>
              {version.files.supplementary.length} supplementary{' '}
              {version.files.supplementary.length === 1 ? 'file' : 'files'}:
            </Heading>
            <Cell>
              {version.files.supplementary.map(file => (
                <File key={file.url} value={file} />
              ))}
            </Cell>
          </tr>
        )}
      </tbody>
    </Table>
  </Root>
)

export default ReviewMetadata
