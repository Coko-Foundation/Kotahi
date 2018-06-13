const {
  User,
  Collection,
  Team,
  Fragment,
} = require('pubsweet-server/src/models')

// Perhaps these should be exported from server together?
const cleanDB = require('pubsweet-server/test/helpers/db_cleaner')
const fixtures = require('pubsweet-server/test/fixtures/fixtures')
const api = require('pubsweet-server/test/helpers/api')
const authentication = require('pubsweet-server/src/authentication')

let adminToken
let userToken
let admin
let user

const collectionPaper1 = {
  title: 'Paper 1',
  status: 'submitted',
}

describe('server integration', () => {
  beforeEach(async () => {
    await cleanDB()
    admin = await new User(fixtures.adminUser).save()
    user = await new User(fixtures.user).save()
    adminToken = authentication.token.create(admin)
    userToken = authentication.token.create(user)
  })

  describe('admin', () => {
    it('can create a collection with REST', async () => {
      const collection = await api.collections
        .create(collectionPaper1, adminToken)
        .expect(201)
        .then(res => res.body)

      expect(collection.type).toEqual(fixtures.collection.type)
    })

    // it('can create a collection through GraphQL', async () => {
    //   const { body } = await api.graphql.query(
    //     `mutation($input: String) {
    //       createCollection(input: $input) { id, title, status }
    //     }`,
    //     {
    //       input: JSON.stringify(collectionPaper1),
    //     },
    //     adminToken,
    //   )
    //   expect(body.data.createCollection.title).toEqual(collectionPaper1.title)
    // })
  })

  describe('user', () => {
    describe('REST', () => {
      it('can create users', async () => {
        await api.users
          .post({
            username: 'test',
            email: 'test3@example.com',
            password: 'testpassword',
          })
          .expect(201)
          .then(res => res.body)
      })

      it('can create a collection with REST', async () => {
        const collection = await api.collections
          .create(collectionPaper1, userToken)
          .expect(201)
          .then(res => res.body)

        expect(collection.type).toEqual(fixtures.collection.type)
      })

      it('can create a fragment', async () => {
        await api.fragments
          .post({
            fragment: { version: 3, fragmentType: 'version' },
            token: userToken,
          })
          .expect(201)
      })

      it('can create a fragment in a collection', async () => {
        const collection = await new Collection({
          title: 'Test',
          owners: [user.id],
        }).save()

        await api.fragments
          .post({
            fragment: { version: 4, fragmentType: 'version' },
            collection: { id: collection.id },
            token: userToken,
          })
          .expect(201)
      })

      it('can delete a collection they own', async () => {
        const collection = await new Collection({
          title: 'Test',
          owners: [user.id],
        }).save()

        await api.collections.delete(collection.id, userToken).expect(200)
      })

      it('can read own user', async () => {
        const userResponse = await api.users
          .get({ userId: user.id, token: userToken })
          .expect(200)
          .then(res => res.body)
        expect(userResponse.id).toEqual(user.id)
      })

      it('can only read certain properties of other users', async () => {
        const userResponse = await api.users
          .get({ userId: admin.id, token: userToken })
          .expect(200)
          .then(res => res.body)
        expect(Object.keys(userResponse).sort()).toEqual([
          'id',
          'type',
          'username',
        ])
      })

      it('can list users', async () => {
        const response = await api.users
          .get({ token: userToken })
          .expect(200)
          .then(res => res.body)
        expect(response.users).toHaveLength(2)
      })
    })

    // describe('GraphQL', () => {
    //   it('can create a collection with GraphQL', async () => {
    //     const { body } = await api.graphql.query(
    //       `mutation($input: String) {
    //         createCollection(input: $input) {
    //           id
    //           title
    //           status
    //         }
    //       }`,
    //       { input: JSON.stringify(collectionPaper1) },
    //       userToken,
    //     )
    //     expect(body.data.createCollection.title).toEqual(collectionPaper1.title)
    //   })

    //   it('can read a collection with GraphQL', async () => {
    //     const collection = await new Collection({
    //       title: 'Test',
    //       owners: [user.id],
    //     }).save()

    //     const { body } = await api.graphql.query(
    //       `query($id: ID) {
    //           collection(id: $id) {
    //             title
    //             owners {
    //               id
    //             }
    //           }
    //         }`,
    //       { id: collection.id },
    //       userToken,
    //     )

    //     expect(body).toEqual({
    //       data: { collection: { title: 'Test', owners: [{ id: user.id }] } },
    //     })
    //   })
    // })
  })

  describe('managing editor', () => {
    describe('REST', () => {
      let editorToken
      let paperA
      let paperB

      beforeEach(async () => {
        const editor = await new User(
          Object.assign({}, fixtures.user, {
            username: 'testeditor',
            email: 'testeditor@example.com',
          }),
        ).save()

        await new Team({
          name: 'Managing Editors',
          teamType: 'managingEditor',
          members: [editor.id],
        }).save()

        const versionA1 = await new Fragment({
          fragmentType: 'version',
          version: 1,
          owners: [user.id],
        }).save()
        const versionB1 = await new Fragment({
          fragmentType: 'version',
          version: 2,
          owners: [admin.id],
        }).save()

        paperA = new Collection({
          title: 'Project Paper A',
          owners: [user.id],
          fragments: [versionA1.id],
        })
        paperB = new Collection({
          title: 'Project Paper B',
          owners: [admin.id],
          fragments: [versionB1.id],
        })

        await paperA.save()
        await paperB.save()

        editorToken = authentication.token.create(editor)
      })

      it('can list all projects (collections)', async () => {
        const collections = await api.collections
          .list(editorToken)
          .expect(200)
          .then(res => res.body)

        expect(collections).toHaveLength(2)
      })

      it('can list all versions (fragments) of a project (collection)', async () => {
        const fragments = await api.fragments
          .get({ collection: paperA, token: editorToken })
          .expect(200)
          .then(res => res.body)

        expect(fragments).toHaveLength(1)
      })
    })
  })
})
