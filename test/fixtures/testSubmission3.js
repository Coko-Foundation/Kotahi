export const collection = {
  type: 'collection',
  title: 'This is a dummy document for testing purposes',
  owners: ['f34e6a7f-d078-4bcc-a45d-15b20ca06acf'],
  status: 'submitted',
  created: 1528544237670,
  fragments: [
    //"af967b77-b860-4e57-bd3c-dd1cf3373003"
    fragment,
  ],
}

export const fragment = {
  type: 'fragment',
  files: {
    manuscript: {
      url: '/uploads/ec0a2df13f11ef9feaf4411b3ffd8c47.docx',
      name: 'testSubmission1.docx',
    },
    supplementary: [],
  },
  notes: {
    specialInstructions: 'special instructions...',
    fundingAcknowledgement: '<p>funding acknowledgement...</p>',
  },
  owners: ['f34e6a7f-d078-4bcc-a45d-15b20ca06acf'],
  source:
    '<html xmlns="http://www.w3.org/1999/xhtml">\n<head><title>This is a dummy document for testing purposes</title>\n<meta charset="UTF-8"/></head>\n<body>\n<container id="main">\n<h1>This is a dummy document for testing purposes</h1></container>\n\n</body></html>',
  created: '2018-06-09T11:37:17.717Z',
  version: 1,
  metadata: {
    title: 'This is a dummy document for testing purposes',
    authors: [
      {
        email: 'email@example.com',
        lastName: 'John',
        firstName: 'Cena',
        affiliation: 'WWE',
      },
    ],
    abstract:
      'This is a dummy document for testing purposes This is a dummy document for testing purposes This is a dummy document for testing purposes This is a dummy document for testing purposes This is a dummy document for testing purposes',
    keywords: ['keywords...'],
    articleType: 'original-research',
    articleSection: ['clinical-psychology'],
  },
  submitted: '2018-06-09T11:38:29.994Z',
  suggestions: {
    editors: {
      suggested: ['Marge Simpson'],
    },
    reviewers: {
      suggested: ['Daffy Duck'],
    },
  },
  declarations: {
    openData: 'no',
    preregistered: 'no',
    researchNexus: 'no',
    openPeerReview: 'no',
    streamlinedReview: 'no',
    previouslySubmitted: 'no',
  },
  fragmentType: 'version',
}
