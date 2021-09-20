import React from 'react'
import FullWaxEditor from '../../app/components/wax-collab/src/FullWaxEditor'

export const Base = args => <FullWaxEditor {...args} />
export const ReadOnly = Base.bind()
export const Error = Base.bind()
export const WithComments = Base.bind()

Base.args = {
  value: '<p>Some <strong><i>styled</i></strong> text</p>',
  autoFocus: true,
  placeholder: 'Enter text here',
}
ReadOnly.args = { ...Base.args, readonly: true }
Error.args = { ...Base.args, validationStatus: 'error' }
WithComments.args = { ...Base.args, useComments: true }

export default {
  title: 'Wax/FullWaxEditor',
  component: FullWaxEditor,
}
