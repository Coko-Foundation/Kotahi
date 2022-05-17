import styled, { css } from 'styled-components'
import { th, darken } from '@pubsweet/ui-toolkit'
import { Button } from '@pubsweet/ui'
import lightenBy from '../../../../shared/lightenBy'

export const Section = styled.div`
  margin: calc(${th('gridUnit')} * 6) 0;
`

export const Legend = styled.div`
  font-size: ${th('fontSizeBase')};
  font-weight: 600;
  margin-bottom: ${({ space, theme }) => space && theme.gridUnit};
`

const Columns = styled.div`
  display: grid;
  grid-column-gap: 2em;
  grid-template-areas: 'form details';
  grid-template-columns: 1fr 1fr;
  justify-content: center;
`

const Form = styled.div`
  grid-area: form;
`

const Details = styled.div`
  grid-area: details;
  margin-top: 48px;
`

const Page = styled.div`
  position: relative;
  z-index: 0;
`

const Heading = styled.div`
  color: ${th('colorPrimary')};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading3')};
  margin: ${th('gridUnit')} 0;
  text-transform: uppercase;
`

const UploadContainer = styled.div`
  display: flex;
  justify-content: center;
`

const DetailText = styled.div`
  color: ${lightenBy('colorText', 0.3)};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

const DateWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-left: 30px;
  width: 110px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const CommentMetaWrapper = styled.div`
  align-items: center;
  display: flex;
  @media (max-width: 768px) {
    align-items: flex-start;
    flex-direction: column;
  }
`

const UserMetaWrapper = styled.div`
  align-items: center;
  display: flex;
`

const UserName = styled.span`
  margin-bottom: 0px;
`

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  width: 280px;
`

const ModalContainer = styled.div`
  background: ${th('colorBackground')};
  padding: 20px 24px;
  z-index: 9999;

  p {
    font-family: ${th('fontWriting')};
    font-size: ${th('fontSizeBase')};
  }
`

const SimpleWaxEditorWrapper = styled.div`
  margin-top: 10px;
  ${props =>
    props.collapse
      ? css`
          height: 100px;
          overflow: hidden;
        `
      : css`
          height: 100%;
          overflow: none;
        `};

  .wax-surface-scroll {
    overflow: hidden;
  }

  p {
    font-family: ${th('fontWriting')};
    font-size: ${th('fontSizeBase')};
    margin: 0px;
  }
  padding-bottom: 20px;
  position: relative;
`

const CollapseOverlay = styled.div`
  bottom: 0px;
  height: 50px;
  ${props =>
    props.collapse
      ? css`
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0) -100%,
            #ffffff 100.32%
          );
        `
      : css`
          background: transparent;
        `};
  position: absolute;
  width: 100%;
`

const CommentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`

const Collapse = styled.div`
  display: flex;
`

const ActionWrapper = styled.div`
  display: flex;
  justify-content: flex-end;

  svg {
    stroke: ${th('colorIconPrimary')};
  }
`

const CancelButton = styled(Button)`
  background-color: ${th('colorFurniture')};
  padding: 8px;
  text-decoration: none;

  &:hover {
    background-color: ${darken('colorFurniture', 0.1)};
  }
`

const CommentContainer = styled.div`
  border-bottom: 1px ${th('borderStyle')} ${th('colorContainerBorder')};
  padding-bottom: 25px;
`

export {
  Columns,
  Form,
  Details,
  Page,
  Heading,
  UploadContainer,
  DetailText,
  DateWrapper,
  CommentMetaWrapper,
  UserMetaWrapper,
  UserName,
  ButtonWrapper,
  ModalContainer,
  SimpleWaxEditorWrapper,
  CollapseOverlay,
  CommentWrapper,
  ActionWrapper,
  Collapse,
  CancelButton,
  CommentContainer,
}
