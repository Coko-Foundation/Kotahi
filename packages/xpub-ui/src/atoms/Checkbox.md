A checkbox.

```js
initialState = { checked: null };

<Checkbox 
  name="checkbox" 
  checked={state.checked}
  onChange={event => setState({ checked: event.target.checked })}/>
```

A checked checkbox.

```js
initialState = { checked: true };

<Checkbox 
  name="checkbox-checked" 
  checked={state.checked}
  onChange={event => setState({ checked: event.target.checked })}/>
```

A checkbox with a label.

```js
initialState = { checked: false };

<Checkbox 
  name="checkbox-labelled" 
  checked={state.checked}
  label="Foo"
  onChange={event => setState({ checked: event.target.checked })}/>
```
