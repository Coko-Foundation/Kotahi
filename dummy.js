const { parseString } = require('xml2js')

const htmlString = `<fs><ffp class="paragraph">Some <strong><em>styled</em></strong> text</ffp><p class="paragraph">A sec<footnote id="f7f4c5b0-e8e1-402d-8ccf-2f3e1d3c7bbe"></footnote>ond <span class="comment" data-id="807c5dba-f8a4-4f64-b1cd-cf9e83a2f64c" data-conversation="[{&quot;content&quot;:&quot;This is a note.&quot;,&quot;displayName&quot;:&quot;dummy editor&quot;,&quot;timestamp&quot;:1632132399423}]" data-viewid="main" data-group="main">paragraph</span>.</p>`

parseString(htmlString, (err, result) => {
  if (err) {
    console.dir(JSON.stringify(err, Object.getOwnPropertyNames(err)))
  } else {
    console.dir(result)
  }
})
