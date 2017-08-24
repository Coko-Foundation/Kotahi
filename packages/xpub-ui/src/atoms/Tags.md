A form input for a list of tags.

```js
<Tags 
  onChange={value => console.log(value)}/>
```

Existing values can be passed in, and the placeholder can be customized.

```js
const value = [
  {name: 'foo'}, 
  {name: 'bar'}, 
  {name: 'baz'}
];

<Tags 
  value={value}
  placeholder="Add new keyword"
  onChange={value => console.log(value)}/>
```
