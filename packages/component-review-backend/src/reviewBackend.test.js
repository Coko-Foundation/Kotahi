process.env.SUPPRESS_NO_CONFIG_WARNING = true
process.env.NODE_CONFIG = '{"mailer":{"from":"sender@example.com"}}'

const express = require('express')
const supertest = require('supertest')
const bodyParser = require('body-parser')

// mocks
jest.mock('./transport', () => ({ sendMail: jest.fn() }))
jest.mock('pubsweet-server/src/models/User', () => ({
  find: jest.fn(() => ({ email: 'author@example.org' })),
}))
jest.mock('pubsweet-server/src/models/Fragment', () => ({
  find: jest.fn(() => ({
    version: 1,
    owners: [{}],
    updateProperties(update) {
      Object.assign(this, update)
    },
    save: () => {},
  })),
}))
jest.mock('pubsweet-server/src/models/Collection', () => ({
  find: jest.fn(() => ({
    updateProperties: () => {},
    save: () => {},
  })),
}))
jest.mock('pubsweet-server/src/helpers/authsome', () => ({
  can: jest.fn(() => true),
}))

const authsome = require('pubsweet-server/src/helpers/authsome')
const transport = require('./transport')
const component = require('./reviewBackend')

function makeApp() {
  const app = express()
  app.use(bodyParser.json())
  component(app)
  return supertest(app)
}

describe('/api/make-decision route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('sends email on acceptance', async () => {
    const app = makeApp()
    const response = await app.patch('/api/make-decision').send({
      decision: { recommendation: 'accept', note: { content: 'blah blah' } },
      versionId: 1,
      projectId: 2,
    })
    expect(response.body.version).toBeDefined()
    expect(response.body.project).toBeDefined()
    expect(response.body.nextVersion).not.toBeDefined()
    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'sender@example.com',
        to: ['author@example.org'],
        subject: 'Decision made',
      }),
    )
  })

  it('rejects if not authorised', async () => {
    authsome.can.mockReturnValue(false)
    const app = makeApp()
    const response = await app.patch('/api/make-decision').send({
      decision: { recommendation: 'accept', note: { content: 'blah blah' } },
      versionId: 1,
      projectId: 2,
    })
    expect(response.status).toBe(403)
    expect(transport.sendMail).not.toHaveBeenCalled()
  })
})
