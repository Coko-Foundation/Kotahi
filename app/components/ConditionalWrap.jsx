export default function ConditionalWrap({ condition, wrap, children }) {
  return condition ? wrap(children) : children
}
