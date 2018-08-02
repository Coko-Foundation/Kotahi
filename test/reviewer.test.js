import config from 'config'
import { Selector } from 'testcafe'
import { startServer, teardown } from './helpers/setup'
import { setupWithOneSubmittedManuscript } from './fixtures/manuscript-setup/setup-one-submitted'
import { login, dashboard, reviewers, review } from './pageObjects'

const goodInkConfig = {
  inkEndpoint: 'http://inkdemo-api.coko.foundation/',
  email: 'editoria@coko.foundation',
  password: 'editoria',
  recipes: {
    'editoria-typescript': '2',
  },
}

const user = { username: 'john', password: 'johnjohn' }

fixture
  .only('Assign reviewers')
  .before(async () => {
    config['pubsweet-component-ink-backend'] = goodInkConfig
    await startServer()
  })
  .afterEach(teardown)

test.before(async t => {
  await setupWithOneSubmittedManuscript()
  await login.doLogin(user.username, user.password)
})('Assign reviewer', async t => {
  await t
    .expect(dashboard.invitedReviewsCount.innerText)
    .eql('0')
    .expect(dashboard.manuscriptStatus(2).innerText)
    .contains('SUBMITTED')
    .expect(await Selector(dashboard.controlPanel).exists)
    .ok()

  await t.click(dashboard.controlPanel).wait(2000)

  await t.expect(await Selector(review.assignEditors).exists).ok()
  await t.expect(await Selector(review.assignReviewers).exists).ok()

  await t
    .click(review.assignReviewers)
    .expect(Selector(reviewers.reviewerSelect).exists)
    .ok()
    .click(reviewers.reviewerSelect)

  await t
    .expect(await Selector(reviewers.reviewer.withText(user.username)).exists)
    .ok()

  await t
    .click(reviewers.reviewer.withText(user.username))
    .expect(await Selector(reviewers.inviteReviewer).exists)
    .ok()
    .click(reviewers.inviteReviewer)

  await t
    .click(reviewers.collabraHome)
    .wait(1000)
    .expect(dashboard.invitedReviewsCount.innerText)
    .eql('1')
})
