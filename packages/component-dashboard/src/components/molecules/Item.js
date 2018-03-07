import styled from 'styled-components'
import { th } from '@pubsweet/ui'

const Item = styled.div`
  margin-bottom: ${th('gridUnit')};
`

const Header = styled.div`
  align-items: baseline;
  display: flex;
  justify-content: space-between;
`

const Body = styled.div`
  align-items: flex-end;
  display: flex;
  justify-content: flex-end;
  margin-bottom: ${th('gridUnit')};
  padding-left: 1.5em;
`

const Divider = styled.span.attrs({
  children: props => ` ${props.separator} `,
})`
  color: ${th('colorFurniture')};
  white-space: pre;
`

export { Item, Header, Body, Divider }
