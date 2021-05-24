import Accordion from '@pubsweet/ui/src/molecules/Accordion'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { useQuery } from '@apollo/client'
import ReactRouterPropTypes from 'react-router-prop-types'
import { th, grid } from '@pubsweet/ui-toolkit'
import { JournalContext } from '../../xpub-journal/src'
import queries from './queries'
import { Container, Placeholder, VisualAbstract } from './style'
import FullWaxEditor from '../../wax-collab/src/FullWaxEditor'

import {
  Spinner,
  SectionHeader,
  Title,
  SectionRow,
  SectionContent,
  Heading,
  HeadingWithAction,
  Pagination,
} from '../../shared'
import { PaginationContainer } from '../../shared/Pagination'

const ManuscriptBox = styled.div`
  border: 1px solid ${th('colorBorder')};
  border-radius: ${th('borderRadius')};
  margin-bottom: ${grid(0.5)};
`

const Subheading = styled.h3`
  font-size: ${th('fontSizeHeading6')};
  font-weight: bold;
  margin-top: ${grid(2.0)};
`

const Frontpage = ({ history, ...props }) => {
  const [sortName] = useState('created')
  const [sortDirection] = useState('DESC')
  const [page, setPage] = useState(1)
  const limit = 10
  const sort = sortName && sortDirection && `${sortName}_${sortDirection}`

  const skipXSweet = file =>
    !(
      file.mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )

  const { loading, data, error } = useQuery(queries.frontpage, {
    variables: {
      sort,
      offset: (page - 1) * limit,
      limit,
    },
    fetchPolicy: 'network-only',
  })

  const journal = useContext(JournalContext)

  if (loading) return <Spinner />
  if (error) return JSON.stringify(error)

  const { totalCount } = data.publishedManuscripts

  const frontpage = (data.publishedManuscripts?.manuscripts || []).map(m => {
    const visualAbstract = m.files?.find(f => f.fileType === 'visualAbstract')
    return {
      ...m,
      visualAbstract: visualAbstract?.url,
      submission: JSON.parse(m.submission),
    }
  })

  return (
    <Container>
      <HeadingWithAction>
        <Heading>Recent publications in {journal.metadata.name}</Heading>
      </HeadingWithAction>
      <Pagination
        limit={limit}
        page={page}
        PaginationContainer={PaginationContainer}
        setPage={setPage}
        totalCount={totalCount}
      />

      {frontpage.length > 0 ? (
        frontpage.map(manuscript => (
          <SectionContent key={`manuscript-${manuscript.id}`}>
            <SectionHeader>
              <Title>{manuscript.meta.title}</Title>
            </SectionHeader>
            <SectionRow>
              {manuscript.submission?.abstract && (
                <Subheading>
                  Abstract: {manuscript.submission?.abstract}
                </Subheading>
              )}
              {manuscript.visualAbstract && (
                <>
                  <Subheading>Visual abstract</Subheading>
                  <VisualAbstract
                    alt="Visual abstract"
                    src={manuscript.visualAbstract}
                  />
                </>
              )}

              {manuscript.files.length > 0 && (
                <>
                  {manuscript.files.map(
                    file =>
                      skipXSweet(file) &&
                      file.fileType !== 'visualAbstract' && (
                        <a
                          href={file.url}
                          key={`file-${file.id}`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {file.filename}
                        </a>
                      ),
                  )}
                  {manuscript.files.map(
                    file =>
                      !skipXSweet(file) && (
                        <Accordion
                          key={`file-${file.id}`}
                          label="View Manuscript Text"
                        >
                          <ManuscriptBox>
                            <FullWaxEditor
                              value={manuscript.meta.source}
                              readonly
                            />
                          </ManuscriptBox>
                        </Accordion>
                      ),
                  )}
                </>
              )}

              {manuscript.submission?.links &&
                manuscript.submission.links.length > 0 && (
                  <>
                    <Subheading>Submitted research objects</Subheading>
                    {manuscript.submission?.links?.map(link => (
                      <a
                        href={link.url}
                        key={`url-${link.url}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {link.url}
                      </a>
                    ))}
                  </>
                )}
            </SectionRow>
          </SectionContent>
        ))
      ) : (
        <Placeholder>No submissions have been published yet.</Placeholder>
      )}
    </Container>
  )
}

Frontpage.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
}

export default Frontpage
