import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import * as icons from 'react-feather'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

const IconWrapper = styled.div`
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  opacity: 1;
  position: relative;
  border-radius: 6px;
  padding: ${props => (props.noPadding ? '0' : '8px 12px')};

  svg {
    stroke: ${props => props.color || props.theme.colorText};
    width: calc(${props => props.size} * ${th('gridUnit')});
    height: calc(${props => props.size} * ${th('gridUnit')});
  }
`

const Icon = ({
  className,
  children,
  color,
  size = 3,
  noPadding,
  ...props
}) => {
  const name = _.upperFirst(_.camelCase(children))

  return (
    <IconWrapper
      className={className}
      color={color}
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

export default Icon
