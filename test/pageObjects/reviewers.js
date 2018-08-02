import config from 'config'
import { Selector } from 'testcafe'
import { ReactSelector } from 'testcafe-react-selectors'

const reviewers = {
  url: `${config.get('pubsweet-server.baseUrl')}`,
  collabraHome: Selector('nav a'),

  reviewerSelect: ReactSelector('CreatableSelect Select'),
  reviewer: Selector('#react-select-3--option-1'),
  inviteReviewer: Selector('button[type=submit]'),

  backToControlPanel: Selector('a').withText('Back to Control Panel'),
}

export default reviewers
