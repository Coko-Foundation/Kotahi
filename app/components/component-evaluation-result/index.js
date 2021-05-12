import React from 'react'
import { useQuery } from '@apollo/client'

import { Container } from '../shared'
import query from '../component-submit/src/userManuscriptFormQuery'

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
        <span>{submission.reviewDate}</span>
      </Heading>
      <p>Peer review</p>
      <ArticleEvaluation
        dangerouslySetInnerHTML={(() => {
          return { __html: evaluationText }
        })()}
      />
      <a href={submission.articleURL}>link to original article</a>
    </Container>
  )
}

export default ArticleEvaluationResultPage
