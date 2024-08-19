import { required } from 'xpub-validators'

const isMalformedEmail = val =>
  val !== '' &&
  val &&
  !/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i.test(
    val,
  ) &&
  'Not a valid email address'

export const getAuthorFields = (options = {}) => {
  const { requireEmail } = options

  return [
    {
      name: 'firstName',
      label: 'First name',
      placeholder: 'Enter first name…',
      validate: required,
    },
    {
      name: 'lastName',
      label: 'Last name',
      placeholder: 'Enter last name…',
      validate: required,
    },
    {
      name: 'email',
      label: 'Email address',
      placeholder: 'Enter email address…',
      validate: requireEmail
        ? val => required(val) || isMalformedEmail(val)
        : isMalformedEmail,
    },
    {
      name: 'affiliation',
      label: 'Affiliation',
      placeholder: 'Enter affiliation…',
    },
  ]
}

/** Caution: returns false if valid! This is in keeping with how formik fields are validated. */
export const validateAuthors = (authors, options = {}) =>
  Array.isArray(authors) &&
  authors.some(author =>
    getAuthorFields(options).some(
      f => f.validate && f.validate(author[f.name]),
    ),
  ) &&
  'Some authors are invalid'
