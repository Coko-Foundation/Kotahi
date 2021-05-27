import Accordion from '@pubsweet/ui/src/molecules/Accordion'
import React, { useContext, useState } from 'react'
import { useQuery } from '@apollo/client'
import ReactRouterPropTypes from 'react-router-prop-types'
import { JournalContext } from '../../xpub-journal/src'
import queries from './queries'
import { Container, Placeholder, VisualAbstract } from './style'
import Wax from '../../wax-collab/src/Editoria'
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
} from '../../shared'
import { PaginationContainer } from '../../shared/Pagination'

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
  const urlFrag = journal.metadata.toplevel_urlfragment

  if (loading) return <Spinner />
  if (error) return JSON.stringify(error)

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

  const reviews = publishedManuscripts
    .map(({ submission, evaluationsHypothesisMap }) => {
      if (Object.keys(evaluationsHypothesisMap).length > 0) {
        return Object.keys(evaluationsHypothesisMap).map(key => {
          return { [key]: submission[key] }
        })
      }

      return null
    })
    .filter(Boolean)

  const reviewTitle = (reviewKey, manuscriptId) => {
    if (reviewKey.includes('review')) {
      return (
        <>
          <div>
            Review #{reviewKey.split('review')[1]}
            <a
              href={`${urlFrag}/versions/${manuscriptId}/article-evaluation-result/${
                reviewKey.split('review')[1]
              }`}
            >
              &#128279;
            </a>
          </div>
        </>
      )
    }

    return (
      <>
        <div>
          Evaluation Summary
          <a
            href={`${urlFrag}/versions/${manuscriptId}/article-evaluation-summary`}
          >
            &#128279;
          </a>
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
        publishedManuscripts.map((manuscript, index) => (
          <SectionContent key={`manuscript-${manuscript.id}`}>
            {!['elife'].includes(process.env.INSTANCE_NAME) && (
              <SectionHeader>
                <Title>{manuscript.meta.title}</Title>
              </SectionHeader>
            )}
            {['elife'].includes(process.env.INSTANCE_NAME) && (
              <>
                <SectionHeader>
                  <Title>{manuscript.submission.description}</Title>
                </SectionHeader>
                {reviews[index].map(review => {
                  const reviewKey = Object.keys(review)[0]
                  const reviewValue = Object.values(review)[0]
                  return (
                    reviewValue && (
                      <Accordion
                        key={`${reviewKey}-${manuscript.id}`}
                        label={reviewTitle(reviewKey, manuscript.id)}
                      >
                        <ArticleEvaluation
                          dangerouslySetInnerHTML={(() => {
                            return { __html: reviewValue }
                          })()}
                        />
                      </Accordion>
                    )
                  )
                })}
              </>
            )}
            <SectionRow>
              {manuscript.submission?.abstract && (
                <h1>Abstract: {manuscript.submission?.abstract}</h1>
              )}
              {manuscript.visualAbstract && (
                <div>
                  <h1>Visual abstract</h1>
                  <VisualAbstract
                    alt="Visual abstract"
                    src={manuscript.visualAbstract}
                  />
                </div>
              )}

              {manuscript.files.length > 0 && (
                <div>
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
                          <Wax content={manuscript.meta.source} readonly />
                        </Accordion>
                      ),
                  )}
                </div>
              )}

              {manuscript.submission?.links && (
                <div>
                  <h1>Submitted research objects</h1>
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
                </div>
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
