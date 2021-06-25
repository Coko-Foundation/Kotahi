import React from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import styled from 'styled-components'

const Container = styled.div`
  height: 300px;
  width: 750px;
`

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

const day = 24 * 60 * 60 * 1000

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const dateFormatter = timestamp => {
  const date = new Date(timestamp)
  return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}`
}

const getTicks = (startTimestamp, endTimestamp, interval) => {
  const result = []
  let date = new Date(startTimestamp)
  date.setUTCHours(0)
  date.setUTCMinutes(0)
  date.setUTCSeconds(0)
  date.setUTCMilliseconds(0)

  date = new Date(date.getTime() + day)

  while (date.getTime() < endTimestamp) {
    result.push(date.getTime())
    date = new Date(date.getTime() + day)
  }

  return result
}

const DurationsChart = ({
  startDate,
  endDate,
  data,
  reviewAvgs,
  completionAvgs,
}) => {
  const { reviewSeries, completionSeries } = generateSeries(data)

  return (
    <Container>
      <ResponsiveContainer height="100%" width="100%">
        <LineChart height={400} width={500}>
          <XAxis
            allowDataOverflow={false}
            dataKey="x"
            domain={[startDate, endDate]}
            hasTick
            name="date"
            scale="time"
            tickFormatter={dateFormatter}
            ticks={getTicks(startDate, endDate, 7)}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="y"
            name="duration"
            type="number"
            unit=" days"
          />
          <Line
            animationDuration={20000}
            data={reviewSeries}
            dataKey="y"
            dot={false}
            stroke="#ffa900"
            strokeLinejoin="bevel"
            strokeWidth={2}
          />
          <Line
            animationBegin={1000}
            animationDuration={20000}
            data={completionSeries}
            dataKey="y"
            dot={false}
            stroke="#475ae8"
            strokeLinejoin="bevel"
            strokeWidth={2}
          />
          <Line
            animationBegin={1800}
            animationDuration={1000}
            data={reviewAvgs}
            dataKey="y"
            dot={false}
            stroke="#ffa900"
            strokeLinejoin="bevel"
            strokeOpacity={0.4}
            type="monotone"
          />
          <Line
            animationBegin={1800}
            animationDuration={1000}
            data={completionAvgs}
            dataKey="y"
            dot={false}
            stroke="#475ae8"
            strokeLinejoin="bevel"
            strokeOpacity={0.4}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </Container>
  )
}

export default DurationsChart
