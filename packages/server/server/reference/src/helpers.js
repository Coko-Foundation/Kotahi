const pluckAuthors = authors => {
  if (!authors) return authors
  return authors.map(({ given, family, sequence }) => {
    return { given, family, sequence }
  })
}

const pluckTitle = title => title && title[0]
const pluckJournalTitle = journalTitle => journalTitle && journalTitle[0]

module.exports = { pluckAuthors, pluckTitle, pluckJournalTitle }
