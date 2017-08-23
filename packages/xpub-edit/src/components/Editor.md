An editor.

```js
const toolbar = {
  marks: [
    {
      type: 'bold',
      label: 'Bold',
      button: <b>Bold</b>,
    },
    {
      type: 'italic',
      label: 'Italic',
      button: <i>Italic</i>,
    },
  ],
  nodes: [
    {
      type: 'heading',
      label: 'Heading',
      button: <span>Heading</span>,
    },
  ]
}

const schema = {
  marks: {
    bold: props => <b>{props.children}</b>,
    italic: props => <i>{props.children}</i>
  },
  nodes: {
    heading: props => <h1>{props.children}</h1>,
  }
};

const value = faker.lorem.sentence(50);

<Editor
    value={value}
    title="Example"
    placeholder="Enter some text…"
    toolbar={toolbar}
    schema={schema}
    onChange={(event, value) => console.log(value)}/>
```
