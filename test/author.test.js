import faker from 'faker'
import { Selector } from 'testcafe'
import { prepareEditor } from './helpers/prosemirror-helper'
import { startServer, setup, teardown } from './helpers/setup'
import { login, dashboard, submission } from './pageObjects'

const config = require('config')

const goodInkConfig = {
  inkEndpoint: 'http://inkdemo-api.coko.foundation/',
  email: 'editoria@coko.foundation',
  password: 'editoria',
  recipes: {
    'editoria-typescript': '2',
  },
}

let author
const title = 'this is a test submission'

// const badInkConfig = {
//   inkEndpoint: 'http://testinkdemo-api.coko.foundation/',
//   email: 'test@example.com',
//   password: 'p',
//   recipes: {
//     'editoria-typescript': '1',
//   },
// }

fixture
  .only('Author user')
  .before(async () => {
    config['pubsweet-component-ink-backend'] = goodInkConfig
    await startServer()
  })
  .beforeEach(async () => {
    const result = await setup()

    author = result.userData

    await login.doLogin(author.username, author.password)
  })
  .afterEach(teardown)

test('Manage submissions journey, create new submission', async t => {
  await t.expect(Selector(dashboard.mySubmissionsTitle).exists).notOk()
  // console.log(config.get('pubsweet-component-ink-backend'),1111111111111111)

  await t
    .setFilesToUpload(dashboard.createSubmission, ['./testSubmission1.docx'])
    .wait(30000)
    .expect(
      Selector('div[id="metadata.title"] div[contenteditable=true]').exists,
    )
    .ok()

  await t.typeText(submission.title, title, { replace: true })

  await t
    .typeText(
      ...(await prepareEditor(submission.abstract, faker.lorem.words(20))),
    )
    .pressKey('tab')
    .click(submission.addAuthor)
    .typeText(submission.authorFirstName, faker.internet.domainWord())
    .typeText(submission.authorLastName, faker.internet.domainWord())
    .typeText(submission.authorEmail, faker.internet.exampleEmail())
    .typeText(submission.authorAffiliation, faker.internet.domainWord())
    .typeText(submission.keywords, faker.lorem.words(3))
    .click(submission.articleType)
    .click(submission.articleTypeOptions.nth(0))
    .click(submission.articleSectionOptions.nth(2))
    .click(submission.articleSectionOptions.nth(3))

    .click(submission.openDataOptions.nth(0))
    .click(submission.previouslySubmittedOptions.nth(0))
    .click(submission.openPeerReviewOptions.nth(1))
    .click(submission.streamlinedReviewOptions.nth(0))
    .click(submission.researchNexusOptions.nth(1))
    .click(submission.preregisteredOptions.nth(0))

  await t
    .typeText(
      ...(await prepareEditor(
        submission.fundingAcknowledgement,
        faker.lorem.words(3),
      )),
    )
    .click(dashboard.collabraHome)

  await t
    .expect(Selector(dashboard.submissionStatus(1)).exists)
    .ok()
    .expect(dashboard.submissionStatus(1).innerText)
    .contains('UNSUBMITTED')
    .expect(Selector(dashboard.submissionSummaryInfoLink(0)).exists)
    .ok()
})

test
  .before(async t => {
    startServer()
    const result = await setup()

    // config.util.extendDeep(
    //   {},
    //   JSON.parse(JSON.stringify(config.get('pubsweet-component-ink-backend'))),
    //   JSON.parse(JSON.stringify(badInkConfig)),
    // )

    author = result.userData
    await login.doLogin(author.username, author.password)
  })('Manage submissions journey, failed new submission', async t => {
    await t
      .setFilesToUpload(dashboard.createSubmission, ['./testSubmission1.docx'])
      .expect(await Selector('div').withText('Internal Server Error').exists)
    await t.expect(dashboard.createSubmission).exists
  })
  .after(async t => {
    config.util.extendDeep(
      {},
      JSON.parse(JSON.stringify(config.get('pubsweet-component-ink-backend'))),
      JSON.parse(JSON.stringify(config.get('pubsweet-component-ink-backend'))),
    )
  })
