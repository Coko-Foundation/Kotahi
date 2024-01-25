import { SchemaHelpers } from 'wax-prosemirror-core'

const listItemNode = {
  content: 'paragraph block*',
  attrs: {
    id: { default: '' },
    track: { default: [] },
    group: { default: '' },
    viewid: { default: '' },
  },
  parseDOM: [
    {
      tag: 'li',
      getAttrs(hook, next) {
        Object.assign(hook, {
          track: SchemaHelpers.parseTracks(hook.dom.dataset.track),
          id: hook.dom.dataset.id,
          group: hook.dom.dataset.group,
          viewid: hook.dom.dataset.viewid,
        })
        next()
      },
    },
  ],
  toDOM(hook, next) {
    const attrs = {}

    if (hook.node.attrs.track && hook.node.attrs.track.length) {
      attrs['data-id'] = hook.node.attrs.id
      attrs['data-track'] = JSON.stringify(hook.node.attrs.track)
      attrs['data-group'] = hook.node.attrs.group
      attrs['data-viewid'] = hook.node.attrs.viewid
    }

    // eslint-disable-next-line no-param-reassign
    hook.value = ['li', attrs, 0]
    next()
  },
  defining: true,
}

export default listItemNode
