import React from 'react'

import Button from './FakeButton'

export const Base = args => <Button {...args} />

Base.args = {
  label: 'Click me',
  primary: false,
}

export const Primary = () => <Button label="Primary" primary />
export const NonPrimary = () => <Button label="Not primary" />

export default {
  title: 'Fake Section/Button',
  component: Button,
  argTypes: {
    label: { control: { type: 'text' } },
    primary: { control: { type: 'boolean' } },
  },
}
