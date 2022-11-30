import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Icon } from '@pubsweet/ui'
import theme from '../../theme'

const DeleteControlContainer = styled.div`
  display: inline-block;
  margin-right: 10px;
  padding: 32px 0 0 1em;
  position: relative;
  vertical-align: top;
`

const DeleteButton = styled.button`
  align-items: center;
  background: ${theme.colors.brand1.base};
  border: none;
  border-radius: 500px;
  display: flex;
  height: 30px;
  justify-content: center;
  position: relative;
  top: 66px;
  width: 30px;

  &:hover {
    background-color: ${theme.colors.brand1.tint10};
    cursor: pointer;
  }
`

const DeleteControl = ({ onClick, tooltip }) => (
  <DeleteControlContainer>
    <DeleteButton onClick={onClick} title={tooltip} type="button">
      <Icon color={theme.colors.neutral.white}>x</Icon>
    </DeleteButton>
  </DeleteControlContainer>
)

DeleteControl.propTypes = {
  onClick: PropTypes.func.isRequired,
  tooltip: PropTypes.string,
}

DeleteControl.defaultProps = {
  tooltip: undefined,
}

export default DeleteControl
