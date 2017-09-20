A grid block that displays information about a reviewer of a version.

```js
const user = () => ({
    id: faker.random.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email()
})
const statusFactory = () => {
  const statuses = ['Accepted', 'Pending', 'Declined']
  return statuses[Math.floor(Math.random() * statuses.length)]
}
const reviewer = {
    projectReviewer: faker.random.uuid(),
    _user: user(),
    status: statusFactory()
};

<Reviewer
  reviewer={reviewer}
  removeReviewer={value => console.log(value)}/>
```
