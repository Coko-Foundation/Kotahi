A series of confirmation paragraphs that the user must read and agree to before confirming the submission.

The user can confirm submission using the primary button, or return to the submission using a link.

```js
const form = {
  haspopup: 'true',
  id: 'submit',
  name: 'Submission information',
  popupdescription: faker.lorem.sentences(50),
  popuptitle: faker.lorem.words(3),
}
;<Confirm form={form} />
```
