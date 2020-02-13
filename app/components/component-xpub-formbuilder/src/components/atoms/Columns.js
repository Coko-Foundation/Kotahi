import styled from 'styled-components'

const Columns = styled.div`
  display: grid;
  grid-column-gap: 2em;
  grid-template-areas: 'manuscript admin';
  grid-template-columns: minmax(200px, 70ch) minmax(200px, 60ch);
  justify-content: center;
`

const Manuscript = styled.div`
  grid-area: manuscript;
`

const Admin = styled.div`
  grid-area: admin;

  border-left: 1px solid black;
  padding-left: 40px;
`

export { Columns, Manuscript, Admin }
