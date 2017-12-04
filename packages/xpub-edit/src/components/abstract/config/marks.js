const link = {
  attrs: {
    href: {},
    title: { default: null },
  },
  inclusive: false,
  parseDOM: [
    {
      tag: 'a[href]',
      getAttrs: dom => ({
        href: dom.getAttribute('href'),
        title: dom.getAttribute('title'),
      }),
    },
  ],
  toDOM: node => ['a', node.attrs],
}

const italic = {
  parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
  toDOM: () => ['i'],
}

const bold = {
  parseDOM: [
    { tag: 'strong' },
    {
      tag: 'b',
      getAttrs: node => node.style.fontWeight !== 'normal' && null,
    },
    {
      style: 'font-weight',
      getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
    },
  ],
  toDOM: () => ['b'],
}

const subscript = {
  parseDOM: [{ tag: 'sub' }, { style: 'vertical-align=sub' }],
  toDOM: () => ['sub'],
}

const superscript = {
  parseDOM: [{ tag: 'sup' }, { style: 'vertical-align=super' }],
  toDOM: () => ['sup'],
}

const small_caps = {
  parseDOM: [{ style: 'font-variant=small-caps' }],
  toDOM: () => ['span', { style: 'font-variant:small-caps' }],
}

export default {
  link,
  italic,
  bold,
  subscript,
  superscript,
  small_caps,
}
