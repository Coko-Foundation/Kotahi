import styled from 'styled-components'

const Columns = styled.div`
  display: grid;
  grid-column-gap: 2em;
  grid-template-areas: 'SubmissionVersion Review';
  grid-template-columns: minmax(200px, 80ch) minmax(200px, 50ch);
  justify-content: center;
`

const SubmissionVersion = styled.div`
  grid-area: SubmissionVersion;
`

const Review = styled.div`
  grid-area: Review;
`

export { Columns, SubmissionVersion, Review }
