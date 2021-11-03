import React from 'react'
import ProductionWaxEditor from '../../app/components/wax-collab/src/ProductionWaxEditor'

export const Base = args => <ProductionWaxEditor {...args} />
export const ReadOnly = Base.bind()
export const Error = Base.bind()
export const NoComments = Base.bind()

Base.args = {
  value: `<p class="paragraph">Some <strong><em>styled</em></strong> text</p><p class="paragraph">A second <span class="comment" data-id="807c5dba-f8a4-4f64-b1cd-cf9e83a2f64c" data-conversation="[{&quot;content&quot;:&quot;This is a note.&quot;,&quot;displayName&quot;:&quot;dummy editor&quot;,&quot;timestamp&quot;:1632132399423}]" data-viewid="main" data-group="main">paragraph</span>.</p>`,
  autoFocus: true,
  placeholder: 'Enter text here',
  onBlur: source => {
    // console.log('onBlur: ', source)
  },
}
ReadOnly.args = { ...Base.args, readonly: true }
Error.args = { ...Base.args, validationStatus: 'error' }
NoComments.args = { ...Base.args, useComments: false }

export default {
  title: 'Wax/ProductionWaxEditor',
  component: ProductionWaxEditor,
  argTypes: {
    onBlur: {
      action: 'clicked',
    },
  },
}
