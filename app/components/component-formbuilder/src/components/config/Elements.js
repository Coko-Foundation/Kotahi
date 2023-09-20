import { required } from '../../../../xpub-validators/src'

const textfield = {
  component: 'TextField',
}

const optionfield = {
  component: 'OptionsField',
  defaultValue: [],
}

const editorfield = {
  component: 'AbstractField',
  defaultValue: '',
}

const textarea = {
  component: 'TextArea',
  props: {
    cols: 55,
    rows: 5,
  },
}

const requiredTextField = {
  component: 'TextField',
  props: {
    validate: required,
  },
}

const shortDescriptionField = {
  component: 'TextField',
  props: { label: 'Short title (optional — used in concise listings)' },
}

// Decision and Review:
// - Don't have meta, but a single jsonData that can accomodate everything
const nameFieldRegex = /^[a-zA-Z]\w*$/

const nameField = {
  component: 'TextField',
  props: {
    label: 'Name (internal field name)',
    validate: val => (nameFieldRegex.test(val) ? null : 'Invalid name'),
  },
}

const submissionNameFieldRegex = /^(?:submission\.[a-zA-Z]\w*|meta.title|meta.abstract|fileName|visualAbstract|manuscriptFile)$/

const submissionNameField = {
  component: 'TextField',
  props: {
    label: 'Name (internal field name)',
    description:
      'Use either "submission.yourFieldNameHere", or one of the following: "meta.title" for manuscript title, "meta.abstract" for abstract, "fileName" for SupplementaryFiles, or "visualAbstract" for a VisualAbstract, or "manuscriptFile" for a ManuscriptFile.',
    validate: val =>
      submissionNameFieldRegex.test(val) ? null : 'Invalid name',
  },
}

const validateText = {
  component: 'Menu',
  props: {
    isMulti: true,
    isClearable: true,
    label: 'Validation options',
    options: [
      {
        value: 'required',
        label: 'Required',
      },
      {
        value: 'minChars',
        label: 'Minimum characters',
      },
      {
        value: 'maxChars',
        label: 'Maximum characters',
      },
    ],
  },
}

const validateCollection = {
  component: 'Menu',
  props: {
    isMulti: true,
    isClearable: true,
    label: 'Validation options',
    options: [
      {
        value: 'required',
        label: 'Required',
      },
      {
        value: 'minSize',
        label: 'Minimum number of items',
      },
    ],
  },
}

const validateOther = {
  component: 'Menu',
  props: {
    isMulti: true,
    isClearable: true,
    label: 'Validation options',
    options: [
      {
        value: 'required',
        label: 'Required',
      },
    ],
  },
}

const radiofield = {
  component: 'RadioBox',
  props: {
    inline: true,
    options: [
      {
        value: 'true',
        label: 'Yes',
      },
      {
        value: 'false',
        label: 'No',
      },
    ],
  },
  defaultValue: 'false',
}

const hideFromReviewersField = {
  component: 'RadioBox',
  props: {
    inline: true,
    options: [
      {
        value: 'true',
        label: 'Yes',
      },
      {
        value: 'false',
        label: 'No',
      },
    ],
    label: 'Hide from reviewers?',
  },
  defaultValue: 'false',
}

const hideFromAuthorsField = {
  component: 'RadioBox',
  props: {
    inline: true,
    options: [
      {
        value: 'true',
        label: 'Yes',
      },
      {
        value: 'false',
        label: 'No',
      },
    ],
    label: 'Hide from authors?',
  },
  defaultValue: 'false',
}

const permitPublishingField = {
  component: 'RadioBox',
  props: {
    options: [
      {
        value: 'false',
        label: 'Never',
      },
      {
        value: 'true',
        label: 'Ad hoc (Editor decides at time of sharing/publishing)',
      },
      {
        value: 'always',
        label: 'Always',
      },
    ],
    label: 'Include when sharing or publishing?',
  },
  defaultValue: 'false',
}

const publishingTagField = {
  component: 'TextField',
  props: {
    label: 'Hypothes.is tag',
    description:
      'You may specify a tag to use when sharing this field as a Hypothes.is annotation.',
  },
}

const doiUniqueSuffixValidationField = {
  component: 'RadioBox',
  props: {
    inline: true,
    options: [
      {
        value: 'true',
        label: 'Yes',
      },
      {
        value: 'false',
        label: 'No',
      },
    ],
    label: 'Validate as a DOI suffix and ensure it is unique?',
  },
  defaultValue: 'false',
}

