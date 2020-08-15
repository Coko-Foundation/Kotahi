import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

export const Section = styled.div`
  margin: calc(${th('gridUnit')} * 6) 0;
`

export const Legend = styled.div`
  font-size: ${th('fontSizeBase')};
  font-weight: 600;
  margin-bottom: ${({ space, theme }) => space && theme.gridUnit};
`

const Columns = styled.div`
  display: grid;
  grid-column-gap: 2em;
  grid-template-areas: 'form details';
  grid-template-columns: 1fr 1fr;
  justify-content: center;
`

const Form = styled.div`
  grid-area: form;
`

const Details = styled.div`
  grid-area: details;
  margin-top: 48px;
`

export { Columns, Form, Details }

const Page = styled.div``

// const Section = styled.div`
//   margin: ${th('gridUnit')} 0;

//   &:not(:last-of-type) {
//     margin-bottom: calc(${th('gridUnit')} * 2);
//   }
// `

const Heading = styled.div`
  color: ${th('colorPrimary')};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading3')};
  margin: ${th('gridUnit')} 0;
  text-transform: uppercase;
`

const UploadContainer = styled.div`
  display: flex;
  justify-content: center;
`

export { Page, Heading, UploadContainer }
