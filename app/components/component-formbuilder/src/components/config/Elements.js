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
    label: 'Inline',
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
  },
  VisualAbstract: {
    id: textfield,
    title: textfield,
    name: textfield,
    description: editorfield,
    shortDescription: textfield,
    validate,
  },
  AuthorsInput: {
    id: textfield,
    title: textfield,
    name: textfield,
    shortDescription: textfield,
    validate,
  },
  LinksInput: {
    id: textfield,
    title: textfield,
    name: textfield,
    shortDescription: textfield,
    validate,
  },
  AbstractEditor: {
    id: textfield,
    title: textfield,
    name: textfield,
    placeholder: textfield,
    description: editorfield,
    validate,
    shortDescription: textfield,
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
        label: 'Split with Comma Seperate',
        options: [
          {
            value: 'false',
            label: 'None',
          },
          {
            value: 'split',
            label: 'Split',
          },
        ],
      },
    },
    format: {
      component: 'Menu',
      props: {
        label: 'Join with Comma',
        options: [
          {
            value: 'false',
            label: 'None',
          },
          {
            value: 'join',
            label: 'Join',
          },
        ],
      },
    },
  },
  CheckboxGroup: {
    id: textfield,
    title: textfield,
    name: textfield,
    description: editorfield,
    options: optionfield,
    shortDescription: textfield,
    validate,
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
  },
}

export default Object.assign(elements, extendComponents)
