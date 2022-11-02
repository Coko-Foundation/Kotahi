const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')
const htmlToJats = require('./htmlToJats')

// NOTE: right now this only works for flat glossaries!

const processGlossary = html => {
  const dom = htmlparser2.parseDocument(html)
  const $ = cheerio.load(dom, { xmlMode: true })

  const glossarySectionList = $('section.glossary')

  // This is a list of glossary entries
  const glossaryList = []
  let glossaryTitle = ''
  let glossary = ''

  // Go through each <section class="glossary">
  if (glossarySectionList.length) {
    glossarySectionList.each((index, el) => {
      const thisList = $(el)

      // console.log('Glossary section found: ', thisList.html())
      if (!glossaryTitle) {
        // if we don't have a title and there's a header in there, use that as the title
        const firstTitle = $(el).find('h1,h2,h3,h4,h5,h6')

        // NOTE: any other headers in a glossary section are discarded!
        if (firstTitle['0'] && $(firstTitle['0']).text()) {
          glossaryTitle = $(firstTitle['0']).text()
          // console.log('Glossary title found: ', glossaryTitle)
        }
      }

      // Find every <p > inside of that.
      const items = thisList.find('p')
      items.each((index2, itemEl) => {
        // check to make sure that there's a glossary term inside of there
        const glossaryTerm = $(itemEl).find('.glossary-term')

        if (glossaryTerm['0'] && $(glossaryTerm['0']).text()) {
          // if we have a term, we can add it. Otherwise, it's ignored.
          const thisTerm = $(glossaryTerm['0']).text()

          const thisDefinition = $(itemEl)
            .html()
            .replace(
              `<span class="glossary-term" title="Glossary term">${thisTerm}</span>`,
              '',
            )

          const thisCitation = `<def-item><term id="G${
            glossaryList.length + 1
          }">${thisTerm}</term><def><p>${htmlToJats(
            thisDefinition,
          )}</p></def></def-item>`

          glossaryList.push(thisCitation)
        }
      })
      // Finally, delete the <section class="glossary"> tag from the body
      $(el).replaceWith('')
    })
  }

  if (glossaryList.length) {
    glossary = `<glossary>${
      glossaryTitle ? `<title>${glossaryTitle}</title>` : ''
    }<def-list>${glossaryList.join('')}</def-list></glossary>`
  }

  // console.log('Output: ', keywordList)
  const deglossariedHtml = $.html()

  return { deglossariedHtml, glossary }
}

module.exports = processGlossary
