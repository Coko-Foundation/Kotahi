A grid block that displays information about a reviewer of a version.

```js
const user = () => ({
    id: faker.random.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email()
})

const reviewer = {
    projectReviewer: faker.random.uuid(),
    _user: user()
};

<Reviewer
  reviewer={reviewer}
  removeReviewer={value => console.log(value)}/>
```
