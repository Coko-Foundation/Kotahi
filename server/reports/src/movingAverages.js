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
  let nextTimeToMark = Number.NEGATIVE_INFINITY
  let lastDatum = null
  let lastDatumWasIncluded = false
  data.forEach(d => {
    let datumIsIncluded = false

    if (!d && lastDatum) {
      if (!lastDatumWasIncluded) result.push(lastDatum)
      result.push(d)
      datumIsIncluded = true
    }

    if (d && d.x >= nextTimeToMark) {
      result.push(d)
      datumIsIncluded = true
      nextTimeToMark = d.x + period
    }

    lastDatum = d
    lastDatumWasIncluded = datumIsIncluded
  })

  if (lastDatum && !lastDatumWasIncluded) result.push(lastDatum)

  return result
}

// TODO: It's probably more appropriate to calculate moving median for data
// such as this, though it's more complex to implement efficiently.
// We'd probably want to use an order statistic tree like
// https://gist.github.com/yaru22/9158379a7d787d98632e to hold the values
// currently in window within a sorted tree, to efficiently find the central
// value or values.
/** Returns two traces: average review durations and average full editing durations. Each trace is an array of {x, y} where
 * x is submission date and y is duration
 */
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

module.exports = generateMovingAverages
