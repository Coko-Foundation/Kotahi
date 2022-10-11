import React from 'react'
import { get } from 'lodash'
import { validateFormField } from './formValidation'
import { convertTimestampToDateString } from './dateUtils'
import { StatusBadge } from '../components/shared'

/** Validate just manuscript.submission, based on the supplied array of field definitions */
export const validateManuscriptSubmission = async (
  submission,
  submissionForm,
  validateDoi,
) => {
  const fieldDefinitions = submissionForm?.children ?? []

  const promiseArr = fieldDefinitions
    .filter(element => element?.name)
    .map(element => {
      const validatorFn = validateFormField(
        element.validate,
        element.validateValue,
        element.name,
        JSON.parse(element.doiValidation ? element.doiValidation : false),
        validateDoi,
        element.component,
      )

      const errorMessage = validatorFn(submission[element.name.split('.')[1]])

      return errorMessage
    })

  const results = await Promise.all(promiseArr)
  return results.filter(Boolean)
}

/** Find the data stored in the manuscript for this fieldName. If the fieldDefinition from the form has a key/value structure we should
 * treat the manuscript data as the key and obtain the displayValue from the fieldDefinition. Otherwise use the manuscript data directly
 * as the displayValue. If manuscript data is an array, we have to do this for each item in the array.
 * There is special logic for some fieldNames, such as 'created' and 'updated'.
 */
export const getFieldValueAndDisplayValue = (column, manuscript) => {
  if (column.name === 'created')
    return [
      {
        value: manuscript.created,
        displayValue: convertTimestampToDateString(manuscript.created),
      },
    ]
  if (column.name === 'updated')
    return [
      {
        value: manuscript.updated,
        displayValue: convertTimestampToDateString(manuscript.updated),
      },
    ]
  if (column.name === 'status')
    return [
      {
        value: manuscript.status,
        displayValue: (
          <StatusBadge
            published={manuscript.published}
            status={manuscript.status}
          />
        ),
      },
    ]
  // if (column.name === 'shortId')
  //  return [manuscript.shortId, manuscript.shortId.toString()]

  const valueInManuscript = get(manuscript, column.name, null)

  const valuesInManuscript = Array.isArray(valueInManuscript)
    ? valueInManuscript
    : [valueInManuscript]

  return valuesInManuscript
    .filter(val => !!val)
    .map(val => {
      const option = column.filterOptions?.find(o => o.value === val)

      return {
        value: val,
        displayValue: option?.label ?? val,
        color: option?.labelColor,
      }
    })
}
