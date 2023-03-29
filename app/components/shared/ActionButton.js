import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import PropTypes from 'prop-types'
import Color from 'color'
import { Check, AlertCircle } from 'react-feather'
import { th, grid, rotate360 } from '@pubsweet/ui-toolkit'

const BaseButton = styled.button`
  border: none;
  border-radius: ${th('borderRadius')};
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  font-weight: 500;
  line-height: ${th('lineHeightBase')};
  min-height: ${grid(3)};
  min-width: ${grid(5)};
  ${props =>
    props.isCompact
      ? ''
      : `
          min-height: 40px;
          min-width: 128px;
        `}
`

const DisabledButton = styled(BaseButton)`
  background-color: ${th('colorFurniture')};
  color: ${th('colorBorder')};
`

const Button = styled(BaseButton)`
  background-color: ${props =>
    props.bgColor ||
    (props.primary ? th('colorPrimary') : th('colorFurniture'))};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  color: ${props =>
    props.fgColor ||
    (props.primary ? th('colorText') : th('colorTextReverse'))};

  ${props =>
    props.onClick
      ? `
  &:hover {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3),
      inset 0 0 1000px rgba(255, 255, 255, 0.15);
  }

  &:active {
    box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.2),
      inset 0 0 1000px rgba(255, 255, 255, 0.15);
  }
  `
      : ''}
`

const LabelOnlySpan = styled.span`
  padding: 0 ${grid(1.5)};
`

const Spinner = styled.div`
  display: inline-block;
  padding-left: ${grid(1)};
  vertical-align: -2px;

  &:after {
    animation: ${rotate360} 1s linear infinite;
    border: 2.5px solid ${props => props.fgColor};
    border-color: ${props => props.fgColor} transparent
      ${props => props.fgColor} transparent;
    border-radius: 50%;
    box-sizing: border-box;
    content: '';
    display: block;
    height: ${grid(2)};
    width: ${grid(2)};
  }
`

const IconContainer = styled.div`
  display: inline-block;
  height: ${grid(2)};
  margin-left: ${grid(1)};
  vertical-align: -2px;
  width: ${grid(2)};
`

/** A styled button with optional status icon/spinner and optional color. Supported statuses are 'pending', 'success', 'failure'. */
const ActionButton = ({
  primary,
  disabled,
  onClick,
  status,
  color,
  isCompact,
  children,
  className,
  dataTestid,
  title,
  type,
  dataCy,
}) => {
  if (disabled)
    return (
      <DisabledButton className={className} disabled isCompact={isCompact}>
        <LabelOnlySpan>{children}</LabelOnlySpan>
      </DisabledButton>
    )

  const themeContext = useContext(ThemeContext)
  let bgColor = primary
    ? themeContext.colorPrimary
    : themeContext.colorFurniture
  if (status === 'failure') bgColor = themeContext.colorWarning
  else if (color) bgColor = color

  let isLight = true

  try {
    isLight = Color(bgColor).isLight()
    // eslint-disable-next-line no-empty
  } catch {
    bgColor = themeContext.colorFurniture
  }

  const fgColor = isLight
    ? themeContext.colorText
    : themeContext.colorTextReverse

  let statusIndicator = null
  if (status === 'pending') statusIndicator = <Spinner fgColor={fgColor} />
  if (status === 'success')
    statusIndicator = (
      <IconContainer>
        <Check
          color={fgColor}
          data-testid="check-svg"
          size={16}
          strokeWidth={3}
        />
      </IconContainer>
    )
  if (status === 'failure')
    statusIndicator = (
      <IconContainer>
        <AlertCircle color={fgColor} size={16} strokeWidth={3} />
      </IconContainer>
    )

  return (
    <Button
      bgColor={bgColor}
      className={className}
      data-testid={dataTestid}
      fgColor={fgColor}
      isCompact={isCompact}
      onClick={status !== 'pending' ? onClick : null}
      primary={primary}
      title={title}
      type={type || 'button'}
    >
      {statusIndicator ? (
        <>
          {children}
          {statusIndicator}
        </>
      ) : (
        <LabelOnlySpan>{children}</LabelOnlySpan>
      )}
    </Button>
  )
}

ActionButton.propTypes = {
  /** Primary buttons are styled with colorPrimary, unless another color is specified */
  primary: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  /** 'pending' will show a spinner; 'success' will show a tick; 'failure' will show a warning icon and change the color to colorWarning */
  status: PropTypes.string,
  /** Optional button color. This will be overridden if status is 'failure' */
  color: PropTypes.string,
  /** Tries to make the button smaller (subject to content size). */
  isCompact: PropTypes.bool,
  children: PropTypes.node.isRequired,
}

ActionButton.defaultProps = {
  primary: false,
  disabled: false,
  onClick: () => null,
  status: null,
  color: null,
  isCompact: false,
}

export default ActionButton