const submissionElements = {
  ManuscriptFile: {
    id: textfield,
    title: requiredTextField,
    name: submissionNameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    hideFromReviewers: hideFromReviewersField,
    hideFromAuthors: hideFromAuthorsField,
  },
  SupplementaryFiles: {
    id: textfield,
    title: requiredTextField,
    name: submissionNameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    hideFromReviewers: hideFromReviewersField,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
  },
  VisualAbstract: {
    id: textfield,
    title: requiredTextField,
    name: submissionNameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    hideFromReviewers: hideFromReviewersField,
    hideFromAuthors: hideFromAuthorsField,
  },
  AuthorsInput: {
    id: textfield,
    title: requiredTextField,
    name: submissionNameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    hideFromReviewers: hideFromReviewersField,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
  LinksInput: {
    id: textfield,
    title: requiredTextField,
    name: submissionNameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateCollection,
    hideFromReviewers: hideFromReviewersField,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
  AbstractEditor: {
    id: textfield,
    title: requiredTextField,
    name: submissionNameField,
    placeholder: textfield,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateText,
    hideFromReviewers: hideFromReviewersField,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
  ThreadedDiscussion: {
    id: textfield,
    title: requiredTextField,
    name: submissionNameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    hideFromReviewers: hideFromReviewersField,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
  TextField: {
    id: textfield,
    title: requiredTextField,
    name: submissionNameField,
    placeholder: textfield,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateText,
    parse: {
      component: 'Menu',
      props: {
        label: 'Special parsing',
        options: [
          {
            value: 'false',
            label: 'None',
          },
          {
            value: 'split',
            label: 'Split at commas',
          },
        ],
      },
    },
    format: {
      component: 'Menu',
      props: {
        label: 'Special formatting',
        options: [
          {
            value: 'false',
            label: 'None',
          },
          {
            value: 'join',
            label: 'Join with commas',
          },
        ],
      },
    },
    doiValidation: {
      component: 'RadioBox',
      props: {
        inline: true,
        options: [
          {
            value: 'true',
            label: 'Yes',
          },
          {
            value: 'false',
            label: 'No',
          },
        ],
        label: 'Validate as a DOI?',
      },
      defaultValue: 'false',
    },
    doiUniqueSuffixValidation: doiUniqueSuffixValidationField,
    hideFromReviewers: hideFromReviewersField,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
  CheckboxGroup: {
    id: textfield,
    title: requiredTextField,
    name: submissionNameField,
    description: editorfield,
    options: optionfield,
    shortDescription: shortDescriptionField,
    validate: validateCollection,
    hideFromReviewers: hideFromReviewersField,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
  Select: {
    id: textfield,
    title: requiredTextField,
    name: submissionNameField,
    placeholder: textfield,
    description: editorfield,
    options: optionfield,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    hideFromReviewers: hideFromReviewersField,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
  RadioGroup: {
    id: textfield,
    title: requiredTextField,
    name: submissionNameField,
    description: editorfield,
    options: optionfield,
    inline: radiofield,
    sectioncss: textarea,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    hideFromReviewers: hideFromReviewersField,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
}

const elements = {
  ManuscriptFile: {
    id: textfield,
    title: requiredTextField,
    name: submissionNameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    hideFromReviewers: hideFromReviewersField,
    hideFromAuthors: hideFromAuthorsField,
  },
  SupplementaryFiles: {
    id: textfield,
    title: requiredTextField,
    name: nameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    hideFromAuthors: hideFromAuthorsField,
  },
  VisualAbstract: {
    id: textfield,
    title: requiredTextField,
    name: nameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    hideFromAuthors: hideFromAuthorsField,
  },
  AuthorsInput: {
    id: textfield,
    title: requiredTextField,
    name: nameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
  LinksInput: {
    id: textfield,
    title: requiredTextField,
    name: nameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateCollection,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
  AbstractEditor: {
    id: textfield,
    title: requiredTextField,
    name: nameField,
    placeholder: textfield,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateText,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
  ThreadedDiscussion: {
    id: textfield,
    title: requiredTextField,
    name: nameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    hideFromReviewers: hideFromReviewersField,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
  TextField: {
    id: textfield,
    title: requiredTextField,
    name: nameField,
    placeholder: textfield,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateText,
    parse: {
      component: 'Menu',
      props: {
        label: 'Special parsing',
        options: [
          {
            value: 'false',
            label: 'None',
          },
          {
            value: 'split',
            label: 'Split at commas',
          },
        ],
      },
    },
    format: {
      component: 'Menu',
      props: {
        label: 'Special formatting',
        options: [
          {
            value: 'false',
            label: 'None',
          },
          {
            value: 'join',
            label: 'Join with commas',
          },
        ],
      },
    },
    doiValidation: {
      component: 'RadioBox',
      props: {
        inline: true,
        options: [
          {
            value: 'true',
            label: 'Yes',
          },
          {
            value: 'false',
            label: 'No',
          },
        ],
        label: 'Validate as a DOI?',
      },
      defaultValue: 'false',
    },
    doiUniqueSuffixValidation: doiUniqueSuffixValidationField,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
  CheckboxGroup: {
    id: textfield,
    title: requiredTextField,
    name: nameField,
    description: editorfield,
    options: optionfield,
    shortDescription: shortDescriptionField,
    validate: validateCollection,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
  Select: {
    id: textfield,
    title: requiredTextField,
    name: nameField,
    placeholder: textfield,
    description: editorfield,
    options: optionfield,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
  RadioGroup: {
    id: textfield,
    title: requiredTextField,
    name: nameField,
    description: editorfield,
    options: optionfield,
    inline: radiofield,
    sectioncss: textarea,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    hideFromAuthors: hideFromAuthorsField,
    permitPublishing: permitPublishingField,
    publishingTag: publishingTagField,
  },
}

export { elements, submissionElements }
