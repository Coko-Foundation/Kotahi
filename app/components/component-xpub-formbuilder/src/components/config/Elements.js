import config from 'config'

const extendComponents = (config['pubsweet-component-xpub-formbuilder'] || {})
  .components

const textfield = {
  component: 'TextField',
}

const orderfield = {
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
    multi: true,
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
  Supplementary: {
    id: textfield,
    title: textfield,
    name: textfield,
    description: editorfield,
    order: orderfield,
    validate,
  },
  AuthorsInput: {
    id: textfield,
    title: textfield,
    name: textfield,
    order: orderfield,
    validate,
  },
  AbstractEditor: {
    id: textfield,
    title: textfield,
    name: textfield,
    placeholder: textfield,
    description: editorfield,
    order: orderfield,
    validate,
  },
  TextField: {
    id: textfield,
    title: textfield,
    name: textfield,
    placeholder: textfield,
    description: editorfield,
    order: orderfield,
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
    order: orderfield,
    validate,
  },
  Menu: {
    id: textfield,
    title: textfield,
    name: textfield,
    placeholder: textfield,
    description: editorfield,
    options: optionfield,
    order: orderfield,
    validate,
  },
  RadioGroup: {
    id: textfield,
    title: textfield,
    name: textfield,
    description: editorfield,
    options: optionfield,
    order: orderfield,
    inline: radiofield,
    sectioncss: textarea,
    validate,
  },
}

export default Object.assign(elements, extendComponents)
