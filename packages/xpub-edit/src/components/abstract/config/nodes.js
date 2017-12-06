const doc = {
  content: 'block+',
}

const paragraph = {
  content: 'inline*',
  group: 'block',
  parseDOM: [{ tag: 'p' }],
  toDOM: () => ['p', 0],
}

const heading = {
  content: 'inline*',
  defining: true,
  group: 'block',
  parseDOM: [{ tag: 'h1' }],
  toDOM: node => ['h1', 0],
}

const text = {
  group: 'inline',
}

export default {
  doc,
  paragraph,
  heading,
  text,
}
