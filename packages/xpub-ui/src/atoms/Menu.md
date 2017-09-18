A menu for selecting one of a list of options.

```js
const options = [
  { value: 'foo', label: 'Foo' },
  { value: 'bar', label: 'Bar' },
  { value: 'baz', label: 'Baz' }
];

<Menu 
  options={options}
  onChange={value => console.log(value)}/>
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
  onChange={value => console.log(value)}/>
```

A menu can have a label

```js
const options = [
  { value: 'foo', label: 'Foo' },
  { value: 'bar', label: 'Bar' },
  { value: 'baz', label: 'Baz' }
];

<Menu 
  options={options}
  label="Title"
  value="foo"
  onChange={value => console.log(value)}/>
```
