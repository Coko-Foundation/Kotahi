export default function ConditionalWrap({ condition, wrap, children }) {
  console.log(children, wrap)
  return condition ? wrap(children) : children
}
