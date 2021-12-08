import styled from 'styled-components'
import { grid, th } from '@pubsweet/ui-toolkit'
import { TabsContainer } from './Tabs'

export const Section = styled.section`
  padding: ${grid(2)} ${grid(3)};
`

export const Content = styled.div`
  background-color: ${th('colorBackground')};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
  clear: both;
`

export const ScrollableContent = styled(Content)`
  @media (max-width: 1400px) {
    margin-top: ${grid(2)};
    overflow-x: scroll;
  }
`

export const SectionContent = styled(Section)`
  background-color: ${th('colorBackground')};
  border-radius: ${th('borderRadius')};
  border-top-left-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
  margin-bottom: ${grid(2)};
  margin-top: ${grid(2)};
  padding: 0;

  /* stylelint-disable-next-line */
  ${TabsContainer} + & {
    border-top-left-radius: 0;
    margin-bottom: calc(${th('gridUnit')} * 3);
    margin-top: 0;
  }
`

export const PaddedContent = styled(Content)`
  margin-bottom: ${grid(3)};
  margin-top: ${grid(3)};
  padding: ${grid(2)} ${grid(3)};
`

export const Container = styled.div`
  background: ${th('colorBackgroundHue')};
  overflow-y: scroll;
  padding: ${grid(2)};
`

export const Title = styled.h2`
  font-size: ${th('fontSizeHeading5')};
  font-weight: 500;
`

export const SectionHeader = styled.div`
  border-bottom: 1px solid ${th('colorFurniture')};
  padding: ${grid(2)} ${grid(3)};
`

export const SectionRow = styled.div`
  border-bottom: 1px solid ${th('colorFurniture')};
  padding: ${grid(2)} ${grid(3)};
`

export const ClickableSectionRow = styled(SectionRow)`
  color: ${th('colorText')};

  :last-of-type {
    border-radius: 0 0 ${th('borderRadius')} ${th('borderRadius')};
  }

  &:hover {
    background-color: ${th('colorBackgroundHue')};
    cursor: pointer;

    svg {
      stroke: ${th('colorPrimary')};
    }
  }
`
export const SectionRowGrid = styled(SectionRow)`
  display: grid;
  grid-gap: ${grid(2)};
  grid-template-columns: repeat(3, minmax(0, 1fr));
`

export const SectionAction = styled.div`
  grid-column: 3;
  justify-self: end;
`

export const SectionActionInfo = styled.div`
  grid-column: 1 / span 2;
  line-height: ${grid(5)};
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
  align-items: center;
  display: grid;
  grid-gap: ${grid(2)};
  grid-template-columns: 1fr auto;
`

export const Columns = styled.div`
  display: grid;
  grid-template-areas: 'manuscript chat';
  grid-template-columns: 3fr 2fr;
  height: 100vh;
  justify-content: center;
  overflow: hidden;
`

export const Manuscript = styled.div`
  background: ${th('colorBackgroundHue')};
  grid-area: manuscript;
  overflow-y: scroll;
  padding: ${grid(2)};
`

export const Chat = styled.div`
  border-left: 1px solid ${th('colorFurniture')};
  display: flex;
  grid-area: chat;
  height: 100vh;
`
