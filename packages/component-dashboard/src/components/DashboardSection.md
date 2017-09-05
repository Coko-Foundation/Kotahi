A section of a dashboard.

When the list of items is not empty, the children are rendered.

```js
const projects = [
  { 
    id: faker.random.uuid(),
    title: faker.lorem.sentence(20) 
  }
];

<DashboardSection 
  projects={projects}/>
```

When the list of items is empty, a custom element can be displayed instead.

```js
<DashboardSection 
  projects={[]}
  empty={EmptySubmissions}/>
```
