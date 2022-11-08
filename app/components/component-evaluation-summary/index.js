import React from 'react'
import { useQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import { sanitize } from 'dompurify'

import { Container } from '../shared'
import query from '../component-evaluation-result/reviewQuery'

import {
  Heading,
  ArticleEvaluation,
} from '../component-evaluation-result/style'

const ArticleEvaluationSummaryPage = ({ match }) => {
  const { data, loading } = useQuery(query, {
    variables: { id: match.params.version },
  })

  if (loading) return null
  const submission = JSON.parse(data?.manuscript?.submission)
  const evaluationText = submission.summary
  return (
    <Container>
      <Heading>
        <h2>{submission.description}</h2>
        <span>{submission.summarydate}</span>
      </Heading>
      <p>Evaluation summary</p>
      <ArticleEvaluation
        dangerouslySetInnerHTML={(() => {
          return { __html: sanitize(evaluationText) }
        })()}
      />
      <a href={submission.articleURL}>link to original article</a>
    </Container>
  )
}

ArticleEvaluationSummaryPage.propTypes = {
  // eslint-disable-next-line
  match: PropTypes.object.isRequired,
}

export default ArticleEvaluationSummaryPage
