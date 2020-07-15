import { merge } from 'lodash'

export const diveTo = (
  shallowWrapper,
  identifier,
  options = { context: {} },
) => {
  const element = shallowWrapper.getElement()
  if (!(element && element.type)) {
    throw new Error(
      `Failed to dive to ${identifier} - is it not in the component tree?`,
    )
  }
  const instance = shallowWrapper.instance()

  if (instance && instance.constructor.displayName === identifier) {
    return shallowWrapper
  }

  const context = merge(
    {},
    instance && instance.getChildContext ? instance.getChildContext() : {},
    options.context,
  )

  return diveTo(shallowWrapper.dive({ context }), identifier, { context })
}
