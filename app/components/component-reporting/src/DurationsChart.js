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

const day = 24 * 60 * 60
const week = 7 * day

class MovingAverageCalculator {
  constructor(windowDuration) {
    this.windowDuration = windowDuration
    this.window = []
    this.windowSum = 0
    this.result = []
  }

  push(date, value) {
    const windowStart = date - this.windowDuration
    let i = 0

    while (i < this.window.length && this.window[i].date <= windowStart) {
      this.windowSum -= this.window[i].value
      i += 1
    }

    this.window = this.window.slice(i)

    if (value !== null) {
      this.window.push({ date, value })
      this.windowSum += value
    }

    if (this.window.length <= 0) {
      this.result.push(null)
    } else {
      const avg = this.windowSum / this.window.length

      const midDate =
        (this.window[this.window.length - 1].date + this.window[0].date) / 2

      this.result.push({ x: midDate, y: avg })
    }
  }
}

const smooth = (data, period) => {
  const result = []
  if (data.length <= 0) return result

  result.push(data[0])
  let nextTimeToMark = data[0].x + period

  for (let i = 1; i < data.length; i += 1) {
    if (data[i].x >= nextTimeToMark) {
      result.push(data[i])
      nextTimeToMark += period
    }
  }

  return result
}

// TODO: It's probably more appropriate to calculate moving median for data
// such as this, though it's more complex to implement efficiently.
// We'd probably want to use an order statistic tree like
// https://gist.github.com/yaru22/9158379a7d787d98632e to hold the values
// currently in window within a sorted tree, to efficiently find the central
// value or values.
const generateMovingAverages = (data, windowDuration, smoothingPeriod) => {
  const reviewMovAvg = new MovingAverageCalculator(windowDuration)
  const completionMovAvg = new MovingAverageCalculator(windowDuration)
  data.forEach(datum => {
    reviewMovAvg.push(datum.date, datum.reviewDuration)
    completionMovAvg.push(datum.date, datum.fullDuration)
  })

  return [
    smooth(reviewMovAvg.result, smoothingPeriod),
    smooth(completionMovAvg.result, smoothingPeriod),
  ]
}

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
  const date = new Date(timestamp * 1000)
  return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}`
}

const getTicks = (startTimestamp, endTimestamp, interval) => {
  const result = []
  let date = new Date(startTimestamp * 1000)
  date.setUTCHours(0)
  date.setUTCMinutes(0)
  date.setUTCSeconds(0)
  date.setUTCMilliseconds(0)

  date = new Date(date.getTime() + day)

  while (date.getTime() / 1000 < endTimestamp) {
    result.push(date.getTime() / 1000)
    date = new Date(date.getTime() + day)
  }

  return result
}

const DurationsChart = ({ data }) => {
  const endDate = data[data.length - 1].date
  const startDate = data[0].date
  const { reviewSeries, completionSeries } = generateSeries(data)

  const [reviewAvgs, completionAvgs] = generateMovingAverages(
    data,
    week,
    24 * 60 * 60,
  )

  return (
    <Container>
      <ResponsiveContainer height="100%" width="100%">
        <LineChart height={400} width={500}>
          <XAxis
            dataKey="x"
            domain={[() => startDate, () => endDate]}
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
