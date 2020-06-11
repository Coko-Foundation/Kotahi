import styled from 'styled-components'

const Columns = styled.div`
  display: grid;
  grid-column-gap: 2em;
  grid-template-areas: 'manuscript chat';
  grid-template-columns: minmax(200px, 80ch) minmax(200px, 50ch);
  justify-content: center;
`

const Manuscript = styled.div`
  grid-area: manuscript;
`

const Chat = styled.div`
  grid-area: chat;
`

export { Columns, Manuscript, Chat }
