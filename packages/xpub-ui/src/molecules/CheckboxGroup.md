A group of checkboxes.

```js
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

initialState = { value: [] };

<CheckboxGroup 
  name="checkboxgroup"
  options={options} 
  value={state.value}
  onChange={value => setState({ value })}/>
```

The checkboxes can be displayed inline.

```js
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

initialState = { value: [] };

<CheckboxGroup 
  name="checkboxgroup-inline"
  options={options} 
  value={state.value}
  inline={true}
  onChange={value => setState({ value })}/>
```
