import styled from 'styled-components'

const Columns = styled.div`
  display: grid;
  grid-column-gap: 2em;
  grid-template-areas: 'form details';
  grid-template-columns: minmax(200px, 70ch) minmax(200px, 60ch);
  justify-content: center;
  overflow-y: scroll;
`

const Form = styled.div`
  grid-area: form;
`

const Details = styled.div`
  grid-area: details;

  border-left: 1px solid black;
  padding-left: 40px;
`

export { Columns, Form, Details }
