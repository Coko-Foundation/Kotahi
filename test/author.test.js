import faker from 'faker'
import config from 'config'
import { addUser } from '@pubsweet/db-manager'
import { startServer, setup, setup2, teardown } from './helpers/setup'
import { login, dashboard, submissionInformation } from './pageObjects'

import { Selector } from 'testcafe'

let author
let submission

fixture
  .only('Author user')
  .before(startServer)
  .beforeEach(async () => {
    const result = await setup()
    author = result.userData
  })
  .afterEach(teardown)

test('Manage submissions journey', async t => {
  await login
    .doLogin(author.username, author.password)
    .expect(dashboard.createSubmission.innerText)
    .eql('Create submission')

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
//   // create a submisison
//   // const submissionTitle = faker.lorem.words(20)
//   // await t
//   //   .typeText(submission.newPostInput, postTitle)
//   //   .click(manageSubmissions.newPostButton)
//   //   .expect(manageSubmissions.postTitle(0).innerText)
//   //   .eql(submissionTitle)

// //   // publish it
// //   await t
// //     .click(managePosts.postPublish(0))
// //     .expect(managePosts.postPublish(0).exists)
// //     .notOk()
// //     .expect(managePosts.postUnpublish(0).exists)
// //     .ok()

// //   // delete it
// //   await t
// //     .click(managePosts.postDelete(0))
// //     .expect(managePosts.post(0).exists)
// //     .notOk()
// })

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
