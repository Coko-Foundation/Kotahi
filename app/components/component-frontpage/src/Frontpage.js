import Accordion from '@pubsweet/ui/src/molecules/Accordion'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { useQuery } from '@apollo/client'
import { th, grid } from '@pubsweet/ui-toolkit'
import config from 'config'
import { sanitize } from 'isomorphic-dompurify'
import { JournalContext } from '../../xpub-journal/src'
import queries from './queries'
import FullWaxEditor from '../../wax-collab/src/FullWaxEditor'
import { Container, Placeholder, VisualAbstract, Abstract } from './style'
import {
  Spinner,
  SectionHeader,
  Title,
  SectionRow,
  SectionContent,
  Heading,
  HeadingWithAction,
  Pagination,
  CommsErrorBanner,
} from '../../shared'
import { PaginationContainer } from '../../shared/Pagination'
import PublishedArtifactWithLink from './PublishedArtifactWithLink'

const urlFrag = config.journal.metadata.toplevel_urlfragment

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

const LoginLink = styled.a`
  border: 0px;
  border-radius: 0px;
  display: block;
  font-size: 1em;
  font-weight: 500;
  margin: 1em;
  padding: 0.25em 1em;
`

const Frontpage = () => {
  const [sortName] = useState('created')
  const [sortDirection] = useState('DESC')
  const [page, setPage] = useState(1)
  const limit = 10
  const sort = sortName && sortDirection && `${sortName}_${sortDirection}`

  const skipXSweet = file =>
    !(
      file.storedObjects[0].mimetype ===
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
  if (error) return <CommsErrorBanner error={error} />

  const { totalCount } = data.publishedManuscripts

  const publishedManuscripts = (
    data.publishedManuscripts?.manuscripts || []
  ).map(m => {
    const visualAbstract = m.files?.find(f => f.tags.includes('visualAbstract'))
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
        <LoginLink
          href={
            window.localStorage.getItem('token')
              ? `${urlFrag}/dashboard`
              : '/login'
          }
        >
          {window.localStorage.getItem('token') ? 'Dashboard' : 'Login'}
        </LoginLink>
      </HeadingWithAction>
      <Pagination
        limit={limit}
        page={page}
        PaginationContainer={PaginationContainer}
        setPage={setPage}
        totalCount={totalCount}
      />

      {publishedManuscripts.length > 0 ? (
        publishedManuscripts.map(manuscript => {
          const title =
            process.env.INSTANCE_NAME === 'elife'
              ? manuscript.submission.description
              : manuscript.meta.title

          return (
            <SectionContent key={`manuscript-${manuscript.id}`}>
              <SectionHeader>
                <Title>{title}</Title>
              </SectionHeader>
              <SectionRow>
                {[...manuscript.publishedArtifacts]
                  .sort((a, b) => (a.externalId < b.externalId ? -1 : 1))
                  .map(artifact => (
                    <PublishedArtifactWithLink
                      artifact={artifact}
                      key={artifact.id}
                    />
                  ))}
                {manuscript.submission?.abstract && (
                  <>
                    <Subheading>Abstract:</Subheading>
                    <Abstract
                      dangerouslySetInnerHTML={(() => {
                        return {
                          __html: sanitize(manuscript.submission?.abstract),
                        }
                      })()}
                    />
                  </>
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
                        !file.tags.includes('visualAbstract') && (
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
                                readonly
                                value={manuscript.meta.source}
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
          )
        })
      ) : (
        <Placeholder>No submissions have been published yet.</Placeholder>
      )}
    </Container>
  )
}

export default Frontpage
