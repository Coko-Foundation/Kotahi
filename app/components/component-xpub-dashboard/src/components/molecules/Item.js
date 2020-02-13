import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

const Item = styled.div`
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
