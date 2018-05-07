import config from 'config'
import ReactSelector from 'testcafe-react-selectors'
import { t } from 'testcafe';

const dashboard = {
    url: `${config.get('pubsweet-server.baseUrl')}`,

    createSubmission: ReactSelector('UploadManuscript div div div'),
    uploadContainer: ReactSelector('UploadContainer'),

    doSubmit: () =>
      t
        .click(createSubmission)
        .setFilesToUpload('input', ['../testSubmission.docx'])
    
}

export default dashboard
