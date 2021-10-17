import { get } from 'lodash'
import { validateFormField } from './formValidation'
import { convertTimestampToDate } from './time-formatting'

// TODO: rename validateManuscriptSubmission. This is only intended for validating the manuscript.submission object, nothing else.
export const validateManuscript = (submission, fieldDefinitions, client) =>
  Object.entries(fieldDefinitions)
    .filter(([key, element]) => element?.name)
    .map(([key, element]) =>
      validateFormField(
        element.validate,
        element.validateValue,
        element.name,
        JSON.parse(element.doiValidation ? element.doiValidation : false),
        client,
        element.component,
      )(submission[element.name.split('.')[1]]),
    )
    .filter(Boolean)

/** Find the data stored in the manuscript for this fieldName. If the fieldDefinition from the form has a key/value structure we should
 * treat the manuscript data as the key and obtain the displayValue from the fieldDefinition. Otherwise use the manuscript data directly
 * as the displayValue. If manuscript data is an array, we have to do this for each item in the array.
 * There is special logic for some fieldNames, such as 'created' and 'updated'.
 */
export const getFieldValueAndDisplayValue = (
  fieldName,
  manuscript,
  fieldDefinitions,
) => {
  if (fieldName === 'created')
    return [manuscript.created, convertTimestampToDate(manuscript.created)]
  if (fieldName === 'updated')
    return [manuscript.updated, convertTimestampToDate(manuscript.updated)]
  if (fieldName === 'shortId')
    return [manuscript.shortId, manuscript.shortId.toString()]

  const valueInManuscript = get(manuscript, fieldName, null)

  const fieldDefinition = fieldDefinitions?.[fieldName]

  if (Array.isArray(valueInManuscript)) {
    return [
      valueInManuscript,
      valueInManuscript.map(
        val =>
          fieldDefinition?.options?.find(o => o.value === val)?.label ?? val,
      ),
    ]
  }

  return [
    valueInManuscript,
    fieldDefinition?.options?.find(o => o.value === valueInManuscript)?.label ??
      valueInManuscript,
  ]
}
