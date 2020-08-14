import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import * as icons from 'react-feather'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

const IconWrapper = styled.div`
  display: ${({ inline }) => (inline ? 'inline-flex' : 'flex')};
  align-items: center;
  justify-content: center;
  opacity: 1;
  position: relative;
  border-radius: 6px;
  padding: ${props => (props.noPadding || props.inline ? '0' : '8px 12px')};

  svg {
    stroke: ${props => props.color || props.theme.colorText};
    width: calc(${props => props.size} * ${th('gridUnit')});
    height: calc(${props => props.size} * ${th('gridUnit')});
  }
`

export const Icon = ({
  className,
  children,
  color,
  size = 3,
  noPadding,
  inline,
  ...props
}) => {
  const name = _.upperFirst(_.camelCase(children))

  return (
    <IconWrapper
      className={className}
      color={color}
      inline={inline}
      noPadding={noPadding}
      role="img"
      size={size}
    >
      {icons[name]({})}
    </IconWrapper>
  )
}

Icon.defaultProps = {
  size: 3,
  color: '#111',
}

Icon.propTypes = {
  children: PropTypes.string.isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
}
