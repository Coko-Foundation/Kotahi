/* eslint-disable react/prop-types */

import React, { useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import Action from '../Action'

const GET_PAPER_BY_DOI = gql`
  query getPaperByDOI($doi: String!) {
    paperByDOI(doi: $doi) {
      id
      doi
      created
      updated
      abstract
      title
      authors
    }
  }
`

const PaperStyled = styled.div`
  border: 1px solid ${th('colorBorder')};
  padding: 24px;
`

const PaperHeading = styled.div`
  font-weight: bold;
`

const PaperAuthors = styled.p`
  font-style: italic;
`

const PaperAbstract = styled.p``

const PaperEmbed = ({ doi, ...props }) => {
  const [readMore, setReadMore] = useState(false)

  const { data, loading, error } = useQuery(GET_PAPER_BY_DOI, {
    variables: { doi },
  })

  if (loading) return 'Loading...'
  if (error) return 'Error!'

  return (
    <PaperStyled>
      <PaperHeading>{data.paperByDOI.title}</PaperHeading>
      <PaperAuthors>{data.paperByDOI.authors}</PaperAuthors>
      {data.paperByDOI.abstract && (
        <>
          <PaperAbstract readMore={readMore}>
            {readMore
              ? data.paperByDOI.abstract
              : `${data.paperByDOI.abstract
                  .split(' ')
                  .slice(0, 30)
                  .join(' ')}...`}
          </PaperAbstract>
          <Action onClick={() => setReadMore(!readMore)}>
            {readMore ? 'See less' : 'Read more'}
          </Action>
        </>
      )}
    </PaperStyled>
  )
}

export default PaperEmbed
