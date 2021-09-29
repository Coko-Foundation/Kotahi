import Accordion from '@pubsweet/ui/src/molecules/Accordion'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { useQuery } from '@apollo/client'
import { th, grid } from '@pubsweet/ui-toolkit'
import { JournalContext } from '../../xpub-journal/src'
import queries from './queries'
import FullWaxEditor from '../../wax-collab/src/FullWaxEditor'
import {
  Container,
  Placeholder,
  VisualAbstract,
  Abstract,
  ReviewWrapper,
  ReviewLink,
} from './style'
import { ArticleEvaluation } from '../../component-evaluation-result/style'

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

const Frontpage = () => {
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
  if (error) return <CommsErrorBanner error={error} />

  const { totalCount } = data.publishedManuscripts

  const publishedManuscripts = (
    data.publishedManuscripts?.manuscripts || []
  ).map(m => {
    const visualAbstract = m.files?.find(f => f.fileType === 'visualAbstract')
    return {
      ...m,
      visualAbstract: visualAbstract?.url,
      submission: JSON.parse(m.submission),
      evaluationsHypothesisMap: JSON.parse(m.evaluationsHypothesisMap),
    }
  })

  const reviewTitle = (reviewKey, manuscriptId) => {
    if (reviewKey.includes('review')) {
      return (
        <>
          <div>
            Review #{reviewKey.split('review')[1]}
            <ReviewLink
              href={`/versions/${manuscriptId}/article-evaluation-result/${
                reviewKey.split('review')[1]
              }`}
            >
              &#128279;
            </ReviewLink>
          </div>
        </>
      )
    }

    return (
      <>
        <div>
          Evaluation Summary
          <ReviewLink
            href={`/versions/${manuscriptId}/article-evaluation-summary`}
          >
            &#128279;
          </ReviewLink>
        </div>
      </>
    )
  }

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

      {publishedManuscripts.length > 0 ? (
        publishedManuscripts.map((manuscript, index) => {
          const title =
            process.env.INSTANCE_NAME === 'elife'
              ? manuscript.submission.description
              : manuscript.meta.title

          return (
            <SectionContent key={`manuscript-${manuscript.id}`}>
              <SectionHeader>
                <Title>{title}</Title>
              </SectionHeader>
              {manuscript.evaluationsHypothesisMap &&
                // TODO Don't map for all publishedManuscripts; just compute for this manuscript!
                publishedManuscripts
                  .map(({ submission, evaluationsHypothesisMap }) => {
                    if (
                      evaluationsHypothesisMap &&
                      Object.keys(evaluationsHypothesisMap).length > 0
                    ) {
                      return Object.keys(evaluationsHypothesisMap).map(key => {
                        return { [key]: submission[key] }
                      })
                    }

                    return null
                  })
                  .filter(Boolean)
                  [index].map(review => {
                    const reviewKey = Object.keys(review)[0]
                    const reviewValue = Object.values(review)[0]
                    return (
                      reviewValue && (
                        <Accordion
                          key={`${reviewKey}-${manuscript.id}`}
                          label={reviewTitle(reviewKey, manuscript.id)}
                        >
                          <ReviewWrapper>
                            <ArticleEvaluation
                              dangerouslySetInnerHTML={(() => {
                                return { __html: reviewValue }
                              })()}
                            />
                          </ReviewWrapper>
                        </Accordion>
                      )
                    )
                  })}
              <SectionRow>
                {manuscript.submission?.abstract && (
                  <>
                    <Subheading>Abstract:</Subheading>
                    <Abstract
                      dangerouslySetInnerHTML={(() => {
                        return { __html: manuscript.submission?.abstract }
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
