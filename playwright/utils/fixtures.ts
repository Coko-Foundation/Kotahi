import { basename } from 'path'
import { test as base, type APIResponse } from '@playwright/test'

export const jsonOrThrow = async (
  response: APIResponse | Promise<APIResponse>,
): Promise<any> => {
  const resolved = await response

  if (!resolved.ok()) {
    throw new Error(
      `${resolved.url()} returned ${resolved.status()}: ${await resolved.text()}`,
    )
  }

  return resolved.json()
}

type LoginAs = (username: string) => Promise<void>

type TestGroup = {
  groupName: string
  adminUsername: string
  groupAdminUsername: string
  groupManagerUsername: string
  usernames: string[]
}

type Api = {
  createManuscripts: (opts: {
    amount: number
    submitter?: string
  }) => Promise<{ manuscriptIds: string[] }>
  assignRole: (opts: {
    username: string
    role: string
    manuscriptIds: string[]
  }) => Promise<{ manuscriptCount: number }>
  updateGroupConfig: (patch: Record<string, unknown>) => Promise<unknown>
}

export const test = base.extend<{
  apiUrl: string
  loginAs: LoginAs
  testGroup: TestGroup
  api: Api
}>({
  // No default - always set via `use: { apiUrl }` in playwright.config.ts.
  apiUrl: ['', { option: true }],

  loginAs: async ({ page, request, apiUrl }, use) => {
    await use(async username => {
      const { token } = await jsonOrThrow(
        request.post(`${apiUrl}/createToken/${encodeURIComponent(username)}`),
      )

      await page.addInitScript(
        /* eslint-disable-next-line no-undef */
        tokenValue => window.localStorage.setItem('token', tokenValue),
        token,
      )
    })
  },

  testGroup: async ({ request, apiUrl }, use, testInfo) => {
    const specName = basename(testInfo.file, '.spec.ts')
    const groupName = `pw-${specName}-${testInfo.testId}`

    const group: TestGroup = await jsonOrThrow(
      request.post(`${apiUrl}/testGroup/${groupName}`),
    )

    await use(group)
  },

  api: async ({ request, apiUrl, testGroup }, use) => {
    await use({
      createManuscripts: ({ amount, submitter }) =>
        jsonOrThrow(
          request.post(
            `${apiUrl}/testManuscripts/${testGroup.groupName}/${amount}${
              submitter
                ? `?submitterUsername=${encodeURIComponent(submitter)}`
                : ''
            }`,
          ),
        ),

      assignRole: ({ username, role, manuscriptIds }) =>
        jsonOrThrow(
          request.post(
            `${apiUrl}/assignRole/${encodeURIComponent(username)}/${role}?manuscriptIds=${manuscriptIds.join(',')}`,
          ),
        ),

      updateGroupConfig: patch =>
        jsonOrThrow(
          request.post(
            `${apiUrl}/testGroupConfig/${testGroup.groupName}?patch=${encodeURIComponent(JSON.stringify(patch))}`,
          ),
        ),
    })
  },
})

export { expect } from '@playwright/test'
export type { APIRequestContext, APIResponse, Page } from '@playwright/test'
