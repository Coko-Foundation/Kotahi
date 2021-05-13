import React from 'react'
import { SparkBar } from '../../app/components/component-reporting/src'

export const Base = args => <SparkBar {...args} />
export const Clickable = Base.bind()

Base.args = {
  value: 5,
  rangeMax: 10,
}

Clickable.args = {
  value: 5,
  rangeMax: 10,
  // eslint-disable-next-line no-alert
  onClick: () => window.alert('Clicked!'),
}

export default {
  title: 'Reporting/SparkBar',
  component: SparkBar,
  argTypes: {
    value: { control: { type: 'number' } },
    rangeMax: { control: { type: 'number' } },
    onClick: { control: { type: 'function' } },
  },
}
