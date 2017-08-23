An editor for an article's abstract, with some formatting and sections.

```js
const value = faker.lorem.sentence(50);

<AbstractEditor
    value={value}
    title="Abstract"
    placeholder="Enter a short description of the work…"
    onChange={(event, value) => console.log(value)}/>
```

When no content has been entered, a placeholder is displayed.

```js
<AbstractEditor
    value=""
    title="Abstract"
    placeholder="Enter a short description of the work…"
    onChange={(event, value) => console.log(value)}/>
```
