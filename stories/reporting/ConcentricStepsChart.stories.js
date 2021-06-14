import React from 'react'
import { ConcentricStepsChart } from '../../app/components/component-reporting/src'
import { getEditorsConcentricBarChartData } from './mockReportingData'

export const Base = args => <ConcentricStepsChart {...args} />

Base.args = getEditorsConcentricBarChartData()

export default {
  title: 'Reporting/ConcentricStepsChart',
  component: ConcentricStepsChart,
}
