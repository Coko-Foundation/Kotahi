import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'

const Page = styled.div`
  padding: ${grid(2)};
`

const Section = styled.div`
  margin: ${grid(3)} 0;

  &:not(:last-of-type) {
    margin-bottom: ${grid(6)};
  }
`

const Heading = styled.div`
  color: ${th('colorPrimary')};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading3')};
  line-height: ${th('lineHeightHeading3')};
  margin: ${grid(3)} 0;
  text-transform: uppercase;
`

const UploadContainer = styled.div`
  display: flex;
  justify-content: center;
`

export { Page, Section, Heading, UploadContainer }
