A group of radio buttons that provides just two options: "Yes" or "No"

```js
initialState = { foo: undefined };

<YesOrNo
  name="foo" 
  value={state.foo} 
  onChange={event => setState({ foo: event.target.value })}/>
```
