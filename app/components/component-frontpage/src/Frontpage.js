import Accordion from '@pubsweet/ui/src/molecules/Accordion'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { useQuery } from '@apollo/client'
import { th, grid } from '@pubsweet/ui-toolkit'
import config from 'config'
import { get } from 'lodash'
import { sanitize } from 'dompurify'
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

const ReviewTitleAndLink = ({ title, manuscriptId, fieldName }) => {
  const fieldNameWithSlashes = fieldName
    .replaceAll('.', '/')
    .replaceAll('#', '/')

  return (
    <>
      {title}
      <ReviewLink
        href={`/versions/${manuscriptId}/article-evaluation/${fieldNameWithSlashes}`}
      >
        &#128279;
      </ReviewLink>
    </>
  )
}

const fieldLocationRegex = /([0-9a-f-]+)\.([\w.]+)(?::([0-9a-f-]+))?/

/** Gets the parts from a hypothesis map entry like
 * "dab0a39b-c16e-4d0e-8627-1d493c8a6d0d.meta.abstract"
 * or "4edcea62-e1e4-4235-8dc9-2afa5f66334f.discussion:97b49766-8513-427e-9f4e-9c463fa9878c".
 * Most fields take the first form, which starts with the ownerId (manuscript or decision/review)
 * followed by the field name. ThreadedDiscussion comments take the second form, which adds the
 * comment ID on the end. */
const splitLocation = fieldLocation => {
  const match = fieldLocationRegex.exec(fieldLocation)
  if (!match) return { ownerId: null, fieldName: null, commentId: null }
  return { ownerId: match[1], fieldName: match[2], commentId: match[3] || null }
}

/** Returns a map of maps. Outermost keys are the ID of either the manuscript or a decision/review.
 * Each of these yields an inner map whose key is the fieldName, and whose value is either true,
 *  or in the case of threaded discussion fields, an array of comment IDs.
 */
const getHypothesisFieldsByOwner = hypothesisMap => {
  if (!hypothesisMap) return {}
  const fieldsByOwner = {}

  Object.keys(hypothesisMap).forEach(fieldLocation => {
    const { ownerId, fieldName, commentId } = splitLocation(fieldLocation)
    let ownerFields = fieldsByOwner[ownerId]

    if (!ownerFields) {
      ownerFields = {}
      fieldsByOwner[ownerId] = ownerFields
    }

    if (commentId) {
      if (ownerFields[fieldName]) ownerFields[fieldName].push(commentId)
      else ownerFields[fieldName] = [commentId]
    } else ownerFields[fieldName] = true
  })

  return fieldsByOwner
}

const getFieldInfo = (
  manuscript,
  submissionFields,
  decisionFields,
  reviewFields,
) => {
  const fieldInfo = [
    {
      ownerId: manuscript.id,
      fields: submissionFields,
      fieldData: manuscript,
      label: '',
    },
  ]

  const decision = manuscript.reviews.find(r => r.isDecision)
  const decisionData = decision ? JSON.parse(decision.jsonData) : null
  if (decision)
    fieldInfo.push({
      ownerId: decision.id,
      fields: decisionFields,
      fieldData: decisionData,
      label: 'Evaluation — ',
    })

  const reviews = manuscript.reviews.filter(r => !r.isDecision)
  reviews.forEach((r, index) => {
    const reviewData = JSON.parse(r.jsonData)
    fieldInfo.push({
      ownerId: r.id,
      fields: reviewFields,
      fieldData: reviewData,
      label: `Review ${index + 1} — `,
    })
  })

  return fieldInfo
}

const generateAnnotation = (manuscriptId, fieldLocator, label, content) => {
  return (
    <Accordion
      key={fieldLocator}
      label={
        <ReviewTitleAndLink
          fieldName={fieldLocator}
          manuscriptId={manuscriptId}
          title={label}
        />
      }
    >
      <ReviewWrapper>{content}</ReviewWrapper>
    </Accordion>
  )
}

