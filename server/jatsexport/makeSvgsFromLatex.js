const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')
const mjAPI = require('mathjax-node')

mjAPI.config({
  MathJax: {
    // traditional MathJax configuration
  },
})
mjAPI.start()

const generateOutputXml = (input, rawMml, index) => {
  // JATS wants MathML with the mmml: namespace at the front of all of its tags

  const mml = rawMml
    .replace(/</g, '<mml:')
    .replace(/<mml:\//g, '</mml:')
    .replace(/<mml:!--/g, '<!--')

  return input
    .replace('<alternatives>', `<alternatives>${mml}`)
    .replace(
      `</alternatives>`,
      `<inline-graphic xlink:href="images/displayformula_${index}.svg" /></alternatives>`,
    )
    .replace(/<!--\[CDATA\[/g, '<![CDATA[')
    .replace(/\]\]-->/g, ']]>')
}

const mathJaxWrapper = latex =>
  mjAPI.typeset({
    math: latex,
    format: 'TeX', // or "inline-TeX", "MathML"
    svg: true, // or svg:true, or html:true
    mml: true,
  })

const convertMathJax = async latex => {
  const data = await mathJaxWrapper(latex)
  return data
}

const makeSvgsFromLatex = async source => {
  const inlineSvgList = []
  const displaySvgList = []
  const dom = htmlparser2.parseDocument(source)

  const $ = cheerio.load(dom, { xmlMode: true })

  // 1. go through the source and find all display equations

  const displayFormulas = $('disp-formula').toArray()

  for (let i = 0; i < displayFormulas.length; i += 1) {
    const elem = displayFormulas[i]
    const internal = $(elem).html()
    const output = `<disp-formula>${internal}</disp-formula>`
    const latex = internal.split('[CDATA[')[1].split(']]')[0]
    console.error('Converting disp-formula: ', latex)
    // eslint-disable-next-line no-await-in-loop
    const data = await convertMathJax(latex)
    displaySvgList[i] = data.svg
    const replacement = generateOutputXml(output, data.mml, i)
    $(elem).replaceWith(replacement)
    // console.log('replaced display formula!')
  }

  // 2. go through the source and find all inline equations

  const inlineFormulas = $('inline-formula').toArray()

  for (let i = 0; i < inlineFormulas.length; i += 1) {
    const elem = inlineFormulas[i]
    const internal = $(elem).html()
    const output = `<inline-formula>${internal}</inline-formula>`
    const latex = internal.split('[CDATA[')[1].split(']]')[0]
    console.error('Converting inline-formula: ', latex)
    // eslint-disable-next-line no-await-in-loop
    const data = await convertMathJax(latex)
    inlineSvgList[i] = data.svg
    const replacement = generateOutputXml(output, data.mml, i)
    $(elem).replaceWith(replacement)
    // console.log('replaced inline formula!')
  }

  // 4. return the modified source and an array of SVG files as strings

  const displayList = displaySvgList.map((svg, index) => {
    return { name: `displayformula_${index}.svg`, svg }
  })

  const inlineList = inlineSvgList.map((svg, index) => {
    return { name: `inlineformula_${index}.svg`, svg }
  })

  const svgList = [...displayList, ...inlineList]

  const finalXml = $.html()
  const output = { svgedSource: finalXml, svgList }
  // console.log('returning!')
  return output
}

module.exports = makeSvgsFromLatex
