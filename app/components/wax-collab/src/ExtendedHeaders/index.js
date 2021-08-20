import { Service } from 'wax-prosemirror-services'
import Heading5 from './Heading5'
import Heading6 from './Heading6'

// copied from here: https://gitlab.coko.foundation/wax/wax-prosemirror/-/blob/master/wax-prosemirror-services/src/DisplayBlockLevel/HeadingService/HeadingService.js

class ExtendedHeadingService extends Service {
  // boot() {}

  register() {
    this.container.bind('Heading5').to(Heading5)
    this.container.bind('Heading6').to(Heading6)
    const createNode = this.container.get('CreateNode')
    createNode({
      heading5: {
        content: 'inline*',
        group: 'block',
        defining: true,
        parseDOM: [
          {
            tag: 'h5',
          },
        ],
        toDOM(node) {
          return ['h5', 0]
        },
      },
    })
    createNode({
      heading6: {
        content: 'inline*',
        group: 'block',
        defining: true,
        parseDOM: [
          {
            tag: 'h6',
          },
        ],
        toDOM(node) {
          return ['h6', 0]
        },
      },
    })
  }
}

export default ExtendedHeadingService
