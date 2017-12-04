import { keymap } from 'prosemirror-keymap'
import { undoInputRule } from 'prosemirror-inputrules'
import { undo, redo } from 'prosemirror-history'
import {
  baseKeymap,
  toggleMark,
  chainCommands,
  exitCode,
  selectParentNode,
} from 'prosemirror-commands'

import schema from './schema'

const keys = {
  'Mod-z': undo,
  'Shift-Mod-z': redo,
  Backspace: undoInputRule,
  'Mod-y': redo,
  Escape: selectParentNode,
  'Mod-b': toggleMark(schema.marks.bold),
  'Mod-i': toggleMark(schema.marks.italic),
  'Mod-Enter': exitCode,
  'Shift-Enter': exitCode,
  'Ctrl-Enter': exitCode,
}

Object.keys(baseKeymap).forEach(key => {
  if (keys[key]) {
    keys[key] = chainCommands(keys[key], baseKeymap[key])
  } else {
    keys[key] = baseKeymap[key]
  }
})

export default keymap(keys)
