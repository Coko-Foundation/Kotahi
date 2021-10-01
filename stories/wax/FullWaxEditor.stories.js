import React from 'react'
import FullWaxEditor from '../../app/components/wax-collab/src/FullWaxEditor'

export const Base = args => <FullWaxEditor {...args} />
export const ReadOnly = Base.bind()
export const Error = Base.bind()
export const WithComments = Base.bind()
export const ReadOnlyWithComments = Base.bind()
export const ReadOnlyWithReadOnlyComments = Base.bind()

Base.args = {
  value: `<p class="paragraph">Some <strong><em>styled</em></strong> text</p><p class="paragraph">A second <span class="comment" data-id="807c5dba-f8a4-4f64-b1cd-cf9e83a2f64c" data-conversation="[{&quot;content&quot;:&quot;This is a note.&quot;,&quot;displayName&quot;:&quot;dummy editor&quot;,&quot;timestamp&quot;:1632132399423}]" data-viewid="main" data-group="main">paragraph</span>.</p>`,
  autoFocus: true,
  placeholder: 'Enter text here',
}
ReadOnly.args = { ...Base.args, readonly: true }
Error.args = { ...Base.args, validationStatus: 'error' }
WithComments.args = { ...Base.args, useComments: true }
ReadOnlyWithComments.args = { ...Base.args, useComments: true, readonly: true }
ReadOnlyWithReadOnlyComments.args = {
  ...Base.args,
  useComments: true,
  readonly: true,
  readOnlyComments: true,
}

export default {
  title: 'Wax/FullWaxEditor',
  component: FullWaxEditor,
}
