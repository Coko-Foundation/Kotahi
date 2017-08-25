An editor for a note, with some formatting.

```js
const value = faker.lorem.sentence(50);

<NoteEditor
    value={value}
    title="Note"
    placeholder="Enter a message…"
    onChange={value => console.log(value)}/>
```

When no content has been entered, a placeholder is displayed.

```js
<NoteEditor
    value=""
    title="Note"
    placeholder="Enter a message…"
    onChange={value => console.log(value)}/>
```
