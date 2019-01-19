const logger = require('@pubsweet/logger')
const { User, Team } = require('pubsweet-server/src/models')
const Manuscript = require('../../../server/manuscript/src/manuscript')
const File = require('../../../server/file/src/file')
const Journal = require('../../../server/journal/src/journal')

export async function setupWithTwoUnsubmittedManuscripts() {
  const journalData = {
    title: 'xPub Collabra',
    meta: {},
  }

  const journal = new Journal(journalData)
  await journal.save()

  const user = await new User({
    username: 'john',
    email: 'john@example.com',
    password: 'johnjohn',
    admin: true,
  }).save()

  const emptyManuscript1 = {
    meta: {
      title: 'This is a dummy document for testing purposes',
      abstract:
        'This is a dummy document for testing purposes This is a dummy document for testing purposes This is a dummy document for testing purposes This is a dummy document for testing purposes This is a dummy document for testing purposes',
      keywords: 'keywords...',
      articleType: 'original-research',
      articleSection: ['clinical-psychology'],
      declarations: {
        openData: 'no',
        preregistered: 'no',
        researchNexus: 'no',
        openPeerReview: 'no',
        streamlinedReview: 'no',
        previouslySubmitted: 'no',
      },
      notes: [
        {
          notesType: 'fundingAcknowledgement',
          content: '<p>funding acknowledgement...</p>',
        },
        {
          notesType: 'specialInstructions',
          content: 'special instructions...',
        },
      ],
      source:
        '<html xmlns="http://www.w3.org/1999/xhtml">\n<head><title>This is a dummy document for testing purposes</title>\n<meta charset="UTF-8"/></head>\n<body>\n<container id="main">\n<h1>This is a dummy document for testing purposes</h1></container>\n\n</body></html>',
    },
    status: 'new',
    authors: [
      {
        email: 'email@example.com',
        lastName: 'John',
        firstName: 'Cena',
        affiliation: 'WWE',
      },
    ],
    suggestions: {
      editors: {
        suggested: 'Marge Simpson',
      },
      reviewers: {
        suggested: 'Daffy Duck',
      },
    },
  }

  const manuscript1 = await new Manuscript(emptyManuscript1).save()

  const newFile1 = Object.assign(
    {},
    {
      url: '/uploads/ec0a2df13f11ef9feaf4411b3ffd8c47.docx',
      filename: 'testSubmission1.docx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    {
      fileType: 'manuscript',
      object: 'Manuscript',
      objectId: manuscript1.id,
    },
  )
  await new File(newFile1).save()

  // create Team Author Owner
  const team1 = new Team({
    teamType: 'author',
    name: 'Author',
    object: {
      objectId: manuscript1.id,
      objectType: 'Manuscript',
    },
    members: [user.id],
  })

  await team1.save()

  const emptyManuscript2 = {
    meta: {
      title: 'This is a test document',
      abstract:
        'This is a test document This is a test document This is a test document This is a test document This is a test document This is a test document This is a test document',
      keywords: 'keywords...',
      articleType: 'review',
      articleSection: ['clinical-psychology', 'methodology'],
      declarations: {
        openData: 'no',
        preregistered: 'no',
        researchNexus: 'no',
        openPeerReview: 'no',
        streamlinedReview: 'no',
        previouslySubmitted: 'no',
      },
      notes: [
        {
          notesType: 'fundingAcknowledgement',
          content: '<p>funding acknowledgement...</p>',
        },
        {
          notesType: 'specialInstructions',
          content: 'special instructions...',
        },
      ],
      source:
        '<html xmlns="http://www.w3.org/1999/xhtml">\n<head><title>This is a dummy document for testing purposes</title>\n<meta charset="UTF-8"/></head>\n<body>\n<container id="main">\n<h1>This is a dummy document for testing purposes</h1></container>\n\n</body></html>',
    },
    status: 'new',
    authors: [
      {
        email: 'example@email.com',
        lastName: 'Simpson',
        firstName: 'Homer',
        affiliation: 'Power Plant',
      },
    ],
    suggestions: {
      editors: {
        suggested: 'Lisa Simpso',
      },
      reviewers: {
        opposed: 'Marge Simpson',
        suggested: 'Moe Szyslak',
      },
    },
    created: new Date(),
  }
  const manuscript2 = await new Manuscript(emptyManuscript2).save()

  const newFile2 = Object.assign(
    {},
    {
      url: '/uploads/3f0a64b9b26b45d08b292f55219d5dc9.docx',
      filename: 'testSubmission1.docx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    {
      fileType: 'manuscript',
      object: 'Manuscript',
      objectId: manuscript2.id,
    },
  )
  await new File(newFile2).save()

  // create Team Author Owner
  const team2 = new Team({
    teamType: 'author',
    name: 'Author',
    object: {
      objectId: manuscript2.id,
      objectType: 'Manuscript',
    },
    members: [user.id],
  })

  await team2.save()

  logger.info('Seeding complete.')
}
