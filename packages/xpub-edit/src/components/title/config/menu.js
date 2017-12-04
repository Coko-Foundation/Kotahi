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
      active: markActive(schema.marks.italic),
      content: icons.italic,
      run: toggleMark(schema.marks.italic),
      title: 'Toggle italic',
    },
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
