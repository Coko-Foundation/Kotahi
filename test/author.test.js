import faker from 'faker'
import config from 'config'
import { addUser } from '@pubsweet/db-manager'
import { startServer, setup, setup2, teardown } from './helpers/setup'
import { login, dashboard, submission } from './pageObjects'
import { prepareEditor } from './helpers/prosemirror-helper'

import { Selector, t } from 'testcafe'

let author

fixture
  .only('Author user')
  .before(startServer)
  .beforeEach(async () => {
    const result = await setup()
    author = result.userData
  })
  .afterEach(teardown)

test('Manage submissions journey', async t => {
  await login.doLogin(author.username, author.password).expect(true) //TODO

  await t
    .setFilesToUpload('input', ['./testSubmission1.docx'])
    .wait(25000)
    .expect(
      Selector('div[id="metadata.title"] div[contenteditable=true]').exists,
    )
    .ok()

  await t
    .typeText(submission.title, 'this is an test submission', { replace: true })
    //.typeText(submission.abstract, faker.lorem.words(50))
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

    .typeText(
      ...(await prepareEditor(submission.fundingAcknowledgement, 'chur buddy')),
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

  // await dashboard
  //   .doSubmit()
  //   .expect(submissionInformation.title)
  //   .eql('testSubmission1')

  //const submissionTitle = faker.lorem.words(20)
  //   await dashboard
  //     .doSubmit()
  //     .expect(submission.title.innerText)
  //     .eql()
})

// //log in
// //should see
// //username
// // Create Submission link
// // Nothing to do at the moment. Please upload a document.
// // click link
// //should be redirected to summary info page
// //'Title' field should be automatically filled out
// //author fills out the form
// //Title (must be >= 20 char)
// //Abstract: (must be >= 100 char)
// //Authors (textbox)
// //Keywords (textbox)
// //Type of article (drop down selection, one of: [Original Research Report, Review, Opinion/Commentary, Registered Report])
// //Section (checkboxes, one or more of: [Cognitive Psychology, Social Psychology, Personality Psychology, Developmental Psychology,
// //Clinial Psychology, Organizational Behavior, Methodology and Research Practice])
// //Data is open ? (radio: Yes / No/not applicable)
// //Previously submitted ? (radio Yes / No)
// //Open peer review ? (radio Yes / No)
// //Streamlined review ? (radio Yes /No)
// //Submitted as part of the research nexus ? (radio Yes / No)
// //Pre-registered ? (radio Yes / No)

// //Section name: Suggested or opposed reviewers
// //Suggested reviewers (textbox)
// //Opposed reviewers (textbox)

// //Section name: Suggested or opposed editors
// //Suggested editors (textbox)
// //Opposed editors (textbox)

// //Funding body acknowledgment (required field, textbox, also has italics/bold/subscript/superscript/smallcaps toggles)
// //Special instructions (textbox, also has italics/bold/subscript/superscript/smallcaps toggles)

// //label Upload supplementary materials
// //Upload files link

// //Button 'Submit your manuscript' (DO NOT CLICK)

// //Author returns to Dashboard (clicks Collabra: Psychology link at top, or back button)
// //There is one article under 'My Submissions'
// //The one article is marked as 'Unsubmitted'

// //Failed new submission test

// //On the dashboard page, the author clicks on the 'Create Submission' button
// //there is an error (wrong format or bad INK configuration)
// //The icon should change to show the error
// //It should return to its normal state after a few seconds
