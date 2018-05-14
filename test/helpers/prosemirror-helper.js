import { ClientFunction } from 'testcafe'

export async function prepareEditor(selector, text) {
  const hasPlaceholder = await selector.find('.placeholder').exists
  const options = {}
  if (hasPlaceholder) {
    await goToEditMode(selector.child())
    options.replace = true
  }
  return [selector, text, options]
}

const goToEditMode = ClientFunction(selector => (selector().innerHTML += ''))
