import React from 'react'
import { useQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import { get } from 'lodash'

import { Container } from '../shared'
import query from './reviewQuery'
import CommsErrorBanner from '../shared/CommsErrorBanner'

import { Heading, ArticleEvaluation } from './style'

const ArticleEvaluationPage = ({ match }) => {
  const { data, loading, error } = useQuery(query, {
    variables: { id: match.params.version },
  })

  if (loading) return null
  if (error) return <CommsErrorBanner error={error} />

  const fieldName = match.params.fieldNameB
    ? `${match.params.fieldNameA}.${match.params.fieldNameB}`
    : match.params.fieldNameA

  const manuscript = {
    ...data.manuscript,
    submission: JSON.parse(data.manuscript.submission),
  }

  const evaluationText = get(manuscript, fieldName)

  const title =
    manuscript.meta.title ||
    manuscript.submission.title ||
    manuscript.submission.description

  const fieldTitle =
    data.formForPurpose.structure.children.find(f => f.name === fieldName)
      ?.title || fieldName

  const dateFieldName = `${fieldName}date` // This field may or may not be present
  const date = get(manuscript, dateFieldName) || null

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
          return { __html: evaluationText }
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
