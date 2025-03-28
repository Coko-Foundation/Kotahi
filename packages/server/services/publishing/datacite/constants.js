const DOI_PATH_PREFIX = 'https://doi.org/'

const RIGHTS = {
  'tk-notice':
    'Local Contexts Traditional Knowledge (TK) Notice: Recognizes the rights of Indigenous peoples to define the use of their traditional knowledge.',
  'bc-notice':
    'Local Contexts Biocultural (BC) Notice: Recognizes the rights of Indigenous peoples to define the use of information, collections, data, and digital sequence information generated from the biodiversity and genetic resources associated with their traditional lands, waters, and territories.',
  'attribution-incomplete':
    'Local Contexts Attribution-Incomplete: Indicates that the attribution information provided is incomplete and may require additional details or corrections to properly recognize the rights of Indigenous peoples and their knowledge.',
  'open-to-collaborate':
    'Local Contexts Open-to-Collaborate: Signals that the community is open to collaboration and cooperative projects, encouraging partnerships that are respectful and mutually beneficial.',
}

const ERROR_MESSAGES = {
  noDoiPrefix: 'Could not publish to Datacite, as no DOI prefix is configured.',
  noJournalName: 'Configuration Journal Name is not set',
  noArticleLocationPrefix:
    'Configuration needs to set the url where the doi will resolve',
  noSubmissionObject: 'Manuscript has no submission object',
  noSubmissionTitle: 'Manuscript has no submission.$title',
  noSubmissionAuthors: 'Manuscript has no submission.$authors field',
  authorsNotArray: 'Manuscript.submission.$authors is not an array',
  noResourceType: 'Manuscript has no submission.resourcetype',
}

// relatedIdentifiers (citations)
const CITATION_SELECTOR = 'p.ref'
const CITATION_DATA_STRUCTURE = 'data-structure'

module.exports = {
  DOI_PATH_PREFIX,
  RIGHTS,
  ERROR_MESSAGES,
  CITATION_SELECTOR,
  CITATION_DATA_STRUCTURE,
}
