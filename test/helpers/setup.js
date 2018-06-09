import faker from 'faker'
import DestinationRequest from 'testcafe-hammerhead/lib/request-pipeline/destination-request'
import start from 'pubsweet/src/startup/start'
import {
  addUser,
  createTables,
  dbExists,
  addCollection,
} from '@pubsweet/db-manager'
import testSubmission3 from './fixtures/testSubmission4'
import testSubmission4 from './fixtures/testSubmision4'

let server

export async function startServer() {
  if (!server) {
    // increase timeout to wait for webpack compilation
    DestinationRequest.TIMEOUT = 60 * 1000
    server = await start()
  }
}

export async function setup(user) {
  await createTables(true)

  const userData = user || {
    username: faker.internet.domainWord(),
    email: faker.internet.exampleEmail(),
    password: faker.internet.password(),
    admin: true,
  }

  await addUser(userData)

  return { userData }
}

export async function setupSubmittedManuscript() {
  if (dbExists) {
    const collection = testSubmission3.collection
    const fragment = testSubmission4.fragment
  }
}

export async function setupTwoSubmittedManuscripts() {
  //set up first manuscript
  setupSubmittedManuscript()

  //set up second manuscript
  const collection = testSubmission4.collection
  const fragment = testSubmission4.fragment
}

export function teardown() {}
