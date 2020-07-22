import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'

export { Container, Section, Content } from '../../shared'
const Actions = styled.div``

const ActionContainer = styled.div`
  display: inline-block;
`

export { Actions, ActionContainer }

const Item = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  margin-bottom: calc(${th('gridUnit') * 4});
`

const Header = styled.div`
  align-items: baseline;
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;
`

const Body = styled.div`
  align-items: space-between;
  display: flex;
  justify-content: space-between;
  margin-bottom: calc(${th('gridUnit')} * 4);
  padding-left: 1.5em;
  & > div:last-child {
    flex-shrink: 0;
  }
`

const Divider = styled.span.attrs(props => ({
  children: ` ${props.separator} `,
}))`
  color: ${th('colorFurniture')};
  white-space: pre;
`

export { Item, Header, Body, Divider }

const Links = styled.div`
  align-items: flex-end;
  display: flex;
  justify-content: bottom;
`

const LinkContainer = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

export { Links, LinkContainer }

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

export { StatusBadge } from '../../shared'

export const Placeholder = styled.div`
  display: grid;
  place-items: center;
  color: ${th('colorTextPlaceholder')};
  height: 100%;
  padding: 4em;
`
