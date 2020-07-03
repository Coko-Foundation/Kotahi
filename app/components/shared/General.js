import styled from 'styled-components'
import { grid } from '@pubsweet/ui-toolkit'

export const Section = styled.div`
  padding: ${grid(2)} ${grid(3)};
  margin-top: ${grid(3)};
  &:not(:last-of-type) {
    margin-bottom: ${grid(6)};
  }
`
