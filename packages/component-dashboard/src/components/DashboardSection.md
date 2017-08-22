A section of a dashboard.

When the list of items is not empty, the children are rendered.

```js
const items = [
  { 
    id: faker.random.uuid(),
    title: faker.lorem.sentence(20) 
  }
];

<DashboardSection items={items} empty={EmptySubmissions}>
  <ul>
    {items.map(item => <li key={item.id}>{item.title}</li>)}
  </ul>
</DashboardSection>
```

When the list of items is empty, a custom element is displayed instead.

```js
const items = [];

<DashboardSection items={items} empty={EmptySubmissions}>
  <ul>
    {items.map(item => <li key={item.id}>{item.title}</li>)}
  </ul>
</DashboardSection>
```
