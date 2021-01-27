import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Btn = styled.button`
  background-color: ${props => props.primary && 'blue'};
  font-family: ${props => props.theme.fontInterface};
`

/** This appears in storybook */
const Button = ({ label, primary }) => <Btn primary={primary}>{label}</Btn>

Button.propTypes = {
  /** This also appears in storybook */
  label: PropTypes.string.isRequired,
  /** As props table documentation */
  primary: PropTypes.bool,
}

Button.defaultProps = {
  primary: false,
}

export default Button
