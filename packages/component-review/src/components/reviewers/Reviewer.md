A grid block that displays information about a reviewer of a version.

```js
const user = () => ({
    id: faker.random.uuid(),
    username: faker.internet.userName(),
    fullname: faker.name.findName(),
    email: faker.internet.email()
});

const reviewerFactory = () => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    const date = faker.date.recent()

    return {
      _user: user(),
      status: faker.random.arrayElement(['Accepted', 'Pending', 'Declined', 'Sumbitted']),
      addedOn: date.toLocaleDateString('en-US', options),
      projectReviewer: faker.random.arrayElement([1,2,3])
    }
};

<Reviewer
  reviewer={reviewerFactory()}
  removeReviewer={value => console.log(value)}/>
```
