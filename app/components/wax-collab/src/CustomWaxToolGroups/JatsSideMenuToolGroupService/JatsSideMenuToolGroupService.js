import { Service } from 'wax-prosemirror-services'
import JatsSideMenu from './JatsSideMenu'

class JatsSideMenuToolGroupService extends Service {
  register() {
    this.container.bind('JatsSideMenu').to(JatsSideMenu)
  }
}

export default JatsSideMenuToolGroupService
