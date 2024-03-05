const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')
const htmlToJats = require('./htmlToJats')

const processFunding = html => {
  const dom = htmlparser2.parseDocument(html)
  const $ = cheerio.load(dom, { xmlMode: true })

  const fundingTags = $('.fundingsource,.awardid,.fundingstatement')

  let fundingList = ''

  if (fundingTags.length) {
    let fundingStatements = ''
    const awardGroups = []
    const awardIdMemo = []
    const fundingSourceMemo = []
    // console.log('processing funding group!')

    fundingList += `<funding-group>`

    fundingTags.each((index, el) => {
      if (el.attribs.class === 'fundingsource') {
        if (fundingSourceMemo.indexOf(index) === -1) {
          // console.log('funding source found: ', $(el).html())
          // get the next paragraph and see if it's an award ID; if so, group them together
          const nextLine = $(el).next()

          if (
            nextLine &&
            nextLine.length &&
            nextLine[0]?.attribs?.class === 'awardid'
          ) {
            // console.log('--award ID found: ', nextLine.html())
            awardIdMemo.push(index + 1)
            awardGroups.push(
              `<award-group id="award-${
                awardGroups.length
              }"><funding-source>${htmlToJats(
                $(el).html(),
              )}</funding-source><award-id>${htmlToJats(
                nextLine.html(),
              )}</award-id></award-group>`,
            )
          } else {
            // this is a funding source without an award ID after it.
            awardGroups.push(
              `<award-group id="award-${
                awardGroups.length
              }"><funding-source>${htmlToJats(
                $(el).html(),
              )}</funding-source></award-group>`,
            )
          }

          fundingSourceMemo.push(index)
        } else {
          // console.log('funding source already processed')
        }
      }

      if (el.attribs.class === 'awardid') {
        if (awardIdMemo.indexOf(index) === -1) {
          // console.log('award ID found: ', $(el).html())

          // get the next paragraph and see if it's an funding source; if so, group them together
          const nextLine = $(el).next()

          if (
            nextLine &&
            nextLine.length &&
            nextLine[0]?.attribs?.class === 'fundingsource'
          ) {
            // console.log('--funding source found: ', nextLine.html())
            fundingSourceMemo.push(index + 1)
            awardGroups.push(
              `<award-group id="award-${
                awardGroups.length
              }"><funding-source>${htmlToJats(
                nextLine.html(),
              )}</funding-source><award-id>${htmlToJats(
                $(el).html(),
              )}</award-id></award-group>`,
            )
          } else {
            // this is a award ID without an funding source after it.
            awardGroups.push(
              `<award-group id="award-${
                awardGroups.length
              }"><award-id>${htmlToJats(
                $(el).html(),
              )}</award-id></award-group>`,
            )
          }

          awardIdMemo.push(index)
        } else {
          // console.log('award ID already processed')
        }
      }

      if (el.attribs.class === 'fundingstatement') {
        // console.log('funding statmeent found!', $(el).html())
        fundingStatements += `<funding-statement>${htmlToJats(
          $(el).html(),
        )}</funding-statement>`
      }

      // now remove the tag.
      $(el).remove()
    })

    fundingList += `${awardGroups.join('')}${fundingStatements}</funding-group>`
  }

  // console.log('Output: ', fundingList)
  const defundedHtml = $.html()

  return { defundedHtml, fundingList }
}

module.exports = processFunding
