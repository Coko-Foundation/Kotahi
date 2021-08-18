import { validateFormField } from './formValidation'

// eslint-disable-next-line import/prefer-default-export
export const validateManuscript = (submission, fieldDefinitions, client) =>
  Object.entries(fieldDefinitions)
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
