import React from 'react'
import PropTypes from 'prop-types'
import styled, { withTheme } from 'styled-components'
import { Icon } from '@pubsweet/ui'
import lightenBy from '../../shared/lightenBy'

const DeleteControlContainer = styled.div`
  display: inline-block;
  margin-right: 10px;
  padding: 32px 0 0 1em;
  position: relative;
  vertical-align: top;
`

const DeleteButton = styled.button`
  background: none;

  &:hover {
    background-color: ${lightenBy('colorPrimary', 0.8)};
  }
`

const ControlIcon = withTheme(({ children, theme }) => (
  <Icon color={theme.colorPrimary}>{children}</Icon>
))

const DeleteControl = ({ onClick, tooltip }) => (
  <DeleteControlContainer>
    <DeleteButton onClick={onClick} title={tooltip} type="button">
      <ControlIcon>x</ControlIcon>
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
