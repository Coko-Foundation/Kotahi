import styled from 'styled-components'

const TeamTable = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 0 3px 0;
  padding: 0;
`

const TeamTableCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex-grow: 1;
  padding: 20px 10px 0 0;
  list-style: none;
  border: solid @bw white;
  background: fade(slategrey, 20%);
  width: ${props => props.width || 20}%;
  > h4 {
    margin: 0;
  }
`

export { TeamTable, TeamTableCell }
