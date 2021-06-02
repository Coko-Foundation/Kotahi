import styled from 'styled-components'

export const Heading = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`

export const ArticleEvaluation = styled.div`
  margin-bottom: 10px;
  margin-top: 10px;
  & ul,
  ol {
    display: block;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    padding-inline-start: 40px;
  }

  & ul {
    list-style-type: disc;
  }

  & ol {
    list-style-type: decimal;
  }
`
