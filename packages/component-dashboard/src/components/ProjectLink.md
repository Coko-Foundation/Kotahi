A link to a project, version, or page.

```js
<ProjectLink project="foo">project</ProjectLink>
```

```js
<ProjectLink project="foo" version="bar">version</ProjectLink>
```

```js
<ProjectLink project="foo" version="bar" page="baz">page</ProjectLink>
```

```js
<ProjectLink project="foo" version="bar" page="baz" id={1}>id</ProjectLink>
```

The project and/or version can be an object with an id.

```js
<ProjectLink project={{id:'foo'}} version={{id:'bar'}}>id</ProjectLink>
```
