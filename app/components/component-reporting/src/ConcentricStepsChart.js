import React from 'react'
import {
  Customized,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from 'recharts'
import styled from 'styled-components'

const Container = styled.div`
  height: 250px;
  width: 300px;
`

const pc = percentageString =>
  parseFloat(percentageString.trimRight('%')) * 0.01

const getCustomLabelsWithColors = colors => ({
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
          fill={colors[index]}
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

const ConcentricStepsChart = ({ data, barColors, labelColors }) => {
  return (
    <Container>
      <ResponsiveContainer height="100%" width="100%">
        <RadialBarChart
          barSize={14}
          cx="50%"
          cy="50%"
          data={data.map((d, i) => ({ ...d, fill: barColors[i] }))}
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
            component={getCustomLabelsWithColors(labelColors)}
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
