import React from 'react'
import { ConcentricStepsChart } from '../../app/components/component-reporting/src'

export const Base = args => <ConcentricStepsChart {...args} />

Base.args = {}

export default {
  title: 'Reporting/ConcentricStepsChart',
  component: ConcentricStepsChart,
}
