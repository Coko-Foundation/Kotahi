const he = require('he')
const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')

// const { lte } = require('semver')

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace)
}

const htmlToJatsTagMap = {
  b: 'bold',
  strong: 'bold',
  blockquote: 'disp-quote',
  i: 'italic',
  em: 'italic',
  li: 'list-item',
  p: 'p',
  u: 'underline',
  // figure: 'fig',
  // ?: 'disp-formula',
  // img: 'graphic',
  // ?: 'inline-formula',
  // ?: 'mml:math',
  // ?: 'monospace',
  // ?: 'strike',
  // ?: 'tex-math',
}

const jatsTagsThatDontNeedConversion = [
  'ext-link',
  'list',
  'sc',
  'sec',
  'sub',
  'sup',
  'title',
  'xref',
  'graphic',
  'caption',
  'thead',
  'table',
  'tbody',
  'tr',
  'td',
  'math-inline',
  'math-display',
  'bold',
  'disp-quote',
  'italic',
  'underline',
  'list-item',
  '@sec',
  '@title',
  'fig',
  'table-wrap',
]

/** Finds all XML tags and:
 * converts them to another tag if they are in tagsToConvert (discarding all attributes);
 * deletes them if they are not in tagsToConvert or tagsToIgnore;
 * otherwise leaves them untouched
 * */
const convertTagsAndRemoveTags = (markup, tagsToConvert, tagsToIgnore) => {
  const openTagRegex = /<([^/>\s]+)(?:(?!\/?>)[\s\S])*>/g
  const closeTagRegex = /<\/([^/>\s]+)>/g
  const selfClosingTagRegex = /<([^/>\s]+)(?:(?!\/?>)[\s\S])*\/>/g

  const convertSomeTags = (mkup, tagRegex, tagType) => {
    let result = ''
    let lastIndex = 0

    while (true) {
      const match = tagRegex.exec(mkup)
      if (!match) break
      result += mkup.substring(lastIndex, match.index)
      const tagName = match[1]

      if (tagsToIgnore.includes(tagName)) result += match[0]
      else {
        const replacementTag = tagsToConvert[tagName]

        if (replacementTag) {
          if (tagType === 'open') result += `<${replacementTag}>`
          else if (tagType === 'close') result += `</${replacementTag}>`
          else if (tagType === 'self-close') result += `<${replacementTag}/>`
        }
      }

      lastIndex = match.index + match[0].length
    }

    result += mkup.substring(lastIndex)
    return result
  }

  let result = markup
  result = convertSomeTags(result, openTagRegex, 'open')
  result = convertSomeTags(result, closeTagRegex, 'close')
  result = convertSomeTags(result, selfClosingTagRegex, 'self-close')
  return result
}

const convertRemainingTags = markup =>
  convertTagsAndRemoveTags(
    markup,
    htmlToJatsTagMap,
    jatsTagsThatDontNeedConversion,
  )

const sectionRegexes = [
  /<h1>((?:(?!<\/h1>)[\s\S])*)<\/h1>((?:(?!<h1>)[\s\S])*)/g,
  /<h2>((?:(?!<\/h2>)[\s\S])*)<\/h2>((?:(?!<h[12]>|<sec>)[\s\S])*)/g,
  /<h3>((?:(?!<\/h3>)[\s\S])*)<\/h3>((?:(?!<h[1-3]>|<sec>)[\s\S])*)/g,
  /<h4>((?:(?!<\/h4>)[\s\S])*)<\/h4>((?:(?!<h[1-4]>|<sec>)[\s\S])*)/g,
  /<h5>((?:(?!<\/h5>)[\s\S])*)<\/h5>((?:(?!<h[1-5]>|<sec>)[\s\S])*)/g,
  /<h6>((?:(?!<\/h6>)[\s\S])*)<\/h6>((?:(?!<h[1-6]>|<sec>)[\s\S])*)/g,
]

const insertSections = markup => {
  let result = markup
  sectionRegexes.forEach(regex => {
    result = result.replace(regex, '<sec><title>$1</title>$2</sec>')
  })
  return result
}

/** Replace <a href="..."> with <ext-link ...> ONLY IF the target starts with 'http://', 'https://' or 'ftp://'.
 * For other targets such as '#ref1' or 'mailto:a@b.com', just strip the <a> tags off leaving the inner content.
 */
const convertLinks = markup => {
  return markup
    .replace(
      /<a href="((?:https?|ftp):\/\/[^"\s]+)"[^>]*>((?:(?!<\/a>)[\s\S])+)<\/a>/g,
      '<ext-link ext-link-type="uri" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="$1">$2</ext-link>',
    )
    .replace(/<a\b[^>]*>((?:(?!<\/a>)[\s\S])+)<\/a>/g, '$1')
}

