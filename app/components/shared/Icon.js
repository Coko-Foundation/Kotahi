import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import * as icons from 'react-feather'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

const IconWrapper = styled.div`
  align-items: center;
  border-radius: 6px;
  display: ${({ inline }) => (inline ? 'inline-flex' : 'flex')};
  justify-content: center;
  opacity: 1;
  padding: ${props => (props.noPadding || props.inline ? '0' : '8px 12px')};
  position: relative;
  top: ${props => props.top || 0};

  svg {
    height: calc(${props => props.size} * ${th('gridUnit')});
    stroke: ${props => props.color || props.theme.colorText};
    width: calc(${props => props.size} * ${th('gridUnit')});
  }
`

/* eslint-disable import/prefer-default-export */
export const Icon = ({
  className,
  children,
  color,
  size = 3,
  noPadding,
  inline,
  top,
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
      top={top}
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
