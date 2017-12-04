import { DecorationSet, Decoration } from 'prosemirror-view'

export default ({ props, classes }) => state => {
  const doc = state.doc
  const decorations = []

  if (
    props.placeholder &&
    doc.childCount === 1 &&
    doc.firstChild.isTextblock &&
    doc.firstChild.content.size === 0
  ) {
    const placeHolder = document.createElement('div')
    placeHolder.textContent = props.placeholder
    placeHolder.classList.add(classes.placeholder)

    if (props.placeholderClassName) {
      placeHolder.classList.add(props.placeholderClassName)
    }

    decorations.push(Decoration.widget(1, placeHolder))
  }

  return DecorationSet.create(doc, decorations)
}
