import faker from 'faker'
import config from 'config'
import { addUser } from '@pubsweet/db-manager'
import { prepareEditor } from './helpers/prosemirror-helper'
import { Selector, t } from 'testcafe'
import { startServer, setup, setup2, teardown } from './helpers/setup'
import { login, dashboard, submission } from './pageObjects'

let author
let title = 'this is a test submission'

fixture
  .only('Author user')
  .before(startServer)
  .beforeEach(async () => {
    const result = await setup()
    author = result.userData

    await login.doLogin(author.username, author.password)
  })
  .afterEach(teardown)

test('Manage submissions journey, create new submission', async t => {
  await t.expect(Selector(dashboard.mySubmissionsTitle).exists).notOk()

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
      ...(await prepareEditor(submission.fundingAcknowledgement, 'thank you')),
    )
    //.click(submission.submit)
    .click(submission.reallySubmit)

  await t.expect(dashboard.myManuscripts.count).eql(1)

  // await dashboard
  //   .doSubmit()
  //   .typeText(submissionInformation.title, 'this is a test')
  //.expect(dashboard.noSubmissionsMessage.props.children)
  //.eql('Create submission')

  //.eql('Nothing to do at the moment. Please upload a document.')

  await t
    .typeText(
      ...(await prepareEditor(submission.abstract, faker.lorem.words(20))),
    )
    .pressKey('tab')
    .click(submission.addAuthor)
    .typeText(submission.authorFirstName, 'John')
    .typeText(submission.authorLastName, 'Cena')
    .typeText(submission.authorEmail, 'example@example.com')
    .typeText(submission.authorAffiliation, 'WWE')
    .typeText(submission.keywords, 'a, few, keywords')
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

test.skip('Manage submissions journey, failed new submission', async t => {
  await t
    .setFilesToUpload(dashboard.createSubmission, ['./testSubmission2.txt']) //setFilesToUpload error automatically causes test to fail
    .expect(await Selector(dashboard.submitError).exists)
    .ok()

  await t.wait(1000).expect(dashboard.createSubmission).exists
})
