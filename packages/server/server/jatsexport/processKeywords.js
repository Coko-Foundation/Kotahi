const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')

const proocessKeywords = html => {
  const dom = htmlparser2.parseDocument(html)
  const $ = cheerio.load(dom, { xmlMode: true })

  const keywordListTag = $('.keyword-list')

  // This is a list of strings that will be passed back and turned into JATS
  const keywordList = []

  // Go through each <p class="keyword-list">
  if (keywordListTag.length) {
    keywordListTag.each((index, el) => {
      const thisList = $(el)
      // console.log('Keyword list found: ', thisList.html())
      // Find every <span class="keyword"> inside of that.
      const keywords = thisList.find('.keyword')
      keywords.each((index2, keywordEl) => {
        // console.log('--> ', $(keywordEl).html())
        keywordList.push($(keywordEl).text())
      })
      // Finally, delete the <p class="keyword-list"> tag from the body
      $(el).replaceWith('')
    })
  }

  // console.log('Output: ', keywordList)
  const deKeywordedHtml = $.html()

  return { deKeywordedHtml, keywordList }
}

module.exports = proocessKeywords
