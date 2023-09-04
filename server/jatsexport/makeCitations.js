const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')
const htmlToJats = require('./htmlToJats')

/*

# How citations are gathered into JATS.

- parse the HTML and deal with all <ref-list> sections as before
  - question: what about <span class="mixed-citation"> inside of that? Maybe deal with spans first?
- parse HTML for <span class="mixed-citation"> elements and transform, adding to reflist and adding in an <xref> where it was deleted
- if there is a footnote with a citation in it: 
  - change <span class="mixed-citation"> to citation, add that to the reflist
	- if there is anything else in the footnote, leave it, replace the deleted <span> with an <xref>

*/

const replaceAll = (str, find, replace) => {
  return str.replace(new RegExp(find, 'g'), replace)
}

const cleanCitation = (html, id) => {
  const dom = htmlparser2.parseDocument(html)
  const $ = cheerio.load(dom, { xmlMode: true })
  let citationNumber = ''
  // console.log('In cleanCitation: ', id, $.text())

  // first, check if there's a citation label in there. Add the <label> tag around it.
  // NOTE that this <label> is not the HTML label, and it's possible we'll hit weird parsing issues in the future with this.
  // This adds the <label> tag, but it does not remove the number from the <mixed-citation>

  if ($('span.citation-label').text().length) {
    citationNumber = `<label>${$('span.citation-label').text()}</label>`
  }

  $('span').each((index, el) => {
    // For each span, replace with JATS tag if appropriate. Unrecognized spans aren't actually processed
    // console.log('cleanCitation span: ', index, el.attribs.class, $(el).text())

    if (el.attribs.class && el.attribs.class.indexOf('year') > -1) {
      $(el).replaceWith(`<year>${$(el).text()}</year>`)
    }

    if (el.attribs.class && el.attribs.class.indexOf('journal-title') > -1) {
      // Note: we're calling this <@source> because there's an HTML tag named
      // <source> and we don't want them to be confused.
      $(el).replaceWith(`<@source>${$(el).text()}</@source>`)
    }

    if (el.attribs.class && el.attribs.class.indexOf('article-title') > -1) {
      $(el).replaceWith(`<article-title>${$(el).text()}</article-title>`)
    }

    if (el.attribs.class && el.attribs.class.indexOf('author-name') > -1) {
      $(el).replaceWith(`<string-name>${$(el).text()}</string-name>`)
    }

    if (el.attribs.class && el.attribs.class.indexOf('volume') > -1) {
      $(el).replaceWith(`<volume>${$(el).text()}</volume>`)
    }

    if (el.attribs.class && el.attribs.class.indexOf('issue') > -1) {
      $(el).replaceWith(`<issue>${$(el).text()}</issue>`)
    }

    if (el.attribs.class && el.attribs.class.indexOf('first-page') > -1) {
      $(el).replaceWith(`<fpage>${$(el).text()}</fpage>`)
    }

    if (el.attribs.class && el.attribs.class.indexOf('last-page') > -1) {
      $(el).replaceWith(`<lpage>${$(el).text()}</lpage>`)
    }

    if (el.attribs.class && el.attribs.class.indexOf('author-group') > -1) {
      // could turn this off and still have valid JATS!
      $(el).replaceWith(
        `<person-group person-group-type="author">${$(
          el,
        ).text()}</person-group>`,
      )
    }

    if (el.attribs.class && el.attribs.class.indexOf('citation-label') > -1) {
      // we have already dealt with this, so delete it in the interior
      $(el).replaceWith(``)
    }
  })
  $('a').each((index, el) => {
    // console.log('cleanCitation a: ', index, el.attribs.class, $(el).text())
    const url = $(el).text()

    if (el.attribs.class && el.attribs.class.indexOf('doi') > -1) {
      // console.log('doi: ', url)
      $(el).replaceWith(
        `<ext-link ext-link-type="doi" xlink:href="${url}">${url}</ext-link>`,
      )
    } else {
      // every other a becomes a standard ext-link – maybe this will need to be changed later?
      // console.log('url: ', url)
      $(el).replaceWith(
        `<ext-link ext-link-type="uri" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${url}">${url}</ext-link>`,
      )
    }

    // console.log($(el).html())
  })

  $('br').each((index, el) => {
    $(el).replaceWith('')
  })

  // console.log('returning!', $.html())
  return {
    xref: `<xref ref-type="bibr" rid='ref-${id}'>${id}</xref>`,
    ref: `<ref id='ref-${id}'>${
      citationNumber || ''
    }<mixed-citation>${$.html()}</mixed-citation></ref>`,
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
    // xref is the crossrefence; ref is the citation to be added to the list
    const parent = $(el).parent()[0]
    $(el).replaceWith(xref)

    if (parent.name === 'footnote') {
      // check if citation is in a footnote. If the footnote only consists of a footnote, replace the footnote with the citation
      const parentHtml = $(parent).html()

      // testing on length becasue of some sort of encoding problem?
      if (parentHtml.trim().length === xref.length) {
        // if this the case, the citation is the only thing in the footnote, so we can replace the footnote with the citation
        $(parent).replaceWith(xref)
      } else {
        // otherwise, we leave the reference in the footnote. Could change this?
      }
    }

    citations.push(ref)
    currentIndex += 1
  })
  // console.log(citations, currentIndex)
  return { cleanedHtml: $.html(), cleanedRefList: refList + citations.join('') }
}

