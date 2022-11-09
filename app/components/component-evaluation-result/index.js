import React from 'react'
import { useQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import { sanitize } from 'dompurify'

import { Container } from '../shared'
import query from './reviewQuery'

import { Heading, ArticleEvaluation } from './style'

const ArticleEvaluationResultPage = ({ match }) => {
  const { data, loading } = useQuery(query, {
    variables: { id: match.params.version },
  })

  if (loading) return null
  const submission = JSON.parse(data?.manuscript?.submission)
  const evaluationText = submission[`review${match.params.evaluationNumber}`]
  return (
    <Container>
      <Heading>
        <h2>{submission.description}</h2>
        <span>{submission[`review${match.params.evaluationNumber}date`]}</span>
      </Heading>
      <p>Peer review</p>
      <ArticleEvaluation
        dangerouslySetInnerHTML={(() => {
          return { __html: sanitize(evaluationText) }
        })()}
      />
      <a href={submission.articleURL}>link to original article</a>
    </Container>
  )
}

ArticleEvaluationResultPage.propTypes = {
  // eslint-disable-next-line
  match: PropTypes.object.isRequired,
}

export default ArticleEvaluationResultPage
