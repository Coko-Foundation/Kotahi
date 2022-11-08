import React from 'react'
import { useQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import { get } from 'lodash'
import { sanitize } from 'dompurify'

import { Container } from '../shared'
import query from './reviewQuery'
import CommsErrorBanner from '../shared/CommsErrorBanner'

import { Heading, ArticleEvaluation } from './style'
import getEvaluationFieldTitle from '../component-frontpage/src/getEvaluationFieldTitle'

const ArticleEvaluationPage = ({ match }) => {
  const { data, loading, error } = useQuery(query, {
    variables: { id: match.params.version },
  })

  if (loading) return null
  if (error) return <CommsErrorBanner error={error} />

  let fieldName

  if (match.params.fieldNameB) {
    if (match.params.fieldNameA === 'review')
      fieldName = `${match.params.fieldNameA}#${match.params.fieldNameB}`
    else fieldName = `${match.params.fieldNameA}.${match.params.fieldNameB}`
  } else fieldName = match.params.fieldNameA

  const manuscript = {
    ...data.manuscript,
    submission: JSON.parse(data.manuscript.submission),
  }

  let evaluationText
  let date

  if (fieldName === 'decision') {
    const decisions = manuscript.reviews.filter(
      r => r.isDecision && r.decisionComment,
    )

    evaluationText =
      decisions.length > 0 ? decisions[0].decisionComment.content : ''
    date = evaluationText ? decisions[0].updated : null
  } else if (fieldName.startsWith('review#')) {
    const reviews = manuscript.reviews.filter(
      r => !r.isDecision && r.canBePublishedPublicly && r.reviewComment,
    )

    const index = parseInt(fieldName.split('#')[1], 10)
    evaluationText =
      reviews.length > index ? reviews[index].reviewComment.content : ''
    date = evaluationText ? reviews[0].updated : null
  } else {
    evaluationText = get(manuscript, fieldName)
    const dateFieldName = `${fieldName}date` // This field may or may not be present
    date = get(manuscript, dateFieldName) || null
  }

  const title =
    manuscript.meta.title ||
    manuscript.submission.title ||
    manuscript.submission.description

  const fieldTitle = getEvaluationFieldTitle(
    fieldName,
    data.formForPurposeAndCategory,
  )

  const articleLink =
    manuscript.submission.articleURL || manuscript.submission.link

  return (
    <Container>
      <Heading>
        <h2>{title}</h2>
        {date && <span>{date}</span>}
      </Heading>
      <p>{fieldTitle}</p>
      <ArticleEvaluation
        dangerouslySetInnerHTML={(() => {
          return { __html: sanitize(evaluationText) }
        })()}
      />
      {articleLink && <a href={articleLink}>link to original article</a>}
    </Container>
  )
}

ArticleEvaluationPage.propTypes = {
  // eslint-disable-next-line
  match: PropTypes.object.isRequired,
}

export default ArticleEvaluationPage
