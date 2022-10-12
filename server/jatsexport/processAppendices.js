const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')
const htmlToJats = require('./htmlToJats')

const processAppendices = html => {
  let deAppendixedHtml = html
  let appCount = 0 // this is to give appendices IDs
  const appendices = []

  while (deAppendixedHtml.indexOf('<section class="appendix">') > -1) {
    let thisAppendix = deAppendixedHtml
      .split('<section class="appendix">')[1]
      .split('</section>')[0]

    deAppendixedHtml = deAppendixedHtml.replace(
      `<section class="appendix">${thisAppendix}</section>`,
      '',
    )

    // 1.1 deal with appendix title

    const dom = htmlparser2.parseDocument(thisAppendix)
    const $ = cheerio.load(dom, { xmlMode: true })
    const headers = $('h1,h2,h3,h4,h5,h6')

    if (headers['0']) {
      const header = $(headers['0']).text()
      // console.log('header found: ', header, $(headers['0']).html())
      $(headers['0']).replaceWith('')
      thisAppendix = `<title>${header}</title>${$.html()}`
    }

    // 1.2. jats the internal contents
    appendices.push(
      `<app id="app-${appCount}">${htmlToJats(thisAppendix)}</app>`,
    )
    appCount += 1
  }

  return {
    deAppendixedHtml,
    appendices: appendices.length
      ? `<app-group>${appendices.join('')}</app-group>`
      : '',
  }
}

module.exports = processAppendices
