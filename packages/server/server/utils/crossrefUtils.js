const {
  getParagraphOrListItems,
  convertTagsAndRemoveTags,
  convertCharacterEntities,
} = require('./htmlUtils')

const { removeIllegalCharacters } = require('./htmlUtils')

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

module.exports = { getCrossrefCitationsFromList }
