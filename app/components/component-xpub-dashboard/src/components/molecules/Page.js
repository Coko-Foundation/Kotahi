import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

const Page = styled.div`
  margin: auto;
  max-width: 60em;
`

const Section = styled.div`
  margin: calc(${th('gridUnit')} * 3) 0;

  &:not(:last-of-type) {
    margin-bottom: calc(${th('gridUnit')} * 6);
  }
`

const Heading = styled.div`
  color: ${th('colorPrimary')};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading3')};
  line-height: ${th('lineHeightHeading3')};
  margin: calc(${th('gridUnit')} * 3) 0;
  text-transform: uppercase;
`

const UploadContainer = styled.div`
  display: flex;
  justify-content: center;
`

export { Page, Section, Heading, UploadContainer }
