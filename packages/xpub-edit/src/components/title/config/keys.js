import { keymap } from 'prosemirror-keymap'
import { undoInputRule } from 'prosemirror-inputrules'
import { undo, redo } from 'prosemirror-history'
import { baseKeymap, toggleMark, chainCommands } from 'prosemirror-commands'

import schema from './schema'

const keys = {
  'Mod-z': undo,
  'Shift-Mod-z': redo,
  'Backspace': undoInputRule,
  'Mod-y': redo,
  'Mod-i': toggleMark(schema.marks.italic)
}

Object.keys(baseKeymap).forEach(key => {
  if (keys[key]) {
    keys[key] = chainCommands(keys[key], baseKeymap[key])
  } else {
    keys[key] = baseKeymap[key]
  }
})

export default keymap(keys)
