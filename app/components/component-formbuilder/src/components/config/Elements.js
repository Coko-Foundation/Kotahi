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

const shortDescriptionField = {
  component: 'TextField',
  props: { label: 'Short title (optional — used in concise listings)' },
}

const nameField = {
  component: 'TextField',
  props: {
    label: 'Name (internal field name)',
    description:
      'Use either "submission.yourFieldNameHere", or one of the following: "meta.title" for manuscript title, "meta.abstract" for abstract, "fileName" for SupplementaryFiles, or "visualAbstract" for a VisualAbstract.',
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

const reviewerPreviewField = {
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
    label: "Include in reviewers' preview?",
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

const elements = {
  SupplementaryFiles: {
    id: textfield,
    title: textfield,
    name: nameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    includeInReviewerPreview: reviewerPreviewField,
    hideFromAuthors: hideFromAuthorsField,
  },
  VisualAbstract: {
    id: textfield,
    title: textfield,
    name: nameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    includeInReviewerPreview: reviewerPreviewField,
    hideFromAuthors: hideFromAuthorsField,
  },
  AuthorsInput: {
    id: textfield,
    title: textfield,
    name: nameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    includeInReviewerPreview: reviewerPreviewField,
    hideFromAuthors: hideFromAuthorsField,
  },
  LinksInput: {
    id: textfield,
    title: textfield,
    name: nameField,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateCollection,
    includeInReviewerPreview: reviewerPreviewField,
    hideFromAuthors: hideFromAuthorsField,
  },
  AbstractEditor: {
    id: textfield,
    title: textfield,
    name: nameField,
    placeholder: textfield,
    description: editorfield,
    shortDescription: shortDescriptionField,
    validate: validateText,
    includeInReviewerPreview: reviewerPreviewField,
    hideFromAuthors: hideFromAuthorsField,
  },
  TextField: {
    id: textfield,
    title: textfield,
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
    includeInReviewerPreview: reviewerPreviewField,
    hideFromAuthors: hideFromAuthorsField,
  },
  CheckboxGroup: {
    id: textfield,
    title: textfield,
    name: nameField,
    description: editorfield,
    options: optionfield,
    shortDescription: shortDescriptionField,
    validate: validateCollection,
    includeInReviewerPreview: reviewerPreviewField,
    hideFromAuthors: hideFromAuthorsField,
  },
  Select: {
    id: textfield,
    title: textfield,
    name: nameField,
    placeholder: textfield,
    description: editorfield,
    options: optionfield,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    includeInReviewerPreview: reviewerPreviewField,
    hideFromAuthors: hideFromAuthorsField,
  },
  RadioGroup: {
    id: textfield,
    title: textfield,
    name: nameField,
    description: editorfield,
    options: optionfield,
    inline: radiofield,
    sectioncss: textarea,
    shortDescription: shortDescriptionField,
    validate: validateOther,
    includeInReviewerPreview: reviewerPreviewField,
    hideFromAuthors: hideFromAuthorsField,
  },
}

export default elements
