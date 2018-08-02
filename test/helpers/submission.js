import faker from 'faker'
import { Selector, t } from 'testcafe'
import { dashboard, submission, confirmation } from '../pageObjects'
import { prepareEditor } from './prosemirror-helper'

const title = 'this is a test submission'

export async function createSubmission(testfile) {
  await t
    .setFilesToUpload(dashboard.createSubmission, [testfile])
    .wait(30000)
    .expect(
      Selector('div[id="metadata.title"] div[contenteditable=true]').exists,
    )
    .ok()

  await t
    .click(submission.title)
    .wait(500)
    .typeText(submission.title, title, { replace: true })

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
    .pressKey('tab tab tab tab tab tab tab tab')

  return t
}

export async function submitManuscript(testfile) {
  await createSubmission(testfile)

  await t
    .wait(500)
    .pressKey('enter')
    .wait(500)

  await t.expect(confirmation.submitManuscript).exists

  await t.wait(1000).click(confirmation.submitManuscript)

  await t
    .wait(1000)
    .expect(await Selector(dashboard.createSubmission).exists)
    .ok()
}
