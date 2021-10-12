import React from 'react'
import ProductionWaxEditor from '../../app/components/wax-collab/src/ProductionWaxEditor'
import { htmlToJats } from '../../server/utils/jatsUtils'

const initialValue = `<p class="paragraph">Some <strong><em>styled</em></strong> text</p><p class="paragraph">A second <span class="comment" data-id="807c5dba-f8a4-4f64-b1cd-cf9e83a2f64c" data-conversation="[{&quot;content&quot;:&quot;This is a note.&quot;,&quot;displayName&quot;:&quot;dummy editor&quot;,&quot;timestamp&quot;:1632132399423}]" data-viewid="main" data-group="main">paragraph</span>.</p>`

const WaxPlusJATS = () => {
  const [jats, setJats] = React.useState('')
  const [html, setHtml] = React.useState('')
  return (
    <div>
      <ProductionWaxEditor
        onBlur={source => {
          setHtml(source)
          setJats(htmlToJats(source))
        }}
        placeholder="Enter text here"
        value={initialValue}
      />
      <div>
        <h2>JATS output:</h2>
        <p style={{ border: '1px solid #ddd', padding: '1em' }}>
          {jats ||
            'Change text in the editor and click outside to see the result'}
        </p>
      </div>
      <div>
        <h2>HTML in Wax:</h2>
        <p style={{ border: '1px solid #ddd', padding: '1em' }}>
          {html ||
            'Change text in the editor and click outside to see the result'}
        </p>
      </div>
    </div>
  )
}

export const Base = args => <WaxPlusJATS {...args} />

export default {
  title: 'JATS/HTML to JATS',
  component: WaxPlusJATS,
}
