import { Service } from 'wax-prosemirror-core'

class MentionService extends Service {
  name = 'MentionService'

  // eslint-disable-next-line class-methods-use-this
  boot() {}

  register() {
    const createMark = this.container.get('CreateMark')

    createMark({
      mention_tag: {
        attrs: {
          class: { default: 'mention-tag' },
          id: { default: '' },
        },
        inclusive: false,
        parseDOM: [
          {
            tag: 'span.mention-tag',
            getAttrs(dom) {
              return {
                class: dom.getAttribute('class'),
                id: dom.getAttribute('id'),
              }
            },
          },
        ],

        toDOM(node) {
          return ['span', node.attrs, 0]
        },
      },
    })
  }
}
export default MentionService
