A radio button.

```js
<Radio 
  name="radio" 
  onChange={event => console.log(event.target.value)}/>
```

A checked radio button.

```js
<Radio 
  name="radio-checked" 
  checked 
  onChange={event => console.log(event.target.value)}/>
```

A radio button with a label.

```js
<Radio 
  name="radio-labelled" 
  label="Foo"
  onChange={event => console.log(event.target.value)}/>
```
