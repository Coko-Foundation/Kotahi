import React from 'react'
import styled, { useTheme } from 'styled-components'
import * as icons from 'react-feather'
import ActionButton from './ActionButton'

const RoundButton = styled(ActionButton)`
  align-items: center;
  border-radius: 50%;
  height: 40px;
  line-height: 0;
  padding: 0;
  width: 40px;

  span {
    padding: 0;
  }
`

const RoundIconButton = ({
  className,
  disabled,
  iconName,
  onClick,
  primary,
  title,
}) => {
  const theme = useTheme()
  const Icon = icons[iconName]
  return (
    <RoundButton
      className={className}
      disabled={disabled}
      isCompact
      onClick={onClick}
      primary={primary}
      title={title}
    >
      {Icon && (
        <Icon
          color={primary ? theme.colorTextReverse : theme.colorText}
          size={18}
          strokeWidth={3}
        />
      )}
    </RoundButton>
  )
}

export default RoundIconButton
