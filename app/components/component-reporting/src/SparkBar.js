import React from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'

const Container = styled.div`
  position: relative;
  width: 100%;
  z-index: 0;
`

const Value = styled.div`
  ${props =>
    props.onClick &&
    css`
      cursor: pointer;
    `}

  padding-left: 0.2em;
  position: absolute;
  z-index: 1;
`

const Bar = styled.div`
  background-color: ${props => props.color};

  ${props =>
    props.onClick &&
    css`
      cursor: pointer;
    `}

  overflow: hidden;
  width: ${props => props.barWidthPercent};
`

const SparkBar = ({ label, value, rangeMax, onClick, color }) => {
  const barWidthPercent =
    rangeMax > 0 ? `${Math.round((value / rangeMax) * 100)}%` : '0'

  return (
    <Container>
      <Value onClick={onClick}>{label ?? value}</Value>
      <Bar barWidthPercent={barWidthPercent} color={color} onClick={onClick}>
        &nbsp;
      </Bar>
    </Container>
  )
}

SparkBar.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.number.isRequired,
  rangeMax: PropTypes.number.isRequired,
  onClick: PropTypes.func,
  color: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
}

SparkBar.defaultProps = {
  label: undefined,
  onClick: undefined,
  color: 'cornflowerblue',
}

export default SparkBar
