const logger = require('@pubsweet/logger')
const { User, Team } = require('pubsweet-server/src/models')
// const { setupDb } = require('@pubsweet/db-manager')
const Manuscript = require('../../../server/manuscript/src/manuscript')
const File = require('../../../server/file/src/file')
const Journal = require('../../../server/journal/src/journal')

export async function setupWithOneSubmittedManuscript() {
  const journalData = {
    title: 'xPub Collabra',
    meta: {},
  }

  const journal = new Journal(journalData)
  await journal.save()

  let user = await User.findByUsername('john')
  if (!user) {
    user = await new User({
      username: 'john',
      email: 'john@example.com',
      password: 'johnjohn',
      admin: true,
    }).save()
  }

  const emptyManuscript = {
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
    status: 'submitted',
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

  const manuscript = await new Manuscript(emptyManuscript).save()

  const newFile = Object.assign(
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
      objectId: manuscript.id,
    },
  )
  await new File(newFile).save()

  // create Team Author Owner
  const team = new Team({
    teamType: 'author',
    name: 'Author',
    object: {
      objectId: manuscript.id,
      objectType: 'Manuscript',
    },
    members: [user.id],
  })

  await team.save()

  logger.info('Seeding complete.')
}
