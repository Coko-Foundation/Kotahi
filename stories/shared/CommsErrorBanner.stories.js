import React from 'react'
import CommsErrorBanner from '../../app/components/shared/CommsErrorBanner'

export const Base = args => <CommsErrorBanner {...args} />

Base.args = {}

export default {
  title: 'shared/CommsErrorBanner',
  component: CommsErrorBanner,
}
