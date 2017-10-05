A reviewer who has been invited:

```js
const reviewer = {
  status: 'invited',
  events: {
    invited: faker.date.recent(),    
  },
  _reviewer: {
    ordinal: null
  },
  _user: {
     username: faker.internet.userName(),
  },
};

<Reviewer
  reviewer={reviewer}
  removeReviewer={() => console.log('remove')}/>
```

A reviewer who has accepted their invitation:

```js
const reviewer = {
  status: 'accepted',
  events: {
    invited: faker.date.recent(),
    accepted: faker.date.recent(),
  },
  _reviewer: {
    ordinal: null
  },
  _user: {
     username: faker.internet.userName(),
  },
};

<Reviewer
  reviewer={reviewer}
  removeReviewer={() => console.log('remove')}/>
```

A reviewer who has declined their invitation:

```js
const reviewer = {
  status: 'declined',
  events: {
    invited: faker.date.recent(),
    declined: faker.date.recent(),
  },
  _reviewer: {
    ordinal: null
  },
  _user: {
     username: faker.internet.userName(),
  },
};

<Reviewer
  reviewer={reviewer}
  removeReviewer={() => console.log('remove')}/>
```

A reviewer who has submitted their review:

```js
const reviewer = {
  status: 'reviewed',
  events: {
    invited: faker.date.recent(),
    accepted: faker.date.recent(),
    reviewed: faker.date.recent(),
  },
  _reviewer: {
    ordinal: faker.random.number({ max: 3 })
  },
  _user: {
     username: faker.internet.userName(),
  },
};

<Reviewer
  reviewer={reviewer}
  removeReviewer={() => console.log('remove')}/>
```
