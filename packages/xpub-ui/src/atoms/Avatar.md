A file attached to a note.

```js
const statusFactory = () => {
  const statuses = ['Accepted', 'Pending', 'Declined']
  return statuses[Math.floor(Math.random() * statuses.length)]
};

<Avatar status={statusFactory()}/>
```
