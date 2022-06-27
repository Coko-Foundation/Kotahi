const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')

const makeSvgsFromLatex = async source => {
  // const svgList = []
  const dom = htmlparser2.parseDocument(source)
  const $ = cheerio.load(dom, { xmlMode: true })

  // TODO: 1. go through the source and find all display equations

  $('display-formula').each(async (index, el) => {
    // console.log('display-formula: ', el)
    // TODO: 1.5. mod the JATS to include alternatives with filename
  })

  // TODO: 2. go through the source and find all inline equations
  // Inline math currently looks like this: <math-inline class="math-node"> x^2 + y^2 = z^2 </math-inline>

  $('inline-formula').each(async (index, el) => {
    // console.log('inline-formula: ', el)
    // TODO: 2.5. mod the JATS to include alternatives with filename
  })

  // TODO: 3. take the equations and convert them to svg

  // 4. return the modified source and an array of SVG files as strings

  const output = { svgedSource: source, svgList: [] }
  return output
}

module.exports = makeSvgsFromLatex
