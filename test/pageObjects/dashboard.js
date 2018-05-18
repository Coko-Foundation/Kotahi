import config from 'config'
import { Selector } from 'testcafe'

const dashboard = {
  url: `${config.get('pubsweet-server.baseUrl')}`,
  collabraHome: Selector('nav a'),

  createSubmission: Selector('input'),
  input: Selector('input[type=file]'),

  mySubmissionsTitle: Selector('#root div div div div').child(2),
  mySubmissions: Selector('#root div div div div'),

  submission: n => dashboard.mySubmissions.child(n),
  submissionStatus: n =>
    dashboard.mySubmissions
      .child(n)
      .child('div')
      .nth(n),
  submissionSummaryInfoLink: n =>
    dashboard.mySubmissions
      .child(n)
      .find('a')
      .withText('Summary Info'),
  submissionManuscriptLink: n =>
    dashboard.mySubmissions
      .child(n)
      .find('a')
      .withText('Manuscript'),
  submissionDeleteLink: n =>
    dashboard.mySubmissions
      .child(n)
      .find('a')
      .withText('Delete'),
}

export default dashboard
