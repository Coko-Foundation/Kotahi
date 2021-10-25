const he = require('he')
// const { lte } = require('semver')

const tagsToConvert = {
  b: 'bold',
  strong: 'bold',
  blockquote: 'disp-quote',
  i: 'italic',
  em: 'italic',
  li: 'list-item',
  p: 'p',
  u: 'underline',
  // ?: 'disp-formula',
  // img: 'graphic',
  // ?: 'inline-formula',
  // ?: 'mml:math',
  // ?: 'monospace',
  // ?: 'strike',
  // ?: 'tex-math',
}

const tagsToIgnore = ['ext-link', 'list', 'sc', 'sec', 'sub', 'sup', 'title']

const convertRemainingTags = markup => {
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

const convertLinks = markup => {
  return markup.replace(
    /<a href="([^"]+)"[^>]*>((?:(?!<\/a>)[\s\S])+)<\/a>/g,
    '<ext-link ext-link-type="uri" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="$1">$2</ext-link>',
  )
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

const htmlToJats = html => {
  let jats = html
  jats = insertSections(jats)
  jats = convertLinks(jats)
  jats = convertLists(jats)
  jats = convertSmallCaps(jats)
  jats = convertRemainingTags(jats)
  jats = convertCharacterEntities(jats)
  return jats
}

const getCitationsFromList = html => {
  const jats = htmlToJats(html)
  const pContents = jats.match(/(?<=<p>)((?:(?!<\/?p>)[\s\S])*)(?=<\/p>)/g)
  return pContents
}

const splitFrontBodyBack = (html, submission, journalMeta) => {
  // html is what's coming out of Wax
  // submission is the submission form & what's needed for front matter
  // journalMeta is the journal metadata object (see below for description)

  /**
   ** TODO:
   ** deal with <notes></notes>
   ** deal with <figure></figure>
   ***/

  let backlessHtml = html // html is assumed to be body; we take back things out

  // 1. deal with appendices

  let appCount = 0 // this is to give appendices IDs
  const appendices = []

  while (backlessHtml.indexOf('<section class="appendix">') > -1) {
    let thisAppendix = backlessHtml
      .split('<section class="appendix">')[1]
      .split('</section>')[0]

    backlessHtml = backlessHtml.replace(
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

    // 1.3 clean out any <h1 class="appendixheader" in backlessHtml—these just become regular H1s
    while (backlessHtml.indexOf('<h1 class="appendixheader">') > -1) {
      backlessHtml = backlessHtml.replace(`<h1 class="appendixheader">`, '<h1>')
    }
  }

  // 2. deal with citations

  let refList = '' // this is the ref-list that we're building
  let refListHeader = '' // if there's a header, it goes in here
  let refCount = 0 // this is for ID numbering

  while (backlessHtml.indexOf('<section class="reflist">') > -1) {
    let thisRefList = backlessHtml
      .split('<section class="reflist">')[1]
      .split('</section>')[0]

    backlessHtml = backlessHtml.replace(
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
    // 2.2. Get all the mixed citations out, add to refList

    while (thisRefList.indexOf('<p class="mixedcitation">') > -1) {
      const thisCitation = thisRefList
        .split('<p class="mixedcitation">')[1]
        .split('</p>')[0]

      thisRefList = thisRefList.replace(
        `<p class="mixedcitation">${thisCitation}</p>`,
        ``,
      )
      refList += `<ref id="ref-${refCount}"><mixed-citation>${htmlToJats(
        thisCitation,
      )}</mixed-citation></ref>`
      refCount += 1
    }
  }

  // 2.3 deal with any stray reference headers in the body—they become regular H1s.

  while (backlessHtml.indexOf('<h1 class="referenceheader">') > -1) {
    backlessHtml = backlessHtml.replace(`<h1 class="referenceheader">`, '<h1>')
  }

  // 2.4 deal with any loose mixed citations in the body:
  // they're pulled out of the body and added to the ref-list

  while (backlessHtml.indexOf('<p class="mixedcitation">') > -1) {
    const thisCitation = backlessHtml
      .split('<p class="mixedcitation">')[1]
      .split('</p>')[0]

    backlessHtml = backlessHtml.replace(
      `<p class="mixedcitation">${thisCitation}</p>`,
      ``,
    )
    refList += `<ref id="ref-${refCount}"><mixed-citation>${htmlToJats(
      thisCitation,
    )}</mixed-citation></ref>`
    refCount += 1
  }

  // 3 deal with faux frontmatter – these just get thrown away

  while (backlessHtml.indexOf('<section class="frontmatter">') > -1) {
    const frontMatter = backlessHtml
      .split('<section class="frontmatter">')[1]
      .split('</section>')[0]

    backlessHtml = backlessHtml.replace(
      `<section class="frontmatter">${frontMatter}</section>`,
      '',
    )
  }

  // 4 deal with front matter

  let thisFront = ''

  if (journalMeta) {
    // this is working with a journalMeta with this shape:

    // journalId: [{type: "", value: ""}]
    // journalTitle: ""
    // abbrevJouralTitle: ""
    // issn: [{type: "", value: ""}]
    // journalPublisher: ""

    let thisJournalMeta = ''

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

      thisJournalMeta += `</journal-title>`
    }

    if (journalMeta.issn && journalMeta.issn.length) {
      for (let i = 0; i < journalMeta.issn.length; i += 1) {
        if (journalMeta.issn[i].type && journalMeta.issn[i].value) {
          thisJournalMeta += `<issn publication-format="${journalMeta.issn[i].type}">${journalMeta.issn[i].value}</issn>`
        }
      }
    }

    if (journalMeta.publisher) {
      thisJournalMeta += `<publisher>${journalMeta.publisher}</publisher>`
    }

    thisFront += `<journal-meta>${thisJournalMeta}</journal-meta>`
  }

  if (submission) {
    const thisArticleMeta = ''
    thisFront += `<article-meta>${thisArticleMeta}</article-meta>`
  }

  const front = `<front>${thisFront}</front>`
  const body = `<body>${htmlToJats(backlessHtml)}</body>`

  const back = `<back>${
    appendices.length > 0 ? `<app-group>${appendices.join('')}</app-group>` : ''
  }${refList ? `<ref-list>${refList}</ref-list>` : ''}</back>`

  // check if body or back are empty, don't pass if not there.
  const jats = `<article dtd-version="1.3">${front}${
    body.length > 13 ? body : ''
  }${back.length > 13 ? back : ''}</article>`

  return { front, body, back, jats }
}

module.exports = { htmlToJats, getCitationsFromList, splitFrontBodyBack }
