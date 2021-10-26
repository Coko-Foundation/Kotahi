import React from 'react'
import ProductionWaxEditor from '../../app/components/wax-collab/src/ProductionWaxEditor'
import { splitFrontBodyBack } from '../../server/utils/jatsUtils'

const initialValue = `<p class="paragraph">Some <strong><em>styled</em></strong> text<footnote id="64da6743-5c79-4bbe-b27b-a700748d80ed">This is the note text.</footnote></p><p class="paragraph">A second <span class="comment" data-id="807c5dba-f8a4-4f64-b1cd-cf9e83a2f64c" data-conversation="[{&quot;content&quot;:&quot;This is a note.&quot;,&quot;displayName&quot;:&quot;dummy editor&quot;,&quot;timestamp&quot;:1632132399423}]" data-viewid="main" data-group="main">paragraph</span>.</p><section class="reflist"><h1 class="referenceheader">adfadf</h1><p class="mixedcitation">dfaljkdf</p><p class="mixedcitation">fasdfasdf</p><p class="mixedcitation">adfasdfasd</p><p class="mixedcitation">afasfd</p></section><section class="appendix"><h1 class="appendixheader">Appendix 1</h1></section><section class="appendix"><h1 class="appendixheader">Appendix 2</h1></section>`

const dummyFrontMatter = {
  title: 'Fake Title',
  abstract: `<p>This is the abstract.</p>`,
}

const journalMetadata = {
  journalId: [
    { type: 'pmc', value: 'BMJ' },
    { type: 'publisher', value: 'BR MED J' },
  ],
  journalTitle: 'Journal Title',
  abbrevJournalTitle: 'Jour.Ti.',
  issn: [
    { type: 'print', value: '1063-777X' },
    { type: 'electronic', value: '1090-6517' },
  ],
  publisher: 'Journal Publisher Inc.',
}

const WaxPlusJATS = () => {
  const [jats, setJats] = React.useState({ front: '', body: '', back: '' })

  const [html, setHtml] = React.useState('')
  return (
    <div>
      <ProductionWaxEditor
        onBlur={source => {
          setHtml(source)
          setJats(splitFrontBodyBack(source, dummyFrontMatter, journalMetadata))
        }}
        placeholder="Enter text here"
        value={initialValue}
      />
      <div>
        <h2>JATS output:</h2>
        <h3>Front</h3>
        <p style={{ border: '1px solid #ddd', padding: '1em' }}>
          {jats.front ||
            'Change text in the editor and click outside to see the result'}
        </p>
        <h3>Body</h3>
        <p style={{ border: '1px solid #ddd', padding: '1em' }}>
          {jats.body ||
            'Change text in the editor and click outside to see the result'}
        </p>
        <h3>Back</h3>
        <p style={{ border: '1px solid #ddd', padding: '1em' }}>
          {jats.back ||
            'Change text in the editor and click outside to see the result'}
        </p>
        <h3>Everything</h3>
        <p style={{ border: '1px solid #ddd', padding: '1em' }}>
          {jats.jats ||
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
