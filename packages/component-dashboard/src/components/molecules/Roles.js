import styled from 'styled-components'

const Roles = styled.div`
  display: flex;
  font-size: 0.8em;
  margin-bottom: 0.6em;
  margin-left: 0.5em;
  margin-top: 0;
  padding-left: 1.5em;
  text-transform: uppercase;
`

const Role = styled.div`
  &:not(:last-of-type) {
    margin-right: 3em;
  }
`

export { Roles, Role }
