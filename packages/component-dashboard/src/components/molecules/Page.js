import styled from 'styled-components'

const Page = styled.div`
  margin: auto;
  max-width: 60em;
`

const Section = styled.div`
  margin: var(--grid-unit) 0;

  &:not(:last-of-type) {
    margin-bottom: calc(var(--grid-unit) * 2);
  }
`

const Heading = styled.div`
  color: var(--color-primary);
  font-family: var(--font-heading);
  font-size: var(--font-size-heading-3);
  margin: var(--grid-unit) 0;
`

const UploadContainer = styled.div`
  display: flex;
  justify-content: center;
`

export { Page, Section, Heading, UploadContainer }
