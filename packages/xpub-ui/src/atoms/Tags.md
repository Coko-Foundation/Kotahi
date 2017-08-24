A form input for a list of tags.

```js
<Tags 
  onChange={event => console.log(event.target.value)}/>
```

Existing values can be passed in, and the placeholder can be customized.

```js
const value = [
  {id: 1, name: 'foo'}, 
  {id: 2, name: 'bar'}, 
  {id: 3, name: 'baz'}
];

<Tags 
  value={value}
  placeholder="Add new keyword"
  onChange={event => console.log(event.target.value)}/>
```
