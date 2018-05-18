import faker from 'faker'
import DestinationRequest from 'testcafe-hammerhead/lib/request-pipeline/destination-request'
import start from 'pubsweet/src/startup/start'
import { addUser, createTables } from '@pubsweet/db-manager'

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

export function teardown() {}
