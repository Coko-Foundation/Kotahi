import styled from 'styled-components'

export const Heading1 = styled.h1`
  margin: 0 0 var(--grid-unit);
  font-size: var(--font-size-heading-1);
`

export const Section = styled.div`
  margin: calc(var(--grid-unit) * 2) 0;
`

export const Legend = styled.div`
  font-size: var(--font-size-base);
  font-weight: 600;
  margin-bottom: ${({ space }) => space && `var(--sub-grid-unit)`};
`
