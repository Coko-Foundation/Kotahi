A group of radio buttons that provides just two options: "Yes" or "No"

```js
<YesOrNo
  name="yesorno" 
  onChange={event => console.log(event.target.value)}/>
```

If a value is set, one option is selected.

```js
<YesOrNo
  name="yesorno-value" 
  value="yes"
  onChange={event => console.log(event.target.value)}/>
```

