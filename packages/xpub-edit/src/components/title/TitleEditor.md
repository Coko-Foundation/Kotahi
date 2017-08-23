An editor for an article"s title, with minimal formatting.

```js
const value = faker.lorem.sentence(15);

<TitleEditor
    value={value}
    title="Title"
    placeholder="Enter the title…"
    onChange={(event, value) => console.log({ value })}/>
```

When no content is provided, a placeholder is displayed.

```js
<TitleEditor
    value=""
    title="Title"
    placeholder="Enter the title…"
    onChange={(event, html) => setState({ html })}/>
```
