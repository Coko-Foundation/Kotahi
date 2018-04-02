import config from 'config'
import ReactSelector from 'testcafe-react-selector'

const submission = {
  url: `${config.get('pubsweet-server.baseUrl')}`,

  noSubmissionsText: ReactSelector('div').withText(
    'Nothing to do at the moment. Please upload a document',
  ),
}

export default submission
