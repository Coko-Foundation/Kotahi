A paper, with a title and a percentage score.

```js
const paper = {
    id: faker.random.uuid(),
    title: faker.lorem.sentence(20, 5),
    scorePercent: faker.random.number({ min: 1, max: 100 })
};

<Paper id={paper.id} paper={paper} />
```
