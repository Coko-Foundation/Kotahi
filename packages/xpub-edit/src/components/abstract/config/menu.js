import { setBlockType, toggleMark } from 'prosemirror-commands'
import { redo, undo } from 'prosemirror-history'

import icons from './icons'
import schema from './schema'

const markActive = type => state => {
  const { from, $from, to, empty } = state.selection

  return empty
    ? type.isInSet(state.storedMarks || $from.marks())
    : state.doc.rangeHasMark(from, to, type)
}

const blockActive = (type, attrs = {}) => state => {
  const { $from, to, node } = state.selection

  if (node) {
    return node.hasMarkup(type, attrs)
  }

  return to <= $from.end() && $from.parent.hasMarkup(type, attrs)
}

// const promptForURL = () => {
//   let url = window.prompt('Enter the URL', 'https://')

//   if (url && !/^https?:\/\//i.test(url)) {
//     url = `http://${url}`
//   }

//   return url
// }

export default {
  blocks: {
    h1: {
      active: blockActive(schema.nodes.heading, { level: 1 }),
      content: icons.heading,
      enable: setBlockType(schema.nodes.heading, { level: 1 }),
      run: (state, dispatch) => {
        if (blockActive(schema.marks.heading)(state)) {
          setBlockType(schema.marks.paragraph)(state, dispatch)
          return true
        }

        setBlockType(schema.nodes.heading, { level: 1 })(state, dispatch)
      },
      title: 'Change to heading level 1',
    },
  },
  history: {
    redo: {
      content: icons.redo,
      enable: redo,
      run: redo,
      title: 'Redo last undone change',
    },
    undo: {
      content: icons.undo,
      enable: undo,
      run: undo,
      title: 'Undo last change',
    },
  },
  marks: {
    bold: {
      active: markActive(schema.marks.bold),
      content: icons.bold,
      run: toggleMark(schema.marks.bold),
      title: 'Toggle bold',
    },
    italic: {
      active: markActive(schema.marks.italic),
      content: icons.italic,
      run: toggleMark(schema.marks.italic),
      title: 'Toggle italic',
    },
    // link: {
    //   title: 'Add or remove link',
    //   content: icons.link,
    //   active: markActive(schema.marks.link),
    //   enable: state => !state.selection.empty,
    //   run: (state, dispatch) => {
    //     if (markActive(schema.marks.link)(state)) {
    //       toggleMark(schema.marks.link)(state, dispatch)
    //       return true
    //     }
    //
    //     const href = promptForURL()
    //     if (!href) return false
    //
    //     toggleMark(schema.marks.link, { href })(state, dispatch)
    //     // view.focus()
    //   }
    // }
    small_caps: {
      active: markActive(schema.marks.small_caps),
      content: icons.small_caps,
      run: toggleMark(schema.marks.small_caps),
      title: 'Toggle small caps',
    },
    subscript: {
      active: markActive(schema.marks.subscript),
      content: icons.subscript,
      run: toggleMark(schema.marks.subscript),
      title: 'Toggle subscript',
    },
    superscript: {
      active: markActive(schema.marks.superscript),
      content: icons.superscript,
      run: toggleMark(schema.marks.superscript),
      title: 'Toggle superscript',
    },
  },
}
