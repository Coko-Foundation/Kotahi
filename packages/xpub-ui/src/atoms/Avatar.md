A general purpose Avatar element.

```js
const statusFactory = () => {
  const statuses = ['Accepted', 'Pending', 'Declined', 'Submitted']
  return statuses[Math.floor(Math.random() * statuses.length)]
};

<Avatar status={statusFactory()}/>
```
