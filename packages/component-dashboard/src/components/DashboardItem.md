An item in a list of projects on a Dashboard.

```js
const project = {
  title: faker.lorem.sentence(20),
  submitted: null
};

<DashboardItem project={project}/>
```

The "submitted" status of the project is shown.

```js
const project = {
  title: faker.lorem.sentence(20),
  submitted: faker.date.past(1)
};

<DashboardItem project={project}/>
```
