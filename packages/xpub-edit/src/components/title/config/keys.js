import { keymap } from 'prosemirror-keymap'
import { undoInputRule } from 'prosemirror-inputrules'
import { undo, redo } from 'prosemirror-history'
import { baseKeymap, toggleMark, chainCommands } from 'prosemirror-commands'

import schema from './schema'

const keys = {
  Backspace: undoInputRule,
  'Mod-i': toggleMark(schema.marks.italic),
  'Mod-y': redo,
  'Mod-z': undo,
  'Shift-Mod-z': redo,
}

Object.keys(baseKeymap).forEach(key => {
  if (keys[key]) {
    keys[key] = chainCommands(keys[key], baseKeymap[key])
  } else {
    keys[key] = baseKeymap[key]
  }
})

export default keymap(keys)
