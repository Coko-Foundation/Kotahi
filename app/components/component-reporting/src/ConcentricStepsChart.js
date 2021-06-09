import React from 'react'
import PropTypes from 'prop-types'
import {
  Customized,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from 'recharts'
import styled from 'styled-components'
import Color from 'color'

const getBarColor = (
  barIndex,
  barsCount,
  lightness = 0.6,
  saturation = 0.6,
) => {
  const baseHue = 243
  const targetHue = 22

  const hue =
    barIndex === 0
      ? baseHue
      : baseHue + ((targetHue - baseHue) * barIndex) / (barsCount - 1)

  return Color.hsl(hue, saturation * 100, lightness * 100).hex()
}

const someData = [
  { name: '18-24', value: 31.47 },
  { name: '25-29', value: 26.69 },
  { name: '30-34', value: 15.69 },
  { name: '35-39', value: 8.22 },
  { name: '40-49', value: 8.63 },
  { name: '50+', value: 2.63 },
  { name: 'unknow', value: 6.67 },
]

const Container = styled.div`
  height: 300px;
  width: 300px;
`

const pc = percentageString =>
  parseFloat(percentageString.trimRight('%')) * 0.01

const CustomLabels = ({
  barGap,
  cx,
  cy,
  data,
  height,
  innerRadius,
  outerRadius,
  width,
}) => {
  const stepY =
    data.length > 0
      ? (((pc(outerRadius) - pc(innerRadius)) / 2) * Math.min(height, width) -
          barGap) /
        data.length
      : 0

  const fontSize = Math.min(Math.max(stepY * 0.9, 7), 18)
  const baseX = width * pc(cx) - barGap

  const baseY =
    height * pc(cy) +
    (Math.min(height, width) * pc(innerRadius)) / 2 +
    fontSize / 4

  return (
    <g key="asdf">
      {data.map((datum, index) => (
        <text
          fill="none"
          key={`lblOutline-${datum.name}`}
          stroke="white"
          strokeLinejoin="bevel"
          strokeOpacity={0.5}
          strokeWidth={3}
          style={{ fontSize: `${fontSize}px` }}
          textAnchor="end"
          x={baseX}
          y={baseY + index * stepY}
        >
          {datum.name}
        </text>
      ))}
      {data.map((datum, index) => (
        <text
          fill={getBarColor(index, data.length, 0.3, 1.0)}
          key={`lbl-${datum.name}`}
          style={{ fontSize: `${fontSize}px` }}
          textAnchor="end"
          x={baseX}
          y={baseY + index * stepY}
        >
          {datum.name}
        </text>
      ))}
    </g>
  )
}

CustomLabels.propTypes = {
  barGap: PropTypes.number.isRequired,
  cx: PropTypes.string.isRequired,
  cy: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
  ).isRequired,
  height: PropTypes.number.isRequired,
  innerRadius: PropTypes.string.isRequired,
  outerRadius: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
}

const ConcentricStepsChart = () => {
  const dataWithColors = someData.map((datum, i) => ({
    ...datum,
    fill: getBarColor(i, someData.length, 0.6),
  }))

  return (
    <Container>
      <ResponsiveContainer height="100%" width="100%">
        <RadialBarChart
          barSize={14}
          cx="50%"
          cy="50%"
          data={dataWithColors}
          endAngle={270}
          innerRadius="20%"
          outerRadius="100%"
          startAngle={-90}
        >
          <RadialBar
            background
            clockWise
            dataKey="value"
            label={{ position: 'insideStart', fill: '#fff', fontSize: '13px' }}
            minAngle={15}
          />
          <Customized
            component={CustomLabels}
            height="100%"
            key="labels"
            width="100%"
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </Container>
  )
}

export default ConcentricStepsChart
