export const collection = {
  type: 'collection',
  title: 'This is a test document',
  owners: ['f34e6a7f-d078-4bcc-a45d-15b20ca06acf'],
  status: 'submitted',
  created: 1528545086643,
  fragments: ['e26c7029-47b0-4c12-94e8-70063ddf3d78'],
}

export const fragment = {
  type: 'fragment',
  files: {
    manuscript: {
      url: '/uploads/3f0a64b9b26b45d08b292f55219d5dc9.docx',
      name: 'testSubmission1.docx',
    },
    supplementary: [],
  },
  notes: {
    specialInstructions: 'confidential special instructions...',
    fundingAcknowledgement: '<p>funding body acknowledgement...</p>',
  },
  owners: ['f34e6a7f-d078-4bcc-a45d-15b20ca06acf'],
  source:
    '<html xmlns="http://www.w3.org/1999/xhtml">\n<head><title>This is a test document</title>\n<meta charset="UTF-8"/></head>\n<body>\n<container id="main">\n<h1>This is a test document</h1></container>\n\n</body></html>',
  created: '2018-06-09T11:51:26.697Z',
  version: 1,
  metadata: {
    title: 'This is a test document',
    authors: [
      {
        email: 'example@email.com',
        lastName: 'Simpson',
        firstName: 'Homer',
        affiliation: 'Power Plant',
      },
    ],
    abstract:
      'This is a test document This is a test document This is a test document This is a test document This is a test document This is a test document This is a test document',
    keywords: ['keywords...'],
    articleType: 'review',
    articleSection: ['clinical-psychology', 'methodology'],
  },
  submitted: '2018-06-09T11:53:22.599Z',
  suggestions: {
    editors: {
      suggested: ['Lisa Simpso'],
    },
    reviewers: {
      opposed: ['Marge Simpson'],
      suggested: ['Moe Szyslak'],
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
