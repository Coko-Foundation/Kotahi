A decision on a version of a project.

```js
const decision = {
  id: faker.random.uuid(),
  comments: [{ type: 'note', content: 'this needs review' }],
  created: 'Thu Oct 11 2018',
  open: false,
  status: '<p>This is a decision</p>',
  user: { identities: [] },
}
;<Decision decision={decision} />
```
