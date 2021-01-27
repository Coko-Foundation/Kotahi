import Accordion from '@pubsweet/ui/src/molecules/Accordion'
import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from '@apollo/client'
import { JournalContext } from '../../xpub-journal/src'
import queries from './queries'
import { Container, Placeholder, VisualAbstract } from './style'
import Wax from '../../wax-collab/src/Editoria'

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
        setPage={setPage}
        totalCount={totalCount}
      />

      {frontpage.length > 0 ? (
        frontpage.map(manuscript => (
          <SectionContent key={`manuscript-${manuscript.id}`}>
            <SectionHeader>
              <Title>{manuscript.meta.title}</Title>
            </SectionHeader>
            <SectionRow key={`manuscript-${manuscript.id}`}>
              {manuscript.submission?.abstract ? (
                <p>Abstract: {manuscript.submission?.abstract}</p>
              ) : (
                <br />
              )}
              {manuscript.visualAbstract ? (
                <p>
                  Visual abstract:{' '}
                  <VisualAbstract
                    alt="Visual abstract"
                    src={manuscript.visualAbstract}
                  />
                </p>
              ) : (
                <br />
              )}

              {manuscript.files.length > 0 ? (
                <div>
                  {manuscript.files.map(
                    file =>
                      skipXSweet(file) &&
                      file.fileType !== 'visualAbstract' && (
                        <p>
                          <a
                            href={file.url}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {file.filename}
                          </a>
                        </p>
                      ),
                  )}
                  {manuscript.files.map(
                    file =>
                      !skipXSweet(file) && (
                        <p>
                          <Accordion label="View Manuscript Text">
                            <Wax content={manuscript.meta.source} readonly />
                          </Accordion>
                        </p>
                      ),
                  )}
                </div>
              ) : (
                <br />
              )}

              {manuscript.submission?.links ? (
                <div>
                  Submitted research objects:
                  {manuscript.submission?.links?.map(link => (
                    <p key={`manuscript-${manuscript.id}`}>
                      <a
                        href={link.url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {link.url}
                      </a>
                    </p>
                  ))}
                </div>
              ) : (
                <br />
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
  history: PropTypes.node.isRequired,
}

export default Frontpage
