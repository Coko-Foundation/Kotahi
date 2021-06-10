import React from 'react'
import { DurationsChart } from '../../app/components/component-reporting/src'

export const Base = args => <DurationsChart {...args} />

Base.args = {}

export default {
  title: 'Reporting/DurationsChart',
  component: DurationsChart,
}
