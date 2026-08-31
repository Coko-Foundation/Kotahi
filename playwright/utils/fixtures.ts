import { basename } from 'path'
import { test as base, type APIResponse } from '@playwright/test'

export const jsonOrThrow = async (response: APIResponse): Promise<any> => {
  if (!response.ok()) {
    throw new Error(
      `${response.url()} returned ${response.status()}: ${await response.text()}`,
    )
  }

  return response.json()
}

type LoginAs = (username: string) => Promise<void>

type TestGroup = {
  groupName: string
  adminUsername: string
  groupAdminUsername: string
  groupManagerUsername: string
  usernames: string[]
}

export const test = base.extend<{
  apiUrl: string
  loginAs: LoginAs
  testGroup: TestGroup
}>({
  // No default - always set via `use: { apiUrl }` in playwright.config.ts.
  apiUrl: ['', { option: true }],

  loginAs: async ({ page, request, apiUrl }, use) => {
    await use(async username => {
      const { token } = await jsonOrThrow(
        await request.post(
          `${apiUrl}/createToken/${encodeURIComponent(username)}`,
        ),
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
      await request.post(`${apiUrl}/testGroup/${groupName}`),
    )

    await use(group)
  },
})

export { expect } from '@playwright/test'
export type { APIRequestContext, APIResponse, Page } from '@playwright/test'
