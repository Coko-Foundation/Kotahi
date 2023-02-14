import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { th, grid } from '@pubsweet/ui-toolkit'

const BaseButton = styled.button`
  border: 2px solid ${th('colorPrimary')};
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
  border: 2px solid ${th('colorFurniture')};
`

const Button = styled(BaseButton)`
  background-color: white;
  box-shadow: 0px 3px 5px 1px rgba(0, 0, 0, 0.2);
  color: ${th('colorPrimary')};

  &:hover,
  &:active,
  &:focus {
    box-shadow: 0px 3px 5px 1px rgba(0, 0, 0, 0.3);
    background-color: rgba(58, 174, 42, 0.03);
  }
`

const LabelOnlySpan = styled.span`
  padding: 0 ${grid(1.5)};
`

const SecondaryActionButton = ({
  disabled,
  onClick,
  children,
  title,
  type,
}) => {
  if (disabled)
    return (
      <DisabledButton disabled>
        <LabelOnlySpan>{children}</LabelOnlySpan>
      </DisabledButton>
    )

  return (
    <Button
      onClick={onClick}
      title={title}
      type={type || 'button'}
      >
        <LabelOnlySpan>{children}</LabelOnlySpan>
    </Button>
  )
}

SecondaryActionButton.propTypes = {
  /** Primary buttons are styled with colorPrimary, unless another color is specified */
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  /** 'pending' will show a spinner; 'success' will show a tick; 'failure' will show a warning icon and change the color to colorWarning */
  status: PropTypes.string,
  title: PropTypes.string,
  type: PropTypes.string,
  children: PropTypes.node.isRequired,
}

SecondaryActionButton.defaultProps = {
  disabled: false,
  onClick: () => null,
  status: null,
  title: null,
  type: 'button',
}

export default SecondaryActionButton
