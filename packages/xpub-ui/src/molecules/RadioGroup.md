A group of radio buttons.

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

<RadioGroup 
  options={options} 
  name="radiogroup-foo"
  onChange={event => console.log(event.target.value)}/>
```
