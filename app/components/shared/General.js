import styled, { css } from 'styled-components'
import { grid, th } from '@pubsweet/ui-toolkit'

export const Section = styled.section`
  padding: ${grid(2)} ${grid(3)};
  // margin-top: ${grid(2)};
  &:not(:last-of-type) {
    // margin-bottom: ${grid(6)};
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
  &:not(:first-of-type) {
    margin-top: ${grid(3)};
  }
  border-radius: ${({ noGap }) =>
    noGap
      ? css`0 ${th('borderRadius')} ${th('borderRadius')}`
      : th('borderRadius')};
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

export const ClickableSectionRow = styled(SectionRow)`
  color: ${th('colorText')};
  :last-of-type {
    border-radius: 0 0 ${th('borderRadius')} ${th('borderRadius')};
  }
  &:hover {
    cursor: pointer;
    background-color: ${th('colorBackgroundHue')};

    svg {
      stroke: ${th('colorPrimary')};
    }
  }
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

export const SectionActionInfo = styled.div`
  line-height: ${grid(5)};
  grid-column: 1 / span 2;
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
  grid-gap: ${grid(2)};
  align-items: center;
`

export const Columns = styled.div`
  display: grid;
  // grid-column-gap: 2em;
  grid-template-areas: 'manuscript chat';
  grid-template-columns: 3fr 2fr;
  justify-content: center;
  overflow: hidden;
  height: 100vh;
`

export const Manuscript = styled.div`
  grid-area: manuscript;
  overflow-y: scroll;
  background: ${th('colorBackgroundHue')};
  padding: ${grid(2)};
`

export const Chat = styled.div`
  border-left: 1px solid ${th('colorFurniture')};
  grid-area: chat;
  height: 100vh;
  // overflow-y: scroll;
  display: flex;
`
