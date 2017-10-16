import isHotkey from 'is-hotkey'

// define the Slate type (mark) for each keyboard shortcut

export default {
  bold: isHotkey('mod+b'),
  italic: isHotkey('mod+i'),
}
