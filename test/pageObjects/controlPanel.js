import config from 'config'
import { Selector } from 'testcafe'

const controlPanel = {
  url: `${config.get('pubsweet-server.baseUrl')}`,
  collabraHome: Selector('nav a'),

  assignReviewers: Selector('a').withText('Assign Reviewers'),
}

export default controlPanel
