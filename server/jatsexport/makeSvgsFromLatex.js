const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')
const mjAPI = require('mathjax-node')

mjAPI.config({
  MathJax: {
    // traditional MathJax configuration
  },
})
mjAPI.start()

const makeSvgsFromLatex = async source => {
  const inlineSvgList = []
  const displaySvgList = []
  const dom = htmlparser2.parseDocument(source)
  const $ = cheerio.load(dom, { xmlMode: true })

  // 1. go through the source and find all display equations

  await $('display-formula').each(async (index, el) => {
    const elem = $(el)
    const internal = elem.html()
    let output = `<display-formula>${internal}</display-formula>`
    const latex = internal.split('[CDATA[')[1].split(']]')[0]
    console.error('Converting display-formula: ', latex)
    // 1.5. mod the JATS to include alternatives with filename
    await mjAPI.typeset(
      {
        math: latex,
        format: 'TeX', // or "inline-TeX", "MathML"
        svg: true, // or svg:true, or html:true
      },
      data => {
        if (!data.errors) {
          displaySvgList[index] = data.svg
          output = output.replace(
            '<alternatives>',
            `<alternatives><inline-graphic xlink:href="images/displayformula_${index}.svg" />`,
          )
          $(el).replaceWith(output)
        }
      },
    )
  })

  // 2. go through the source and find all inline equations

  await $('inline-formula').each(async (index, el) => {
    const elem = $(el)
    const internal = elem.html()
    let output = `<inline-formula>${internal}</inline-formula>`
    const latex = internal.split('[CDATA[')[1].split(']]')[0]
    console.error('Converting inline-formula: ', latex)
    //  3. take the equations and convert them to svg
    await mjAPI.typeset(
      {
        math: latex,
        format: 'TeX', // or "inline-TeX", "MathML"
        svg: true, // or svg:true, or html:true
      },
      data => {
        if (!data.errors) {
          inlineSvgList[index] = data.svg
          output = output.replace(
            '<alternatives>',
            `<alternatives><inline-graphic xlink:href="images/inlineformula_${index}.svg" />`,
          )
          $(el).replaceWith(output)
        }
      },
    )
  })

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
  return output
}

module.exports = makeSvgsFromLatex
