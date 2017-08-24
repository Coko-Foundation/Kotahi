A menu for selecting one of a list of options.

```js
const options = [
  { value: 'foo', label: 'Foo' },
  { value: 'bar', label: 'Bar' },
  { value: 'baz', label: 'Baz' }
];

<Menu 
  options={options}
  onChange={event => console.log(event.target.value)}/>
```

When an option is selected, it replaces the placeholder.

```js
const options = [
  { value: 'foo', label: 'Foo' },
  { value: 'bar', label: 'Bar' },
  { value: 'baz', label: 'Baz' }
];

<Menu 
  options={options}
  value="foo"
  onChange={event => console.log(event.target.value)}/>
```
