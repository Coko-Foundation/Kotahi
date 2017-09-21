A grid block that displays information about a reviewer of a version.

```js
const user = () => ({
    id: faker.random.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email()
});
const statusFactory = () => {
  const statuses = ['Accepted', 'Pending', 'Declined']
  return statuses[Math.floor(Math.random() * statuses.length)]
};
const dateFactory = () => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  const date = new Date()
  return date.toLocaleDateString('en-US', options)
};
const reviewer = {
    projectReviewer: faker.random.uuid(),
    _user: user(),
    status: statusFactory(),
    addedOn: dateFactory() 
};

<Reviewer
  reviewer={reviewer}
  removeReviewer={value => console.log(value)}/>
```
