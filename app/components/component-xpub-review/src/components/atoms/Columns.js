import styled from 'styled-components'

const Columns = styled.div`
  display: grid;
  // grid-column-gap: 2em;
  grid-template-areas: 'manuscript chat';
  grid-template-columns: 3fr 2fr;
  justify-content: center;
  overflow: hidden;
  height: 100vh;
`

const Manuscript = styled.div`
  grid-area: manuscript;
  overflow-y: scroll;
`

const Chat = styled.div`
  border-left: 1px solid black;
  grid-area: chat;
  height: 100vh;
  // overflow-y: scroll;
  display: flex;
`

export { Columns, Manuscript, Chat }
