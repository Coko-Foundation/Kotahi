import React from 'react'
import SimpleWaxEditor from '../../app/components/wax-collab/src/SimpleWaxEditor'

export const Base = args => <SimpleWaxEditor {...args} />
export const ReadOnly = Base.bind()
export const Error = Base.bind()

Base.args = {
  value: '<p>Some <strong><i>styled</i></strong> text</p>',
  autoFocus: true,
  placeholder: 'Enter text here',
  onBlur: source => {
    // console.log(source)
  },
}
ReadOnly.args = { ...Base.args, readonly: true }
Error.args = { ...Base.args, validationStatus: 'error' }

export default {
  title: 'Wax/SimpleWaxEditor',
  component: SimpleWaxEditor,
}