const convertLists = markup => {
  return markup
    .replace(/<ol>/g, '<list list-type="order">')
    .replace(/<ul>/g, '<list list-type="bullet">')
    .replace(/<\/[ou]l>/g, '</list>')
}

const convertSmallCaps = markup => {
  // TODO This regex approach is unsafe with nested spans.
  // Currently this is the only type of span emitted by the SimpleWaxEditor, so should be OK for now.
  return markup.replace(
    /<span class="small-caps">((?:(?!<\/span>)[\s\S])*)<\/span>/g,
    '<sc>$1</sc>',
  )
}

const convertCharacterEntities = markup => {
  const entityRegex = /&[a-zA-Z#0-9]+;/g
  let result = ''
  let lastIndex = 0

  while (true) {
    const match = entityRegex.exec(markup)
    if (!match) break
    result += markup.substring(lastIndex, match.index)
    result += he.encode(he.decode(match[0]))
    lastIndex = match.index + match[0].length
  }

  result += markup.substring(lastIndex)
  return result
}

// eslint-disable-next-line no-control-regex
const illegalCharRegex = /[\p{Cs}\p{Cn}\x00-\x08\x0B\x0E-\x1F\x7F\x80-\x9F]/gu

/** Remove surrogates, unassigned characters (including noncharacters) and control characters other than ASCII whitespace. */
const removeIllegalCharacters = markup => markup.replace(illegalCharRegex, '')

const fixNestedTables = html => {
  // Wax (and HTML) allows a <table> to be inside of a <td>. JATS doesn't allow this.
  // For now, we are deleting these nested tables so as to return valid JATS.

  const dom = htmlparser2.parseDocument(html)
  const $ = cheerio.load(dom, { xmlMode: true })
  $('td').each((index, el) => {
    const $elem = $(el)
    $elem.find('table').remove()
    return $elem
  })
  return $.html()
}

const convertImages = html => {
  const dom = htmlparser2.parseDocument(html)

  const $ = cheerio.load(dom, {
    xmlMode: true,
  })

  $('figure').replaceWith((index, el) => {
    const caption = $(el).find('figcaption').html() // this comes back null if not found
    const graphicElement = $(el).find('img')
    const graphicSrc = graphicElement.attr('src')
    // 1 get caption if there is one
    // 2 get image if there is one
    // 3 change image tag
    // 4 change images attribute
    // 5 change figure tags
    // 6. clear out all content
    // 7. add caption if there is one
    // 8. add image
    const outCaption = caption ? `<caption><p>${caption}</p></caption>` : ''
    const outGraphic = `<graphic xlink:href="${graphicSrc}" />`
    const output = `<fig>${outCaption}${outGraphic}</fig>`
    return output
  })

  const output = $.html()

  return output
}

const htmlToJats = html => {
  let jats = html
  jats = removeIllegalCharacters(jats)
  jats = insertSections(jats)
  jats = convertImages(jats)
  jats = convertLinks(jats)
  jats = convertLists(jats)
  jats = convertSmallCaps(jats)
  jats = convertRemainingTags(jats)
  jats = convertCharacterEntities(jats)
  return jats
}

// note this regex is intended for node, and doesn't work in some browsers (so it breaks Storybook on Safari)
const paragraphOrListItemRegex = /(?<=<p\b[^>]*>)[\s\S]*?(?=<\/p>)|(?<=<li>)(?:(?!<p\b)[\s\S])*?(?=<\/li>)/g

const getParagraphOrListItems = html => {
  return html
    .match(paragraphOrListItemRegex)
    .map(s => s.trim())
    .filter(s => !!s)
}

// TODO Move the following into a separate file crossrefUtils.js; shift some other functions here into htmlUtils.js.
/** Get Crossref-style citation XML, treating each nonempty paragraph or list item as a separate citation */
const getCrossrefCitationsFromList = html => {
  const items = getParagraphOrListItems(removeIllegalCharacters(html))
  return items.map(item => {
    let result = item.replace(
      /<span class="small-caps">((?:(?!<\/span>)[\s\S])*)<\/span>/g,
      '<scp>$1</scp>',
    )

    result = convertTagsAndRemoveTags(result, {}, [
      'b',
      'i',
      'em',
      'strong',
      'u',
      'sup',
      'sub',
      'scp',
    ])

    result = convertCharacterEntities(result)
    return result
  })
}

const removeTrackChanges = html => {
  const dom = htmlparser2.parseDOM(html)

  const $ = cheerio.load(dom, {
    xmlMode: true,
  })

  $('span.deletion').remove()
  return $.html()
}

const makeJournalMeta = journalMeta => {
  // this is working with a journalMeta with this shape:

  // journalId: [{type: "", value: ""}]
  // journalTitle: ""
  // abbrevJouralTitle: ""
  // issn: [{type: "", value: ""}]
  // journalPublisher: ""
  let thisJournalMeta = ''

  if (journalMeta) {
    if (journalMeta.journalId && journalMeta.journalId.length) {
      for (let i = 0; i < journalMeta.journalId.length; i += 1) {
        if (journalMeta.journalId[i].type && journalMeta.journalId[i].value) {
          thisJournalMeta += `<journal-id journal-id-type="${journalMeta.journalId[i].type}">${journalMeta.journalId[i].value}</journal-id>`
        }
      }
    }

    if (journalMeta.journalTitle) {
      thisJournalMeta += `<journal-title-group><journal-title>${journalMeta.journalTitle}</journal-title>`

      if (journalMeta.abbrevJournalTitle) {
        thisJournalMeta += `<abbrev-journal-title>${journalMeta.abbrevJournalTitle}</abbrev-journal-title>`
      }

      thisJournalMeta += `</journal-title-group>`
    }

    if (journalMeta.issn && journalMeta.issn.length) {
      for (let i = 0; i < journalMeta.issn.length; i += 1) {
        if (journalMeta.issn[i].type && journalMeta.issn[i].value) {
          thisJournalMeta += `<issn publication-format="${journalMeta.issn[i].type}">${journalMeta.issn[i].value}</issn>`
        }
      }
    }

    if (journalMeta.publisher && journalMeta.publisher.publisherName) {
      thisJournalMeta += `<publisher><publisher-name>${journalMeta.publisher.publisherName}</publisher-name></publisher>`
    }
  }

  return thisJournalMeta && `<journal-meta>${thisJournalMeta}</journal-meta>`
}

const makeArticleMeta = (metadata, abstract, title) => {
  // metadata:
  // --pubDate: date
  // --id: id
  // --title: title
  // --submission: submission form PARSED BEFORE IT GETS HERE
  //   --abstract: html
  //   --authors: array
  //     --id: '3dcc3f77-647e-48b5-86d9-aa3540375f60',
  //     --email: string
  //     --lastName: string
  //     --firstName: string
  //     --affiliation: string
  //   --content: array of string (this is keywords)
  //   --issueNumber: string
  //   --volumeNumber: string
  // title: html string, from the title, if it exists
  // abstract: html string, from the abstract tag if it exists

  let thisArticleMeta = ''

  const formData = metadata.submission || {}

  if (metadata.id) {
    thisArticleMeta += `<article-id pub-id-type="publisher-id">${metadata.id}</article-id>`
  }

  if (metadata.title) {
    thisArticleMeta += `<title-group><article-title>${
      title || metadata.title
    }</article-title></title-group>`
  }

  if (formData.authors && formData.authors.length) {
    let authorsList = ''
    let affilList = ''

    for (let i = 0; i < formData.authors.length; i += 1) {
      if (formData.authors[i].lastName && formData.authors[i].firstName) {
        authorsList += `<contrib contrib-type="author"><name><surname>${formData.authors[i].lastName}</surname><given-names>${formData.authors[i].firstName}</given-names></name>`
      }

      if (formData.authors[i].affiliation) {
        const thisId = formData.authors[i].id || `author_${i}`
        authorsList += `<xref ref-type="aff" rid="${thisId}" />`
        affilList += `<aff id="${thisId}">${formData.authors[i].affiliation}</aff>`
      }

      authorsList += `</contrib>`
    }

    thisArticleMeta += `<contrib-group>${authorsList}</contrib-group>${affilList}`
  }

  if (metadata.pubDate) {
    const theDate = new Date(metadata.pubDate)
    const date = theDate.getUTCDate()
    const month = theDate.getUTCMonth() + 1
    const year = theDate.getUTCFullYear()
    const pubDateString = `<pub-date publication-format="print" date-type="pub" iso-8601-date="${year}-${month}-${date}"><day>${date}</day><month>${month}</month><year>${year}</year></pub-date>`
    thisArticleMeta += pubDateString
  } else {
    thisArticleMeta += `<pub-date-not-available />`
  }

  if (formData.volumeNumber) {
    thisArticleMeta += `<volume>${formData.volumeNumber}</volume>`
  }

  if (formData.issueNumber) {
    thisArticleMeta += `<issue>${formData.issueNumber}</issue>`
  }

  if (abstract || formData.abstract) {
    // TODO: note that the quotes in submission.abstract can be escaped. Does this break our parser?
    thisArticleMeta += `<abstract>${htmlToJats(
      abstract || formData.abstract,
    )}</abstract>`
  }

  if (formData.content && formData.content.length) {
    // this is for keywords
    let contentList = ''

    for (let i = 0; i < formData.content.length; i += 1) {
      contentList += `<kwd>${formData.content[i]}</kwd>`
    }

    thisArticleMeta += `<kwd-group kwd-group-type="author">${contentList}</kwd-group>`
  }

  return `<article-meta>${thisArticleMeta}</article-meta>`
}

const makeFootnotesSection = html => {
  let deFootnotedHtml = html
  let footnoteCount = 0
  let fnSection = ''

  while (deFootnotedHtml.indexOf(`<footnote id="`) > -1) {
    // get id and text from Wax markup
    const [id, text] = deFootnotedHtml
      .split('<footnote id="')[1]
      .split('</footnote')[0]
      .split('">')

    footnoteCount += 1
    // replace body text with JATS tag
    deFootnotedHtml = deFootnotedHtml.replace(
      `<footnote id="${id}">${text}</footnote>`,
      `<xref ref-type="fn" rid="fnid${id}">${footnoteCount}</xref>`,
    )
    // add this to the list of footnotes
    fnSection += `<fn id="fnid${id}"><p>${htmlToJats(text)}</p></fn>`
  }

  if (footnoteCount > 0) {
    fnSection = `<fn-group>${fnSection}</fn-group>`
  }

  return { deFootnotedHtml, fnSection }
}

const makeAcknowledgements = html => {
  const searchFor1 = '<section class="acknowledgementsSection">'
  const searchFor2 = '</section>'
  let ack = ''
  let deackedHtml = html

  // NOTE: JATS only allows a single acknowledgements section.
  // If there are more than one acknowledgements sections in the text
  // (which Wax currently allows), only the last one is taken.

  while (deackedHtml.indexOf(searchFor1) > -1) {
    const thisAcknowledgements = deackedHtml
      .split(searchFor1)[1]
      .split(searchFor2)[0]

    deackedHtml = deackedHtml.replace(
      `${searchFor1}${thisAcknowledgements}${searchFor2}`,
      '',
    )
    ack = `<ack>${htmlToJats(thisAcknowledgements)}</ack>`
  }

  return { deackedHtml, ack: ack || '' }
}

const fixTableCells = html => {
  // This runs the content of <td>s individually though htmlToJats
  // This doesn't deal with <th>s though I don't think we're getting them.

  let deTabledHtml = html

  while (deTabledHtml.indexOf('<td>') > -1) {
    const tableCellContent = deTabledHtml.split('<td>')[1].split('</td>')[0]

    deTabledHtml = deTabledHtml.replace(
      `<td>${tableCellContent}`,
      `<!td!>${htmlToJats(tableCellContent)}`,
    )
  }

  // So that these don't get screwed up by later sectioning
  deTabledHtml = replaceAll(deTabledHtml, '<title>', '<@title>')
  deTabledHtml = replaceAll(deTabledHtml, '</title>', '</@title>')
  deTabledHtml = replaceAll(deTabledHtml, '<sec>', '<@sec>')
  deTabledHtml = replaceAll(deTabledHtml, '</sec>', '</@sec>')

  deTabledHtml = replaceAll(deTabledHtml, '<!td!>', '<td>')
  return { deTabledHtml }
}

const makeAppendices = html => {
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

    let headerFound = false // If there is more than header, it's turned into a regular H1, which will get wrapped in sections.

    while (thisAppendix.indexOf('<h1 class="appendixheader">') > -1) {
      const thisHeader = thisAppendix
        .split(`<h1 class="appendixheader">`)[1]
        .split('</h1')[0]

      thisAppendix = thisAppendix.replace(
        `<h1 class="appendixheader">${thisHeader}</h1>`,
        !headerFound // if this is the first header, don't add a secti
          ? `<title>${thisHeader}</title>`
          : `<h1>${thisHeader}</h1>`,
      )
      headerFound = true
    }

    // 1.2. jats the internal contents
    appendices.push(
      `<app id="app-${appCount}">${htmlToJats(thisAppendix)}</app>`,
    )
    appCount += 1

    // 1.3 clean out any <h1 class="appendixheader" in deAppendixedHtml—these just become regular H1s
    while (deAppendixedHtml.indexOf('<h1 class="appendixheader">') > -1) {
      deAppendixedHtml = deAppendixedHtml.replace(
        `<h1 class="appendixheader">`,
        '<h1>',
      )
    }
  }

  return {
    deAppendixedHtml,
    appendices: appendices.length
      ? `<app-group>${appendices.join('')}</app-group>`
      : '',
  }
}

