const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')
const { htmlToJats } = require('../utils/jatsUtils')

const cleanCitation = (html, id) => {
  const dom = htmlparser2.parseDocument(html)
  const $ = cheerio.load(dom, { xmlMode: true })
  $('span').each((index, el) => {
    console.log(index, el.attribs.class)
    // TODO: break this down!
  })
  return {
    xref: `<xref ref=type="bibr" rid='ref-${id}'>${id}</xref>`,
    ref: `<ref id='ref-${id}'><mixed-citation>hello!</mixed-citation></ref>`,
  }
}

const findCitationSpans = html => {
  const citations = []
  const dom = htmlparser2.parseDocument(html)
  const $ = cheerio.load(dom, { xmlMode: true })
  $('span.mixed-citation').each((index, el) => {
    const $elem = $(el)
    const { xref, ref } = cleanCitation($elem.html(), index)
    // what we want out of this: a JATS <fn> object with an ID and a crossref to the ID passed back
    citations.push(ref)
    return xref
  })
  console.log(citations)
  return $.html()
}

const makeCitations = (html, fnSection) => {
  console.log('in makeCitations')
  let deCitedHtml = html
  let refList = '' // this is the ref-list that we're building
  let refListHeader = '' // if there's a header, it goes in here
  let refCount = 0 // this is to give refs IDs
  const potentialRefs = []

  while (deCitedHtml.indexOf('<section class="reflist">') > -1) {
    let thisRefList = deCitedHtml
      .split('<section class="reflist">')[1]
      .split('</section>')[0]

    deCitedHtml = deCitedHtml.replace(
      `<section class="reflist">${thisRefList}</section>`,
      '',
    )

    // 2.1. Get header, if there is one. Only the first reflist header is taken.
    if (!refListHeader) {
      if (thisRefList.indexOf('<h1 class="referenceheader">') > -1) {
        /* eslint-disable prefer-destructuring */
        refListHeader = thisRefList
          .split('<h1 class="referenceheader">')[1]
          .split('</h1>')[0]
        refList = `<title>${refListHeader}</title>${refList}`
      }
    }
    // 2.2. Get all the citations out, add to refList

    // first, go through and identify all possible mixed citations

    while (thisRefList.indexOf('<p class="mixedcitation">') > -1) {
      const thisCitation = thisRefList
        .split('<p class="mixedcitation">')[1]
        .split('</p>')[0]

      if (thisCitation.length) {
        potentialRefs[
          html.indexOf(`<p class="mixedcitation">${thisCitation}</p>`)
        ] = thisCitation
      }

      thisRefList = thisRefList.replace(
        `<p class="mixedcitation">${thisCitation}</p>`,
        ``,
      )
    }

    // next, take all regular paragraphs as citations

    while (thisRefList.indexOf('<p class="paragraph">') > -1) {
      const thisCitation = thisRefList
        .split('<p class="paragraph">')[1]
        .split('</p>')[0]

      if (thisCitation.length) {
        potentialRefs[
          html.indexOf(`<p class="paragraph">${thisCitation}</p>`)
        ] = thisCitation
      }

      thisRefList = thisRefList.replace(
        `<p class="paragraph">${thisCitation}</p>`,
        ``,
      )
    }

    // finally, if there are <li>s with content, take them as citations.

    while (thisRefList.indexOf('<li>') > -1) {
      const thisCitation = thisRefList.split('<li>')[1].split('</li>')[0]

      if (thisCitation.length) {
        potentialRefs[html.indexOf(`<li>${thisCitation}</li>`)] = thisCitation
      }

      thisRefList = thisRefList.replace(`<li>${thisCitation}</li>`, ``)
    }

    const myRefs = potentialRefs.filter(x => x)

    refList += myRefs
      .map(
        (thisCitation, index) =>
          `<ref id="ref-${index}"><mixed-citation>${htmlToJats(
            thisCitation,
          )}</mixed-citation></ref>`,
      )
      .join('')
    refCount = myRefs.length
  }

  // 2.3 deal with any stray reference headers in the body—they become regular H1s.

  while (deCitedHtml.indexOf('<h1 class="referenceheader">') > -1) {
    deCitedHtml = deCitedHtml.replace(`<h1 class="referenceheader">`, '<h1>')
  }

  // 2.4 deal with any loose mixed citations in the body:
  // they're pulled out of the body and added to the ref-list
  // QUESTION: Is this the right thing to do? It isn't necessarily what the user expects.
  // Theoretically you could have a <ref-list> at the end of a <sec> though why you would want
  // that is not clear to me. <mixed-citation> by itself isn't valid in a <sec> (even wrapped in <ref>).
  // The alternative would just be to delete the loose <mixed-citations>?

  while (deCitedHtml.indexOf('<p class="mixedcitation">') > -1) {
    const thisCitation = deCitedHtml
      .split('<p class="mixedcitation">')[1]
      .split('</p>')[0]

    deCitedHtml = deCitedHtml.replace(
      `<p class="mixedcitation">${thisCitation}</p>`,
      ``,
    )

    refList += `<ref id="ref-${refCount}"><mixed-citation>${htmlToJats(
      thisCitation,
    )}</mixed-citation></ref>`
    refCount += 1
  }

  // TODO: get all the <span class="mixed-citation"> out of deCitedHtml

  const cleanedHtml = findCitationSpans(deCitedHtml)
  const cleanedHtml2 = findCitationSpans(fnSection)
  console.log(cleanedHtml)
  console.log(cleanedHtml2)

  // console.log('returned: ', cleanedHtml)

  if (refList) {
    refList = `<ref-list>${refList}</ref-list>`
  }

  return { deCitedHtml, refList }
}

module.exports = makeCitations
