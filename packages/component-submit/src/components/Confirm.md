A series of confirmation paragraphs that the user must read and agree to before confirming the submission.

The user can confirm submission using the primary button, or return to the submission using a link.

```js
const project = {
  id: faker.random.uuid()
};

<Confirm 
  project={project}
  confirmSubmission={() => console.log('confirmed')}/>
```
