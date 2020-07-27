import styled from 'styled-components'
import { grid, th } from '@pubsweet/ui-toolkit'

export const Section = styled.div`
  padding: ${grid(2)} ${grid(3)};
  margin-top: ${grid(2)};
  &:not(:last-of-type) {
    margin-bottom: ${grid(6)};
  }
`

export const Content = styled.div`
  box-shadow: ${th('boxShadow')};
  background-color: ${th('colorBackground')};
  border-radius: ${th('borderRadius')};
`

export const SectionContent = styled(Section)`
  padding: 0;
  box-shadow: ${th('boxShadow')};
  background-color: ${th('colorBackground')};
  border-radius: ${th('borderRadius')};
`

export const PaddedContent = styled(Content)`
  padding: ${grid(2)} ${grid(3)};
  margin-top: ${grid(3)};
  margin-bottom: ${grid(3)};
`

export const Container = styled.div`
  background: ${th('colorBackgroundHue')};
  padding: ${grid(2)};
  overflow-y: scroll;
`

export const Title = styled.h2`
  font-size: ${th('fontSizeHeading5')};
  font-weight: 500;
`

export const SectionHeader = styled.div`
  padding: ${grid(2)} ${grid(3)};
  border-bottom: 1px solid ${th('colorFurniture')};
`

export const SectionRow = styled.div`
  border-bottom: 1px solid ${th('colorFurniture')};
  padding: ${grid(2)} ${grid(3)};
`

export const SectionRowGrid = styled(SectionRow)`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-gap: ${grid(2)};
`

export const SectionAction = styled.div`
  grid-column: 3;
  justify-self: end;
`

const Page = styled.div`
  padding: ${grid(2)};
`

const Heading = styled.div`
  color: ${th('colorPrimary')};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading3')};
  line-height: ${th('lineHeightHeading3')};
`

export { Page, Heading }

export const HeadingWithAction = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
`
