import config from 'config'
import { ClientFunction, Selector, t } from 'testcafe'
import ReactSelector from 'testcafe-react-selectors'

const dashboard = {
  url: `${config.get('pubsweet-server.baseUrl')}`,

  createSubmission: ReactSelector('UploadManuscript'),
  input: Selector('input[type=file'),

  doSubmit: () => t.setFilesToUpload('input', ['../testSubmission.docx']),
}

export default dashboard
