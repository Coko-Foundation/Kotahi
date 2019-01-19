import config from 'config'
import { Selector } from 'testcafe'

const dashboard = {
  url: `${config.get('pubsweet-server.baseUrl')}`,
  collabraHome: Selector('nav a'),
  logout: Selector('button[type=button]').withText('Logout'),

  createSubmission: Selector('input'),
  input: Selector('input[type=file]'),

  mySubmissionsTitle: Selector('#root div div div div div').child(1),
  mySubmissions: Selector('#root div div div div div'),
  submission: n => dashboard.mySubmissions.child(n),
  submissionStatus: (n, k) =>
    dashboard.mySubmissions
      .child(n)
      .child('div')
      .nth(k || n),
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

  toReviewTitle: Selector('#root div div div div div').child(2),
  acceptReview: Selector('a').withText('Accept'),
  rejectReview: Selector('a').withText('Reject'),
  doReview: Selector('a').withText('Do review'),
  completed: Selector('a').withText('Completed'),

  myManuscriptsTitle: Selector('#root div div div div').child(3),
  myManuscripts: Selector('#root div div div div'),
  manuscript: n => dashboard.myManuscripts.child(n), // specified manuscript
  manuscriptStatus: n =>
    dashboard.myManuscripts
      .child(n)
      .child('div')
      .nth(1),
  controlPanel: Selector('a').withText('Control Panel'),
  manuscriptLink: Selector('div').withText('this is a test submission'),
  invitedReviewsCount: Selector('span span')
    .withText('invited')
    .sibling(0),
  acceptedReviewsCount: Selector('span span')
    .withText('accepted')
    .sibling(0),
  rejectedReviewsCount: Selector('span span')
    .withText('rejected')
    .sibling(0),
  completedReviewsCount: Selector('span span')
    .withText('completed')
    .sibling(0),
}

export default dashboard
