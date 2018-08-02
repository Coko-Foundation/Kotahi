const logger = require('@pubsweet/logger')
const { Collection, Fragment, User } = require('pubsweet-server/src/models')
const { setupDb } = require('@pubsweet/db-manager')

export async function setupWithTwoSubmittedManuscriptsReviewerAssigned() {
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

  const collection1 = new Collection({
    title: 'My Blog',
    owners: [user.id],
  })
  await collection1.save()

  const collection2 = new Collection({
    title: 'My Blog 2',
    owners: [user.id],
  })
  await collection2.save()

  const fragment1 = await new Fragment({
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

  const fragment2 = await new Fragment({
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
    owners: [],
    source:
      '<html xmlns="http://www.w3.org/1999/xhtml">\n<head><title>This is a test document</title>\n<meta charset="UTF-8"/></head>\n<body>\n<container id="main">\n<h1>This is a test document</h1></container>\n\n</body></html>',
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
    submitted: '2018-05-23T07:17:38.601Z',
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
  }).save()

  collection1.addFragment(fragment1)
  collection2.addFragment(fragment2)

  await collection1.save()
  await collection2.save()

  logger.info('Seeding complete.')
}
