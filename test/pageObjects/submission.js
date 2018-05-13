import { Selector } from 'testcafe'
import ReactSelector from 'testcafe-react-selectors'

const submission = {
  title: Selector('div[id="metadata.title"] div[contenteditable=true]'),
  abstract: Selector('div[id="metadata.abstract"] div[contenteditable=true]'),
  authors: Selector('div[id="metadata.authors"] input'),
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
    'div[id="notes.fundingAcknowledgement"] div[contenteditable=true]',
  ),

  submit: ReactSelector('Button'),
  reallySubmit: Selector('button[type=submit]'),
}

export default submission
