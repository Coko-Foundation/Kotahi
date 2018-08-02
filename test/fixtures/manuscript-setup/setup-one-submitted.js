const logger = require('@pubsweet/logger')
const { Collection, Fragment, User } = require('pubsweet-server/src/models')
const { setupDb } = require('@pubsweet/db-manager')

export async function setupWithOneSubmittedManuscript() {
  await setupDb({
    username: 'admin',
    password: 'password',
    email: 'admin@example.com',
    admin: true,
    clobber: true,
  })

  const user = await new User({
    username: 'john',
    email: 'john@example.com',
    password: 'johnjohn',
    admin: true,
  }).save()

  const collection = new Collection({
    title: 'My Blog',
    owners: [user.id],
    status: 'submitted',
  })
  await collection.save()

  const fragment1 = await new Fragment({
    type: 'fragment',
    collections: [collection.id],
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
    owners: [user.id],
    source:
      '<html xmlns="http://www.w3.org/1999/xhtml">\n<head><title>This is a dummy document for testing purposes</title>\n<meta charset="UTF-8"/></head>\n<body>\n<container id="main">\n<h1>This is a dummy document for testing purposes</h1></container>\n\n</body></html>',
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
    submitted: '2018-05-23T07:17:38.601Z',
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
  }).save()

  collection.addFragment(fragment1)

  await collection.save()

  logger.info('Seeding complete.')
}
