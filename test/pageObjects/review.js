import config from 'config'
import { Selector } from 'testcafe'

const review = {
  url: `${config.get('pubsweet-server.baseUrl')}`,
  collabraHome: Selector('nav a'),

  assignEditors: Selector('div').withText('Assign Editors'),
  assignReviewers: Selector('a').withText('Assign Reviewers'),

  comments: Selector('div[name="note.content"] div[contenteditable]'),
  confidentialComments: Selector(
    'div[name=confidential.content] div[contenteditable]',
  ),

  accept: Selector(
    'input[type=radio name="Recommendation.recommendation" value="accept"]',
  ),
  revise: Selector(
    'input[type=radio name="Recommendation.recommendation" value="revise"]',
  ),
  reject: Selector(
    'input[type=radio name="Recommendation.recommendation" value="reject"]',
  ),
  submit: Selector('button[type=submit]'),
}

export default review
