const he = require('he')

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

module.exports = { htmlToJats, getCitationsFromList }
