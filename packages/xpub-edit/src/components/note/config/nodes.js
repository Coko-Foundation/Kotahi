const doc = {
  content: 'block+'
}

const paragraph = {
  content: 'inline*',
  group: 'block',
  parseDOM: [
    { tag: 'p' }
  ],
  toDOM: () => ['p', 0]
}

const text = {
  group: 'inline'
}

export default {
  doc,
  paragraph,
  text
}
