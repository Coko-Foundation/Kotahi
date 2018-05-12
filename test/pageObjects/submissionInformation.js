import config from 'config'
import { Selector, t } from 'testcafe'

const submissionInformation = {
  url: `${config.get('pubsweet-server.baseUrl')}`,
  title: Selector('#metadata.title div[contenteditable]'), //must be >= 20 char
  abstract: Selector('#metadata.abstract div[contenteditable]'), //must be >= 100 char
  authors: Selector('#metadata.authors div[contenteditable]'),
  keywords: Selector('#metadata.keywords div[contenteditable]'),
  articleType: Selector('#metadata.articleType div[contenteditable]'), //dropdown, one of: [Original Research Report, Review, Opinion/Commentary, Registered Report]
  section: Selector('#metadata.articleSection div[contenteditable]'), //one or more of: [Cognitive Psychology, Social Psychology, Personality Psychology, Developmental Psychology,
  //Clinial Psychology, Organizational Behavior, Methodology and Research Practice]
  openData: Selector('#declarations.openData')
    .find('label')
    .child(el => el.value === 'yes'),
  previouslySubmitted: Selector('#declarations.previouslySubmitted')
    .find('label')
    .child(el => el.value === 'yes'),
  openPeerReview: Selector('#declarationsOpenPeerReview')
    .find('label')
    .child(el => el.value === 'yes'),
  streamlinedReview: Selector('#declarations.streamlinedReview')
    .find('label')
    .child(el => el.value === 'yes'),
  researchNexus: Selector('#declarations.researchNexus')
    .find('label')
    .child(el => el.value === 'yes'),
  preregistered: Selector('#declarations.preregistered')
    .find('label')
    .child(el => el.value === 'yes'),

  suggestedReviewers: Selector(
    'form input[name="suggestions.reviewers.suggested"]',
  ),
  opposedReviewers: Selector(
    'form input[name="suggestions.reviewers.opposed"]',
  ),

  suggestedEditors: Selector(
    'form input[name="suggestions.editors.suggested"]',
  ),
  opposedEditors: Selector('form input[namme="suggestions.editors.opposed"]'),

  fundingBodyAcknowledgment: Selector(
    '#notes.fundingAcknowledgement div[contenteditable]',
  ),
  specialInstructions: Selector(
    '#notes.specialInstructions div[contenteditable]',
  ),

  uploadSupplements: Selector('#files.supplementary type button'),
  submit: Selector('form button'),

  home: Selector('nav div span a'), //Collabra link at top
}

export default submissionInformation
