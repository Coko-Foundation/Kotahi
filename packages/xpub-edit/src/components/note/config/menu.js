import { toggleMark } from 'prosemirror-commands'
import { redo, undo } from 'prosemirror-history'
import icons from './icons'
import schema from './schema'

const markActive = type => state => {
  const { from, $from, to, empty } = state.selection

  return empty
    ? type.isInSet(state.storedMarks || $from.marks())
    : state.doc.rangeHasMark(from, to, type)
}

// const blockActive = (type, attrs = {}) => state => {
//   const { $from, to, node } = state.selection

//   if (node) {
//     return node.hasMarkup(type, attrs)
//   }

//   return to <= $from.end() && $from.parent.hasMarkup(type, attrs)
// }

// const promptForURL = () => {
//   let url = window.prompt('Enter the URL', 'https://')

//   if (url && !/^https?:\/\//i.test(url)) {
//     url = `http://${url}`
//   }

//   return url
// }

export default {
  marks: {
    italic: {
      title: 'Toggle italic',
      content: icons.italic,
      active: markActive(schema.marks.italic),
      run: toggleMark(schema.marks.italic),
    },
    bold: {
      title: 'Toggle bold',
      content: icons.bold,
      active: markActive(schema.marks.bold),
      run: toggleMark(schema.marks.bold),
    },
    subscript: {
      title: 'Toggle subscript',
      content: icons.subscript,
      active: markActive(schema.marks.subscript),
      run: toggleMark(schema.marks.subscript),
    },
    superscript: {
      title: 'Toggle superscript',
      content: icons.superscript,
      active: markActive(schema.marks.superscript),
      run: toggleMark(schema.marks.superscript),
    },
    small_caps: {
      title: 'Toggle small caps',
      content: icons.small_caps,
      active: markActive(schema.marks.small_caps),
      run: toggleMark(schema.marks.small_caps),
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
  },
  history: {
    undo: {
      title: 'Undo last change',
      content: icons.undo,
      enable: undo,
      run: undo,
    },
    redo: {
      title: 'Redo last undone change',
      content: icons.redo,
      enable: redo,
      run: redo,
    },
  },
}
