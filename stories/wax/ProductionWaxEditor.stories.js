import React from 'react'
import ProductionWaxEditor from '../../app/components/wax-collab/src/ProductionWaxEditor'

export const Base = args => <ProductionWaxEditor {...args} />
export const ReadOnly = Base.bind()
export const Error = Base.bind()

Base.args = {
  value: `<p>Some <strong><i>styled</i></strong> text</p>
	<p>A second paragraph.</p>`,
  autoFocus: true,
  placeholder: 'Enter text here',
  onBlur: source => {
    // console.log('onBlur: ', source)
  },
}
ReadOnly.args = { ...Base.args, readonly: true }
Error.args = { ...Base.args, validationStatus: 'error' }

export default {
  title: 'Wax/ProductionWaxEditor',
  component: ProductionWaxEditor,
  argTypes: {
    onBlur: {
      action: 'clicked',
    },
  },
}
