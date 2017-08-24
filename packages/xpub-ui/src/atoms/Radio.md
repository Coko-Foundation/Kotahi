A radio button.

```js
<Radio 
  name="foo" 
  onChange={event => console.log(event.target.value)}/>
```

A checked radio button.

```js
<Radio 
  name="bar" 
  checked 
  onChange={event => console.log(event.target.value)}/>
```

A radio button with a label.

```js
<Radio 
  name="foo" 
  label="Foo"
  onChange={event => console.log(event.target.value)}/>
```
