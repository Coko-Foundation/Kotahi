import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'

export { Container, Content, Heading } from '../../shared'

export const Heading1 = styled.h1`
  font-size: ${th('fontSizeHeading3')};
  line-height: ${th('lineHeightHeading3')};
  margin: 0 0 calc(${th('gridUnit')} * 3);
`

export const Section = styled.div`
  display: flex;
  flex-direction: ${({ cssOverrides }) =>
    cssOverrides && cssOverrides['flex-direction']
      ? cssOverrides['flex-direction']
      : 'column'};
  flex-wrap: ${({ cssOverrides }) =>
    cssOverrides && cssOverrides.wrap ? cssOverrides.wrap : 'nowrap'};
  justify-content: space-between;
  margin: calc(${th('gridUnit')} * 6) 0;
`

export const Legend = styled.div`
  font-size: ${th('fontSizeBase')};
  font-weight: 600;
  margin-bottom: ${({ space, theme }) => space && theme.gridUnit};
`

export const SubNote = styled.span`
  color: ${th('colorTextPlaceholder')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  width: 100%;

  & h1 {
    font-size: 1.75em;
    font-weight: 500;
    margin: 1em 0;
  }

  & h2 {
    font-size: 1.625em;
    font-weight: 500;
    margin: 1em 0;
  }

  & h3 {
    font-size: 1.5em;
    font-weight: 500;
    margin: 1em 0;
  }

  & h4 {
    font-size: 1.375em;
    font-weight: 500;
    margin: 1em 0;
  }

  & h5 {
    font-size: 1.25em;
    font-weight: 500;
    margin: 1em 0;
  }

  & h6 {
    font-size: 1.125em;
    font-weight: 500;
    margin: 1em 0;
  }

  & p {
    margin-bottom: 1em;
  }

  & ul,
  & ol {
    list-style: outside;
    padding-left: 30px;

    & li p {
      margin: 0.2em 0;
    }

    & li:last-child p {
      margin-bottom: 0.5em;
    }
  }

  & u {
    text-decoration: underline;
  }

  & strong {
    font-weight: bold;
  }

  & em {
    font-style: italic;
  }

  & blockquote {
    border-left: 3px solid #eee;
    margin-left: 0;
    margin-right: 0;
    padding-left: 1em;
  }

  & sup,
  & sub {
    line-height: 0;
  }

  & .small-caps {
    font-variant: small-caps;
  }

  & a {
    color: blue;
  }
`

export const UploadContainer = styled.div`
  margin-top: ${grid(2)};
  padding: ${grid(3)};
  text-align: center;
`
