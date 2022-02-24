import { Service } from 'wax-prosemirror-services'
import {
  AppendixList,
  CitationList,
  FrontMatterList,
  AcknowledgementsList,
} from './JatsAnnotationList'

class JatsAnnotationListToolGroupService extends Service {
  register() {
    this.container.bind('AppendixList').to(AppendixList)
    this.container.bind('CitationList').to(CitationList)
    this.container.bind('FrontMatterList').to(FrontMatterList)
    this.container.bind('AcknowledgementsList').to(AcknowledgementsList)
  }
}

export default JatsAnnotationListToolGroupService
