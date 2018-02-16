import styled from 'styled-components'

const Tab = styled.div`
  padding: var(--sub-grid-unit) 1em;
  font-size: var(--font-size-base-small);
  border-width: 0 var(--border-width) var(--border-width) 0;
  border-style: var(--border-style);
  border-color: ${({ active }) =>
    active ? 'var(--color-primary)' : 'var(--color-border)'};
`

export default Tab
