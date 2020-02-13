A reviewer who has been invited:

```js
const reviewer = {
  status: 'invited',
  user: {
    username: faker.internet.userName(),
  },
}
;<Reviewer reviewer={reviewer} removeReviewer={() => console.log('remove')} />
```

A reviewer who has accepted their invitation:

```js
const reviewer = {
  status: 'accepted',
  user: {
    username: faker.internet.userName(),
  },
}
;<Reviewer reviewer={reviewer} removeReviewer={() => console.log('remove')} />
```

A reviewer who has declined their invitation:

```js
const reviewer = {
  status: 'declined',
  user: {
    username: faker.internet.userName(),
  },
}
;<Reviewer reviewer={reviewer} removeReviewer={() => console.log('remove')} />
```

A reviewer who has submitted their review:

```js
const reviewer = {
  status: 'reviewed',
  user: {
    username: faker.internet.userName(),
  },
}
;<Reviewer reviewer={reviewer} removeReviewer={() => console.log('remove')} />
```
