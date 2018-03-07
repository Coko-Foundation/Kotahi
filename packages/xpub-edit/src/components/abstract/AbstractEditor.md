An editor for an article's abstract, with some formatting and sections.

```js
const value = faker.lorem.sentence(200);

<AbstractEditor
    value={value}
    title="Abstract"
    placeholder="Enter a short description of the work…"
    onBlur={value => console.log(value)}
    onChange={value => console.log(value)}/>
```

When no content has been entered, a placeholder is displayed.

```js
<AbstractEditor
    value=""
    title="Abstract"
    placeholder="Enter a short description of the work…"
    onBlur={value => console.log(value)}
    onChange={value => console.log(value)}/>
```
