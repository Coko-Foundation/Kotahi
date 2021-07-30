import config from 'config'

const extendComponents = (config['pubsweet-component-xpub-formbuilder'] || {})
  .components

const textfield = {
  component: 'TextField',
}

const optionfield = {
  component: 'OptionsField',
}

const editorfield = {
  component: 'AbstractField',
}

const textarea = {
  component: 'TextArea',
  props: {
    cols: 55,
    rows: 5,
  },
}

const validate = {
  component: 'Menu',
  props: {
    isMulti: true,
    isClearable: true,
    options: [
      {
        value: 'required',
        label: 'Required',
      },
      {
        value: 'minSize',
        label: 'minSize',
      },
      {
        value: 'minChars',
        label: 'minimum Characters',
      },
      {
        value: 'maxChars',
        label: 'maximum Characters',
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
}

const elements = {
  SupplementaryFiles: {
    id: textfield,
    title: textfield,
    name: textfield,
    description: editorfield,
    shortDescription: textfield,
    validate,
    includeInReviewerPreview: reviewerPreviewField,
  },
  VisualAbstract: {
    id: textfield,
    title: textfield,
    name: textfield,
    description: editorfield,
    shortDescription: textfield,
    validate,
    includeInReviewerPreview: reviewerPreviewField,
  },
  AuthorsInput: {
    id: textfield,
    title: textfield,
    name: textfield,
    shortDescription: textfield,
    validate,
    includeInReviewerPreview: reviewerPreviewField,
  },
  LinksInput: {
    id: textfield,
    title: textfield,
    name: textfield,
    shortDescription: textfield,
    validate,
    includeInReviewerPreview: reviewerPreviewField,
  },
  AbstractEditor: {
    id: textfield,
    title: textfield,
    name: textfield,
    placeholder: textfield,
    description: editorfield,
    validate,
    shortDescription: textfield,
    includeInReviewerPreview: reviewerPreviewField,
  },
  TextField: {
    id: textfield,
    title: textfield,
    name: textfield,
    placeholder: textfield,
    description: editorfield,
    shortDescription: textfield,
    validate,
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
        label: 'DOI Validation',
      },
    },
    includeInReviewerPreview: reviewerPreviewField,
  },
  CheckboxGroup: {
    id: textfield,
    title: textfield,
    name: textfield,
    description: editorfield,
    options: optionfield,
    shortDescription: textfield,
    validate,
    includeInReviewerPreview: reviewerPreviewField,
  },
  Select: {
    id: textfield,
    title: textfield,
    name: textfield,
    placeholder: textfield,
    description: editorfield,
    options: optionfield,
    shortDescription: textfield,
    validate,
    includeInReviewerPreview: reviewerPreviewField,
  },
  RadioGroup: {
    id: textfield,
    title: textfield,
    name: textfield,
    description: editorfield,
    options: optionfield,
    inline: radiofield,
    sectioncss: textarea,
    shortDescription: textfield,
    validate,
    includeInReviewerPreview: reviewerPreviewField,
  },
}

export default Object.assign(elements, extendComponents)
