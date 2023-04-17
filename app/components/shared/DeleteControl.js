import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Icon } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import theme from '../../theme'

const DeleteButton = styled.button`
  align-items: center;
  background: ${th('colors.brand1.base')};
  border: none;
  border-radius: 500px;
  display: inline-flex;
  height: 30px;
  justify-content: center;
  position: relative;
  vertical-align: top;
  width: 30px;

  &:hover {
    background-color: ${th('colors.brand1.tint10')};
    cursor: pointer;
  }
`

const DeleteControl = ({ onClick, tooltip }) => (
  <DeleteButton onClick={onClick} title={tooltip} type="button">
    <Icon color={theme.colors.neutral.white}>x</Icon>
  </DeleteButton>
)

DeleteControl.propTypes = {
  onClick: PropTypes.func.isRequired,
  tooltip: PropTypes.string,
}

DeleteControl.defaultProps = {
  tooltip: undefined,
}

export default DeleteControl
