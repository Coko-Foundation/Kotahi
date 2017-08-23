A viewer.

```js
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

<Viewer
    value={value}
    schema={schema}/>
```
