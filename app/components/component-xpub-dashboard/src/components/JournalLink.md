A link to a project, version, or page.

```js
<JournalLink journal="foo">journal</JournalLink>
```

```js
<JournalLink journal="foo" version="bar">
  version
</JournalLink>
```

```js
<JournalLink journal="foo" version="bar" page="baz">
  page
</JournalLink>
```

```js
<JournalLink journal="foo" version="bar" page="baz" id={1}>
  id
</JournalLink>
```

The project and/or version can be an object with an id.

```js
<JournalLink journal={{ id: 'foo' }} version={{ id: 'bar' }}>
  id
</JournalLink>
```
