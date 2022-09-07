const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')
const { htmlToJats } = require('../utils/jatsUtils')

/*

# How citations are gathered into JATS.

- this should fire before footnotes are processed.
- parse the HTML and deal with all <reflist> sections as before
  - question: what about <span class="mixed-citation"> inside of that? Maybe deal with spans first?
- parse HTML for <span class="mixed-citation"> elements and transform, adding to reflist and adding in an <xref> where it was deleted
- if there is a footnote with a citation in it: 
  - change <span class="mixed-citation"> to citation, add that to the reflist
	- if there is anything else in the footnote, leave it, replace the deleted <span> with an <xref>
	- if there is nothing else in the footnote, replace it with an <xref> to the citation

	QUESTIONS:

	If there is a reference span in body text, what happens to it? It's just deleted, right? Do we get an XREF to it?

*/

const cleanCitation = (html, id) => {
  const dom = htmlparser2.parseDocument(html)
  const $ = cheerio.load(dom, { xmlMode: true })
  // console.log('In cleanCitation: ', id, $.text())
  $('span').each((index, el) => {
    // console.log('cleanCitation span: ', index, el.attribs.class, $(el).text())

    // TODO: break this down!
    if (el.attribs.class === 'year') {
      $(el).replaceWith(`<year>${$(el).text()}</year>`)
    }

    if (el.attribs.class === 'journal-title') {
      $(el).replaceWith(`<source>${$(el).text()}</source>`)
    }

    if (el.attribs.class === 'article-title') {
      $(el).replaceWith(`<article-title>${$(el).text()}</article-title>`)
    }

    if (el.attribs.class === 'author-name') {
      $(el).replaceWith(`<string-name>${$(el).text()}</string-name>`)
    }

    if (el.attribs.class === 'author-name') {
      $(el).replaceWith(`<string-name>${$(el).text()}</string-name>`)
    }

    if (el.attribs.class === 'volume') {
      $(el).replaceWith(`<volume>${$(el).text()}</volume>`)
    }

    if (el.attribs.class === 'issue') {
      $(el).replaceWith(`<issue>${$(el).text()}</issue>`)
    }

    if (el.attribs.class === 'first-page') {
      $(el).replaceWith(`<fpage>${$(el).text()}</fpage>`)
    }

    if (el.attribs.class === 'last-page') {
      $(el).replaceWith(`<lpage>${$(el).text()}</lpage>`)
    }

    if (el.attribs.class === 'author-group') {
      $(el).replaceWith(
        `<person-group person-group-type="author">${$(
          el,
        ).text()}</person-group>`,
      )
    }
  })
  $('a').each((index, el) => {
    // console.log('cleanCitation a: ', index, el.attribs.class, $(el).text())
    const url = $(el).text()

    if (el.attribs.class === 'doi') {
      console.log('doi: ', url)
      $(el).replaceWith(
        `<ext-link ext-link-type="doi" xlink:href="${url}">${url}</ext-link>`,
      )
    } else {
      // every other a becomes a standard ext-link – maybe this will need to be changed later?
      console.log('url: ', url)
      $(el).replaceWith(
        `<ext-link ext-link-type="uri" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href=${url}>${url}</ext-link>`,
      )
    }

    console.log($(el).html())
  })

  $('br').each((index, el) => {
    $(el).replaceWith('')
  })

  // console.log('returning!', $.html())
  return {
    xref: `<xref ref-type="bibr" rid='ref-${id}'>${id}</xref>`,
    ref: `<ref id='ref-${id}'><mixed-citation>${$.html()}</mixed-citation></ref>`,
  }
}

const findCitationSpans = (html, refCount, refList = '') => {
  const citations = []
  const dom = htmlparser2.parseDocument(html)
  const $ = cheerio.load(dom, { xmlMode: true })
  let currentIndex = refCount
  $('span.mixed-citation').each((index, el) => {
    const $elem = $(el)
    const { xref, ref } = cleanCitation($elem.html(), currentIndex)
    // console.log(xref, ref)
    // what we want out of this: a JATS <fn> object with an ID and a crossref to the ID passed back
    citations.push(ref)
    currentIndex += 1

    $(el).replaceWith(xref)
  })
  // console.log(citations, currentIndex)
  return { cleanedHtml: $.html(), cleanedRefList: refList + citations.join('') }
}

const makeCitations = html => {
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

  const { cleanedHtml, cleanedRefList } = findCitationSpans(
    deCitedHtml,
    refCount,
    refList,
  )

  console.log('cleanedHtmL: ', cleanedHtml, '\nrefList: ', cleanedRefList)

  // console.log('returned: ', cleanedHtml)

  if (cleanedRefList) {
    refList = `<ref-list>${cleanedRefList}</ref-list>`
  }

  const processedHtml = cleanedHtml

  return { processedHtml, refList }
}

module.exports = makeCitations
