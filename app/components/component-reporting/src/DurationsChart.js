import React from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import styled from 'styled-components'

const Container = styled.div`
  height: 500px;
  width: 800px;
`

const generateBaseData = () => {
  const result = []
  let lastDate = 0 // 1623303786

  for (let i = 0; i < 100; i += 1) {
    const date = lastDate + Math.random() * Math.random() * 24 * 60 * 60
    const reviewDuration = Math.random() * Math.random() * 15 + 0.5

    const fullDuration =
      reviewDuration + Math.random() * Math.random() * 9 + 0.5

    result.push({ date, reviewDuration, fullDuration })
    lastDate = date
  }

  return result
}

const generateSeries = data => {
  const reviewSeries = []
  const completionSeries = []

  data.forEach(datum => {
    reviewSeries.push({ x: datum.date, y: 0 })
    reviewSeries.push({ x: datum.date, y: datum.reviewDuration })
    reviewSeries.push(null)
    completionSeries.push({ x: datum.date, y: datum.reviewDuration })
    completionSeries.push({ x: datum.date, y: datum.fullDuration })
    completionSeries.push(null)
  })

  return { reviewSeries, completionSeries }
}

const generateMovingAverages = data => {
  const reviewAvgs = []
  const completionAvgs = []

  data.forEach(datum => {
    // TODO
  })

  return { reviewAvgs, completionAvgs }
}

const NullShape = () => null

const DurationsChart = () => {
  const baseData = generateBaseData()
  const { reviewSeries, completionSeries } = generateSeries(baseData)
  /* const { reviewAvgs, completionAvgs } = */ generateMovingAverages(baseData)

  return (
    <Container>
      <ResponsiveContainer height="100%" width="100%">
        <ScatterChart height={400} width={500}>
          <CartesianGrid />
          <XAxis dataKey="x" name="date" type="number" />
          <YAxis dataKey="y" name="duration" type="number" unit=" days" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter
            data={reviewSeries}
            line={{ stroke: '#6c9', strokeLinejoin: 'bevel', strokeWidth: 2 }}
            shape={NullShape}
          />
          <Scatter
            data={completionSeries}
            line={{ stroke: '#36e', strokeLinejoin: 'bevel', strokeWidth: 2 }}
            shape={NullShape}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </Container>
  )
}

export default DurationsChart
