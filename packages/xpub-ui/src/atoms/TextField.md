A form input for plain text.


```js
initialState = { value: '' };

<TextField 
  value={state.value} 
  placeholder="so you can write some in here"
  onChange={event => setState({ value: event.target.value })}/>
```

The input can have a label.

```js
initialState = { value: '' };

<TextField 
  label="Foo" 
  value={state.value}
  placeholder="so you can write some in here"
  onChange={event => setState({ value: event.target.value })}/>
```
