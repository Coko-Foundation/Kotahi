// import Service from '../../Service' // TODO: figure this out
import { Service } from 'wax-prosemirror-services'
import KotahiBlockDropDown from './KotahiBlockDropDown'

class KotahiBlockDropDownToolGroupService extends Service {
  register() {
    this.container.bind('KotahiBlockDropDown').to(KotahiBlockDropDown)
  }
}

export default KotahiBlockDropDownToolGroupService