const format = (value, component, options) => {
  if (['AbstractEditor', 'ThreadedDiscussion'].includes(component)) {
    return (
      <ArticleEvaluation
        dangerouslySetInnerHTML={(() => {
          return { __html: sanitize(value) }
        })()}
      />
    )
  }

  if (options) {
    const values = Array.isArray(value) ? value : [value]

    return (
      <ArticleEvaluation>
        {values
          .map(v => options.find(o => o.value === v)?.label || v)
          .join(', ')}
      </ArticleEvaluation>
    )
  }

  if (component === 'AuthorsInput') {
    return (
      <ArticleEvaluation>
        <ul>
          {value.map(a => (
            <li key={a.id}>
              {a.firstName} {a.lastName}
              {a.affiliation && ` (${a.affiliation})`}{' '}
              {a.email && <a href={`mailto:${a.email}`}>{a.email}</a>}
            </li>
          ))}
        </ul>
      </ArticleEvaluation>
    )
  }

  if (component === 'LinksInput') {
    return (
      <ArticleEvaluation>
        <ul>
          {value.map(link => (
            <li key={link.url}>
              <a href={link.url}>{link.url}</a>
            </li>
          ))}
        </ul>
      </ArticleEvaluation>
    )
  }

  return <ArticleEvaluation>{value.toString()}</ArticleEvaluation>
}

const getAnnotations = (
  manuscript,
  submissionFields,
  decisionFields,
  reviewFields,
  threadedDiscussions,
) => {
  const fieldInfo = getFieldInfo(
    manuscript,
    submissionFields,
    decisionFields,
    reviewFields,
  )

  const fieldsByOwner = getHypothesisFieldsByOwner(
    manuscript.evaluationsHypothesisMap,
  )

  const annotations = []

  fieldInfo.forEach(({ ownerId, fields, fieldData, label }) => {
    fields.forEach(
      ({ name, component, options, title: fieldTitle, shortDescription }) => {
        const hypothesisValue = fieldsByOwner[ownerId]?.[name]

        if (hypothesisValue) {
          const value = get(fieldData, name)

          if (hypothesisValue.length) {
            const threadedDiscussion =
              threadedDiscussions?.find(d => d.id === value) || []

            // eslint-disable-next-line no-unused-expressions
            threadedDiscussion?.threads?.forEach(thread => {
              thread.comments
                .filter(c => c.commentVersions?.length)
                .forEach(c => {
                  if (hypothesisValue.includes(c.id)) {
                    const author = c.commentVersions[0].userId // TODO get username

                    const { comment } = c.commentVersions[
                      c.commentVersions.length - 1
                    ]

                    annotations.push(
                      generateAnnotation(
                        manuscript.id,
                        `${ownerId}.${name}-${c.id}`,
                        `${label}${shortDescription || fieldTitle} — ${author}`,
                        format(comment, component, options),
                      ),
                    )
                  }
                })
            })
          } else {
            annotations.push(
              generateAnnotation(
                manuscript.id,
                name,
                `${label}${shortDescription || fieldTitle}`,
                format(value, component, options),
              ),
            )
          }
        }
      },
    )
  })

  return annotations
}

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
      evaluationsHypothesisMap: JSON.parse(m.evaluationsHypothesisMap),
    }
  })

  const submissionFields = data.submissionForm?.structure?.children
  const decisionFields = data.decisionForm?.structure?.children
  const reviewFields = data.reviewForm?.structure?.children

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

          // eslint-disable-next-line no-unused-vars
          const annotations = getAnnotations(
            manuscript,
            submissionFields,
            decisionFields,
            reviewFields,
            // TODO pass in threadedDiscussions for this manuscript
          )

          return (
            <SectionContent key={`manuscript-${manuscript.id}`}>
              <SectionHeader>
                <Title>{title}</Title>
              </SectionHeader>
              {/* annotations TODO reinstate when we have time to fix these annotations and links properly */}
              <SectionRow>
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
