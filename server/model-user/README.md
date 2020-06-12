Consists of two parts, the [User and the Identity model](https://gitlab.coko.foundation/pubsweet/pubsweet/tree/master/components/server/model-user/src). The User model contains a very basic set of user-related features (email, username, password hash, password reset token), and is complemented by the Identity model, which contains information about local (e.g. secondary email) or external identities (e.g. ORCID OAuth information).

To use the User model, you have to [include it in the component list](/#/Components?id=section-how-do-you-use-components), and then require it in your code:

```js static
const { User, Identity } = require('@pubsweet/models')
```

You can then use the model as any other PubSweet model, e.g.

```js static
const user = {
  username: input.username,
  email: input.email,
  password: input.password,
}

const identity = {
  type: 'local',
  aff: input.aff,
  name: input.name,
  isDefault: true,
}
user.defaultIdentity = identity

const savedUser = await new User(user).saveGraph()
```
