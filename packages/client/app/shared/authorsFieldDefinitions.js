import { required } from 'xpub-validators'

export const resourceTypeOptions = [
  {
    label: 'Other',
    value: 'Other',
  },
  {
    label: 'Dataset',
    value: 'Dataset',
  },
  {
    label: 'Software',
    value: 'Software',
  },
  {
    label: 'Figure',
    value: 'Figure',
  },
  {
    label: 'Notebook',
    value: 'Notebook',
  },
  {
    label: 'Research article',
    value: 'Research article',
  },
  {
    label: 'Audiovisual',
    value: 'Audiovisual',
  },
  {
    label: 'Book',
    value: 'Book',
  },
  {
    label: 'Book Chapter',
    value: 'BookChapter',
  },
  {
    label: 'Collection',
    value: 'Collection',
  },
  {
    label: 'Computational Notebook',
    value: 'ComputationalNotebook',
  },
  {
    label: 'Conference Paper',
    value: 'ConferencePaper',
  },
  {
    label: 'Conference Proceeding',
    value: 'ConferenceProceeding',
  },
  {
    label: 'Data Paper',
    value: 'DataPaper',
  },
  {
    label: 'Dissertation',
    value: 'Dissertation',
  },
  {
    label: 'Event',
    value: 'Event',
  },
  {
    label: 'Image',
    value: 'Image',
  },
  {
    label: 'Interactive Resource',
    value: 'InteractiveResource',
  },
  {
    label: 'Instrument',
    value: 'Instrument',
  },
  {
    label: 'Journal',
    value: 'Journal',
  },
  {
    label: 'Journal Article',
    value: 'JournalArticle',
  },
  {
    label: 'Model',
    value: 'Model',
  },
  {
    label: 'Output Management Plan',
    value: 'OutputManagementPlan',
  },
  {
    label: 'Peer Review',
    value: 'PeerReview',
  },
  {
    label: 'Physical Object',
    value: 'PhysicalObject',
  },
  {
    label: 'Preprint',
    value: 'Preprint',
  },
  {
    label: 'Report',
    value: 'Report',
  },
  {
    label: 'Service',
    value: 'Service',
  },
  {
    label: 'Sound',
    value: 'Sound',
  },
  {
    label: 'Standard',
    value: 'Standard',
  },
  {
    label: 'Study Registration',
    value: 'StudyRegistration',
  },
  {
    label: 'Text',
    value: 'Text',
  },
  {
    label: 'Workflow',
    value: 'Workflow',
  },
]

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
      name: 'middleName',
      label: 'Middle name',
      placeholder: 'Enter middle name…',
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
      name: 'ror',
      label: 'ROR',
      placeholder: 'Enter ROR...',
    },
    {
      name: 'orcid',
      label: 'ORCID',
      placeholder: 'Enter ORCID...',
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

export const validateAuthor = async (
  author,
  { validationOrcid, requireEmail },
) => {
  const fields = getAuthorFields({ requireEmail })
  return Promise.all(
    fields.map(async f => {
      if (f.name === 'orcid') {
        if (author[f.name]) {
          try {
            const { data } = (await validationOrcid(author[f.name])) || {}
            return {
              [f.name]: data?.orcidValidate ? undefined : 'ORCID is invalid',
            }
          } catch (error) {
            console.error('Error validating ORCID:', error)
            return { [f.name]: 'ORCID validation failed' }
          }
        }

        return { [f.name]: undefined }
      }

      return { [f.name]: f.validate && f.validate(author[f.name]) }
    }),
  )
}
