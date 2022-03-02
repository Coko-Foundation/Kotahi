/** Get a title for display based on fieldName. Either fetches the title from the form;
 * or for the artifical field names 'decision', 'review#0' etc, returns 'Decision', 'Review 1' etc.
 */
const getEvaluationFieldTitle = (fieldName, form) => {
  if (fieldName.startsWith('review#')) {
    const index = parseInt(fieldName.split('#')[1], 10) + 1 // 1-based index for display
    return `Review ${index}`
  }

  if (fieldName === 'decision') return 'Decision'

  return (
    form.structure.children.find(f => f.name === fieldName)?.title || fieldName
  )
}

export default getEvaluationFieldTitle
