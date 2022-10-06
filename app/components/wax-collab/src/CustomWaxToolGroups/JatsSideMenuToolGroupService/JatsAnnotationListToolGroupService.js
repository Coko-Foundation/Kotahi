import { Service } from 'wax-prosemirror-services'
import AppendixGroup from './menugroups/AppendixGroup'
import FrontMatterGroup from './menugroups/FrontMatterGroup'
import FundingGroup from './menugroups/FundingGroup'
import CitationGroup from './menugroups/CitationGroup'
import AcknowledgementsGroup from './menugroups/AcknowledgementsGroup'
import KeywordGroup from './menugroups/KeywordGroup'

class JatsAnnotationListToolGroupService extends Service {
  register() {
    this.container.bind('AppendixGroup').to(AppendixGroup)
    this.container.bind('CitationGroup').to(CitationGroup)
    this.container.bind('FrontMatterGroup').to(FrontMatterGroup)
    this.container.bind('FundingGroup').to(FundingGroup)
    this.container.bind('AcknowledgementsGroup').to(AcknowledgementsGroup)
    this.container.bind('KeywordGroup').to(KeywordGroup)
  }
}

export default JatsAnnotationListToolGroupService
