import React from 'react'
import { DurationsChart } from '../../app/components/component-reporting/src'
import { generateDurationsData } from './mockReportingData'

export const Base = args => <DurationsChart {...args} />

Base.args = { data: generateDurationsData() }

export default {
  title: 'Reporting/DurationsChart',
  component: DurationsChart,
}
