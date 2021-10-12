import { Service } from 'wax-prosemirror-services'
import JatsAnnotationList from './JatsAnnotationList'

class JatsAnnotationListToolGroupService extends Service {
  register() {
    this.container.bind('JatsAnnotationList').to(JatsAnnotationList)
  }
}

export default JatsAnnotationListToolGroupService
