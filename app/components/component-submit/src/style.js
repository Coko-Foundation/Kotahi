import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'

export { Container, Content, Heading } from '../../shared'

export const Heading1 = styled.h1`
  margin: 0 0 calc(${th('gridUnit')} * 3);
  font-size: ${th('fontSizeHeading3')};
  line-height: ${th('lineHeightHeading3')};
`

export const Section = styled.div`
  margin: calc(${th('gridUnit')} * 6) 0;
  display: flex;
  flex-direction: ${({ cssOverrides }) =>
    cssOverrides && cssOverrides['flex-direction']
      ? cssOverrides['flex-direction']
      : 'column'};
  flex-wrap: ${({ cssOverrides }) =>
    cssOverrides && cssOverrides.wrap ? cssOverrides.wrap : 'nowrap'};
  justify-content: space-between;
`

export const Legend = styled.div`
  font-size: ${th('fontSizeBase')};
  font-weight: 600;
  margin-bottom: ${({ space, theme }) => space && theme.gridUnit};
`
export const SubNote = styled.span`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  color: ${th('colorTextPlaceholder')};
  width: 100%;
`

export const UploadContainer = styled.div`
  margin-top: ${grid(2)};
  padding: ${grid(3)};
  text-align: center;
`
