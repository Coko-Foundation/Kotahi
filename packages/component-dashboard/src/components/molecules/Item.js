import styled from 'styled-components'

const Item = styled.div`
  margin-bottom: var(--grid-unit);
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
  margin-bottom: var(--grid-unit);
  padding-left: 1.5em;
`

const Divider = styled.span.attrs({
  children: props => ` ${props.separator} `,
})`
  color: var(--color-furniture);
  white-space: pre;
`

export { Item, Header, Body, Divider }