const findCslCitations = (cleanedHtml, refCount, refList) => {
  const reCleanedRefList = [...refList]

  const dom = htmlparser2.parseDocument(cleanedHtml)
  const $ = cheerio.load(dom, { xmlMode: true })
  const cslCitations = $('p.ref')
  cslCitations.each((index, citation) => {
    // console.log('index: ', index)
    const { attribs } = $(citation)[0]
    const structure = attribs['data-structure']
    let parsedStructure = {}
    let thisJatsReference = `<ref id='ref-${index + refCount}'>`

    try {
      parsedStructure = JSON.parse(structure)
      // console.log('Parsed structure: ', parsedStructure)
      thisJatsReference += '<element-citation>'

      if (parsedStructure['citation-number']) {
        thisJatsReference += `<label>${parsedStructure['citation-number']}</label>`
      }

      if (parsedStructure.author && parsedStructure.author.length) {
        thisJatsReference += `<person-group person-group-type="author">${parsedStructure.author
          .map(author => {
            let thisAuthor = '<name>'

            if (author.family) {
              thisAuthor += `<surname>${author.family}</surname>`
            }

            if (author.given) {
              thisAuthor += `<given-names>${author.given}</given-names>`
            }

            // TODO: there can also be sequence – what do we do with that?
            // This doesn't quite map on to <role />

            thisAuthor += '</name>'
            return thisAuthor
          })
          .join('')}</person-group>`
      }

      if (parsedStructure.title) {
        thisJatsReference += `<article-title>${parsedStructure.title}</article-title>`
      }

      if (parsedStructure['container-title']) {
        thisJatsReference += `<@source>${parsedStructure['container-title']}</@source>`
      }

      if (parsedStructure.issued) {
        thisJatsReference += `<year>${parsedStructure.issued}</year>`
      }

      if (parsedStructure.volume) {
        thisJatsReference += `<volume>${parsedStructure.volume}</volume>`
      }

      if (parsedStructure.issue) {
        thisJatsReference += `<issue>${parsedStructure.volume}</issue>`
      }

      if (parsedStructure.page) {
        thisJatsReference += `<fpage>${parsedStructure.page}</fpage>`
      }

      if (parsedStructure.doi) {
        thisJatsReference += `<ext-link ext-link-type="doi" xlink:href="${parsedStructure.doi}">${parsedStructure.doi}</ext-link>`
      }

      // todo: doi

      thisJatsReference += `</element-citation></ref>`
    } catch {
      console.error('Could not parse reference structure: ', structure)
      // console.error('Using text: ', textContent)
      const textContent = $(citation).text()
      thisJatsReference += `<mixed-citation>${textContent}</mixed-citation></ref>`
    }

    // console.log('Result: ', thisJatsReference)
    reCleanedRefList.push(thisJatsReference)
    $(citation).replaceWith('')
  })
  return {
    reCleanedHtml: $.html(),
    reCleanedRefList: reCleanedRefList.join(''),
  }
}

const makeCitations = html => {
  let deCitedHtml = html
  let refList = '' // this is the ref-list that we're building
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

    const dom = htmlparser2.parseDocument(thisRefList)
    const $ = cheerio.load(dom, { xmlMode: true })
    const headers = $('h1,h2,h3,h4,h5,h6')

    if (headers['0']) {
      const header = $(headers['0']).text()
      // console.log('header found: ', header, $(headers['0']).html())
      $(headers['0']).replaceWith('')
      thisRefList = $.html()
      refList = `<title>${header}</title>`
    }

    // 2.2. Get all the citations out, add to refList

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
      .map((thisCitation, index) => {
        const { ref } = cleanCitation(thisCitation, index)

        // Note: somehow this htmlToJats is killing off the <@source> tags. Replacing first, then unreplacing.
        const output = htmlToJats(
          replaceAll(
            replaceAll(ref, '<@source>', '--@source--'),
            '</@source>',
            '--/@source--',
          ),
        )

        return replaceAll(
          replaceAll(output, '--@source--', '<@source>'),
          '--/@source--',
          '</@source>',
        )
      })
      .join('')
    refCount = myRefs.length
  }

  // 2.4 deal with any loose mixed citations in the body:
  // they're pulled out of the body and added to the ref-list
  // QUESTION: Is this the right thing to do? It isn't necessarily what the user expects.
  // Theoretically you could have a <ref-list> at the end of a <sec> though why you would want
  // that is not clear to me. <mixed-citation> by itself isn't valid in a <sec> (even wrapped in <ref>).
  // The alternative would just be to delete the loose <mixed-citations>?

  while (deCitedHtml.indexOf('<p class="reference">') > -1) {
    const thisCitation = deCitedHtml
      .split('<p class="reference">')[1]
      .split('</p>')[0]

    deCitedHtml = deCitedHtml.replace(
      `<p class="reference">${thisCitation}</p>`,
      ``,
    )

    const { ref } = cleanCitation(thisCitation, refCount)
    // TODO: note that we can still get invalid results if there's a bold/italic tag in one of these! Maybe take all of them out?
    refList += htmlToJats(ref)
    refCount += 1
  }

  const { cleanedHtml, cleanedRefList } = findCitationSpans(
    deCitedHtml,
    refCount,
    refList,
  )

  // This deals with CSL references. If we want to take out non-CSL references, delete above this?

  const { reCleanedHtml, reCleanedRefList } = findCslCitations(
    cleanedHtml,
    refCount,
    refList,
  )

  if (cleanedRefList || reCleanedRefList) {
    // After parsing is done and this is just a string,<@ource> can go back
    // to being <source>
    refList = `<ref-list>${replaceAll(
      replaceAll(cleanedRefList, '</@source>', '</source>'),
      '<@source>',
      '<source>',
    )}${replaceAll(
      replaceAll(reCleanedRefList, '</@source>', '</source>'),
      '<@source>',
      '<source>',
    )}</ref-list>`
  }

  const processedHtml = reCleanedHtml

  return { processedHtml, refList }
}

module.exports = makeCitations