const makeCitations = html => {
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

  if (refList) {
    refList = `<ref-list>${refList}</ref-list>`
  }

  return { deCitedHtml, refList }
}

const makeFrontMatter = html => {
  let deFrontedHtml = html
  let abstract = ''
  let title = '' // this would be where we'd put a title if we find one

  while (deFrontedHtml.indexOf('<section class="frontmatter">') > -1) {
    const frontMatter = deFrontedHtml
      .split('<section class="frontmatter">')[1]
      .split('</section>')[0]

    // look and see if there's a title

    if (frontMatter.indexOf('<h1>') > -1) {
      // if there's an H1 in the front matter, send it back as the title.
      // note that we are only taking the first one
      title = frontMatter.split('<h1>')[1].split('</h1>')[0]
    }

    // look and see if there's an abstract

    if (frontMatter.indexOf('<section class="abstractSection">') > -1) {
      // we are only taking the first one.
      // if there is more than one abstract, subsequent ones will be ignored
      abstract = frontMatter
        .split('<section class="abstractSection">')[1]
        .split('</section>')[0]
    }

    deFrontedHtml = deFrontedHtml.replace(
      `<section class="frontmatter">${frontMatter}</section>`,
      '',
    )
  }

  // finally, get rid of any abstracts that are not in the front matter

  while (deFrontedHtml.indexOf('<section class="abstractSection">') > -1) {
    const abstractSection = deFrontedHtml
      .split('<section class="abstractSection">')[1]
      .split('</section>')[0]

    if (!abstract) {
      // if we have not found an abstract so far, take this abstract (not in a front matter) as the absact
      abstract = abstractSection
    }

    deFrontedHtml = deFrontedHtml.replace(
      `<section class="abstractSection">${abstractSection}</section>`,
      '',
    )
  }

  return { abstract, deFrontedHtml, title }
}

