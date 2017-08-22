A group of radio buttons.

```js
initialState = { foo: undefined };

const options = [
  {
    value: 'one',
    label: 'One'
  },
  {
    value: 'two',
    label: 'Two'
  },
  {
    value: 'three',
    label: 'Three'
  }
];

<RadioGroup 
  options={options} 
  name="foo"
  value={state.foo} 
  handleChange={foo => setState({ foo })}/>
```
