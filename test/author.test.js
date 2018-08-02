import config from 'config'
import { Selector } from 'testcafe'
import { createSubmission } from './helpers/submission'
import { startServer, setup, teardown } from './helpers/setup'
import { setupWithTwoUnsubmittedManuscripts } from './fixtures/manuscript-setup/setup-two-unsubmitted'
import { login, dashboard, submission, confirmation } from './pageObjects'

const goodInkConfig = {
  inkEndpoint: 'http://inkdemo-api.coko.foundation/',
  email: 'editoria@coko.foundation',
  password: 'editoria',
  recipes: {
    'editoria-typescript': '2',
  },
}

let author

fixture
  .only('Author user')
  .before(async () => {
    config['pubsweet-component-ink-backend'] = goodInkConfig
    await startServer()
  })
  .afterEach(teardown)

test.skip
  .before(async t => {
    const result = await setup()
    author = result.userData
    await login.doLogin(author.username, author.password)
  })('create new submission', async t => {
    await t.expect(Selector(dashboard.mySubmissionsTitle).exists).notOk()

    await createSubmission('./fixtures/testSubmission1.docx')

    await t.click(dashboard.collabraHome)

    await t
      .expect(Selector(dashboard.submissionStatus(1)).exists)
      .ok()
      .expect(dashboard.submissionStatus(1).innerText)
      .contains('UNSUBMITTED')
      .expect(Selector(dashboard.submissionSummaryInfoLink(0)).exists)
      .ok()
  })
  .after(async t => {
    teardown()
  })

test
  .before(async t => {
    const result = await setup()
    author = result.userData
    await login.doLogin(author.username, author.password)
  })('Failed new submission', async t => {
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

test.before(async t => {
  await setupWithTwoUnsubmittedManuscripts()
  await login.doLogin('john', 'johnjohn')
})('Author submits manuscript', async t => {
  await t
    .wait(1000)
    .click(dashboard.submissionSummaryInfoLink(1))
    .wait(1000)
    .click(submission.submit.withText('SUBMIT YOUR MANUSCRIPT'))
    .wait(1000)
    .expect(confirmation.returnToSubmission.exists)

  await t.wait(500).click(confirmation.returnToSubmission)

  await t
    .expect(
      Selector(submission.submit.withText('SUBMIT YOUR MANUSCRIPT')).exists,
    )
    .ok()

  await t.click(submission.submit.withText('SUBMIT YOUR MANUSCRIPT'))

  await t
    .wait(1000)
    .expect(confirmation.submitManuscript.exists)
    .ok()

  await t.wait(1000).click(confirmation.submitManuscript)

  await t
    .expect(Selector(dashboard.myManuscriptsTitle).exists) // fails when admin user == false
    .ok()

  await t
    .expect(Selector(dashboard.manuscript(1)).exists)
    .ok()
    .expect(Selector(dashboard.manuscriptStatus(1)).exists)
    .ok()
    .expect(dashboard.manuscriptStatus(1).innerText)
    .contains('SUBMITTED')

    .expect(Selector(dashboard.submissionStatus(1)).exists)
    .ok()
    .expect(dashboard.submissionStatus(1).innerText)
    .contains('UNSUBMITTED')

  await t
    .expect(Selector(dashboard.submissionStatus(2)).exists)
    .ok()
    .expect(dashboard.submissionStatus(2).innerText)
    .contains('SUBMITTED')
    .wait(5000)

  await t
    .expect(Selector(dashboard.submissionSummaryInfoLink(2)).exists)
    .ok()
    .click(dashboard.submissionSummaryInfoLink(2))
    .wait(5000)
    .expect(Selector(submission.authorFirstName).exists)
    .ok()

  await t
    .expect(
      Selector(submission.submit.withText('submit your manuscript')).exists,
    )
    .notOk()
})