const makeJats = (html, articleMeta, journalMeta) => {
  // html is what's coming out of Wax
  // articleMeta is what's needed for front matter (see makeArticleMeta for description)
  // journalMeta is the journal metadata object (see makeJournalMeta for description)

  // 0. deal with footnotes

  const unTrackChangedHtml = removeTrackChanges(html)

  const { deFootnotedHtml, fnSection } = makeFootnotesSection(
    unTrackChangedHtml,
  )

  const { deackedHtml, ack } = makeAcknowledgements(deFootnotedHtml)

  // 0.25 fix nested tables

  const removeNestedTables = fixNestedTables(deackedHtml)

  // 0.5 deal with table cells

  const { deTabledHtml } = fixTableCells(removeNestedTables)

  // 1. deal with appendices

  const { deAppendixedHtml, appendices } = makeAppendices(deTabledHtml)

  // 2. deal with citations

  const { deCitedHtml, refList } = makeCitations(deAppendixedHtml)

  // 3 deal with faux frontmatter – these just get thrown away

  const { abstract, deFrontedHtml, title } = makeFrontMatter(deCitedHtml)

  // 4 deal with article and journal metadata

  const journalMetaSection = makeJournalMeta(journalMeta || {})

  const articleMetaSection = makeArticleMeta(articleMeta || {}, abstract, title)

  const front = `<front>${journalMetaSection}${articleMetaSection}</front>`
  let body = htmlToJats(deFrontedHtml)
  // this is to clean out the bad table tags
  body = replaceAll(body, '<table>', '<table-wrap><table>')
  body = replaceAll(body, '</table>', '</table></table-wrap>')
  body = replaceAll(body, '<@title>', '<title>')
  body = replaceAll(body, '</@title>', '</title>')
  body = replaceAll(body, '<@sec>', '<sec>')
  body = replaceAll(body, '</@sec>', '</sec>')
  body = `<body>${body}</body>`

  const back = `<back>${ack}${appendices}${refList}${fnSection}</back>`

  // check if body or back are empty, don't pass if not there.
  const jats = `<article xml:lang="en" xmlns:mml="http://www.w3.org/1998/Math/MathML"	xmlns:xlink="http://www.w3.org/1999/xlink" dtd-version="1.3">${front}${
    body.length > 13 ? body : ''
  }${back.length > 13 ? back : ''}</article>`

  return { front, body, back, jats }
}

module.exports = {
  htmlToJats,
  getCrossrefCitationsFromList,
  makeJats,
}
