import config from 'config'
import { ClientFunction, Selector, t } from 'testcafe'
import ReactSelector from 'testcafe-react-selectors'

const dashboard = {
  url: `${config.get('pubsweet-server.baseUrl')}`,
  collabraHome: Selector('a'),

  createSubmission: Selector('input'),
  input: Selector('input[type=file]'),
  submitError: Selector('div').withText(
    'There was an error uploading the file',
  ),

  mySubmissions: Selector('div').withText('My submissions'),
  unsubmittedManuscripts: Selector('div')
    .withText('My submissions')
    .parent()
    .child(),

  unsubmittedManuscript: n => dashboard.unsubmittedManuscripts.child(n),
  doSubmit: () => t.setFilesToUpload('input', ['../testSubmission.docx']),
}

export default dashboard
