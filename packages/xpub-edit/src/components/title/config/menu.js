import { toggleMark } from 'prosemirror-commands'

import schema from './schema'
import icons from './icons'

const markActive = type => state => {
  const { from, $from, to, empty } = state.selection

  return empty
    ? type.isInSet(state.storedMarks || $from.marks())
    : state.doc.rangeHasMark(from, to, type)
}

export default {
  marks: {
    italic: {
      title: 'Toggle italic',
      content: icons.italic,
      active: markActive(schema.marks.italic),
      run: toggleMark(schema.marks.italic)
    },
    subscript: {
      title: 'Toggle subscript',
      content: icons.subscript,
      active: markActive(schema.marks.subscript),
      run: toggleMark(schema.marks.subscript)
    },
    superscript: {
      title: 'Toggle superscript',
      content: icons.superscript,
      active: markActive(schema.marks.superscript),
      run: toggleMark(schema.marks.superscript)
    },
    small_caps: {
      title: 'Toggle small caps',
      content: icons.small_caps,
      active: markActive(schema.marks.small_caps),
      run: toggleMark(schema.marks.small_caps)
    }
  }
}
