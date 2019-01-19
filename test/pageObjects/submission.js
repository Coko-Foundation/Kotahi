import { Selector } from 'testcafe'

const submission = {
  title: Selector('div[id="metadata.title"] div[contenteditable=true]'),
  abstract: Selector('div[id="metadata.abstract"] div[contenteditable=true]'),
  addAuthor: Selector('button[type=button]').withText('ADD ANOTHER AUTHOR'),
  authorFirstName: Selector('input[name="authors.0.firstName"]'),
  authorLastName: Selector('input[name="authors.0.lastName"]'),
  authorEmail: Selector('input[name="authors.0.email"]'),
  authorAffiliation: Selector('input[name="authors.0.affiliation"]'),
  keywords: Selector('div[id="metadata.keywords"] input'),
  articleType: Selector('div[id="metadata.articleType"] button'),
  articleTypeOptions: Selector(
    'div[id="metadata.articleType"] div[role=option]',
  ),
  articleSectionOptions: Selector('div[id="metadata.articleSection"] label'),

  openDataOptions: Selector('div[id="declarations.openData"] label'),
  previouslySubmittedOptions: Selector(
    'div[id="declarations.previouslySubmitted"] label',
  ),
  openPeerReviewOptions: Selector(
    'div[id="declarations.openPeerReview"] label',
  ),
  streamlinedReviewOptions: Selector(
    'div[id="declarations.streamlinedReview"] label',
  ),
  researchNexusOptions: Selector('div[id="declarations.researchNexus"] label'),
  preregisteredOptions: Selector('div[id="declarations.preregistered"] label'),

  fundingAcknowledgement: Selector(
    'div[id="notes.fundingAcknowledgement"] div[contenteditable]',
  ),

  submit: Selector('form button'),
}

export default submission
