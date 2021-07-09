import React from 'react'
import { DurationsChart } from '../../app/components/component-reporting/src'
import { generateDurationsData } from './mockReportingData'

export const Base = args => <DurationsChart {...args} />

const endDate = Date.now()
const startDate = endDate - 30 * 24 * 60 * 60 * 1000

Base.args = generateDurationsData(startDate, endDate)

export default {
  title: 'Reporting/DurationsChart',
  component: DurationsChart,
}
