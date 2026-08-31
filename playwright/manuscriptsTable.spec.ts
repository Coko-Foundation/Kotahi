import {
  test,
  expect,
  jsonOrThrow,
  type APIRequestContext,
  type APIResponse,
  type Page,
} from './utils/fixtures'

// Mirrors VARIANT_CONFIG in packages/client/app/pages/hooks/useManuscriptsTable.tsx
// ('actions' is always appended on top of each variant's defaultColumnKeys)
const DEFAULT_COLUMNS = {
  submitter: [
    'shortId',
    'submission.$title',
    'status',
    'created',
    'updated',
    'actions',
  ],
  reviewer: ['shortId', 'submission.$title', 'reviewerStatusBadge', 'actions'],
  editor: [
    'shortId',
    'submission.$title',
    'status',
    'manuscriptVersions',
    'statusCounts',
    'lastUpdated',
    'actions',
  ],
  admin: [
    'shortId',
    'titleAndAbstract',
    'created',
    'updated',
    'status',
    'submission.$customStatus',
    'author',
    'actions',
  ],
}

const getHeaderTestIds = (page: Page): Promise<(string | undefined)[]> =>
  page
    .locator('.ant-table-thead th[data-testid]')
    .evaluateAll(cells => cells.map(cell => cell.dataset.testid))

const updateGroupConfig = (
  request: APIRequestContext,
  apiUrl: string,
  groupName: string,
  patch: Record<string, unknown>,
): Promise<APIResponse> =>
  request.post(
    `${apiUrl}/testGroupConfig/${groupName}?patch=${encodeURIComponent(JSON.stringify(patch))}`,
  )

test.describe('manuscripts table default columns', () => {
  test.beforeEach(async ({ loginAs, testGroup }) => {
    await loginAs(testGroup.adminUsername)
  })

  test('submissions table shows the default submitter columns', async ({
    page,
    testGroup,
  }) => {
    await page.goto(`/${testGroup.groupName}/dashboard/submissions`)
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toEqual(DEFAULT_COLUMNS.submitter)
  })

  test('reviews table shows the default reviewer columns', async ({
    page,
    testGroup,
  }) => {
    await page.goto(`/${testGroup.groupName}/dashboard/reviews`)
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toEqual(DEFAULT_COLUMNS.reviewer)
  })

  test('edits table shows the default editor columns', async ({
    page,
    testGroup,
  }) => {
    await page.goto(`/${testGroup.groupName}/dashboard/edits`)
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toEqual(DEFAULT_COLUMNS.editor)
  })

  test('manuscripts table shows the default admin columns', async ({
    page,
    testGroup,
  }) => {
    await page.goto(`/${testGroup.groupName}/admin/manuscripts`)
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toEqual(DEFAULT_COLUMNS.admin)
  })
})

// submitter and admin have no forcedColumnKeys in VARIANT_CONFIG
test.describe('manuscripts table forced columns', () => {
  test.beforeEach(async ({ loginAs, testGroup }) => {
    await loginAs(testGroup.adminUsername)
  })

  test('reviewer status column survives a config that omits it', async ({
    page,
    request,
    apiUrl,
    testGroup,
  }) => {
    await page.goto(`/${testGroup.groupName}/dashboard/reviews`)
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toContain('reviewerStatusBadge')

    await updateGroupConfig(request, apiUrl, testGroup.groupName, {
      dashboard: { tableColumns: 'shortId,submission.$title' },
    })

    await page.reload()
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toEqual([
      'shortId',
      'submission.$title',
      'reviewerStatusBadge',
      'actions',
    ])
  })

  test('statusCounts and lastUpdated columns survive a config that omits them', async ({
    page,
    request,
    apiUrl,
    testGroup,
  }) => {
    await page.goto(`/${testGroup.groupName}/dashboard/edits`)
    await expect(page.locator('.ant-table-thead')).toBeVisible()

    const before = await getHeaderTestIds(page)
    expect(before).toContain('statusCounts')
    expect(before).toContain('lastUpdated')

    await updateGroupConfig(request, apiUrl, testGroup.groupName, {
      dashboard: { editingQueue: 'shortId,submission.$title,status' },
    })

    await page.reload()
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toEqual([
      'shortId',
      'submission.$title',
      'status',
      'statusCounts',
      'lastUpdated',
      'actions',
    ])
  })
})

test.describe('manuscripts table data', () => {
  test('shows all 15 seeded manuscripts across two pages', async ({
    request,
    apiUrl,
    loginAs,
    page,
    testGroup,
  }) => {
    const submitterUsername = testGroup.usernames[0]

    await request.post(
      `${apiUrl}/testManuscripts/${testGroup.groupName}/15?submitterUsername=${encodeURIComponent(submitterUsername)}`,
    )

    await loginAs(submitterUsername)

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await page.goto(`/${testGroup.groupName}/dashboard/submissions`)
    await expect(shortIdCells).toHaveCount(10)
    const pageOneIds = await shortIdCells.allTextContents()

    await page.goto(`/${testGroup.groupName}/dashboard/submissions?pagenum=2`)
    await expect(shortIdCells).toHaveCount(5)
    const pageTwoIds = await shortIdCells.allTextContents()

    // shortId is a global sequence, not scoped to this group, so check
    // uniqueness/count rather than specific values.
    const allIds = new Set([...pageOneIds, ...pageTwoIds])
    expect(allIds.size).toBe(15)

    await page.goto(`/${testGroup.groupName}/dashboard/reviews`)
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()

    await page.goto(`/${testGroup.groupName}/dashboard/edits`)
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()
  })

  test('reviewer sees only the manuscripts they were assigned to review', async ({
    request,
    apiUrl,
    loginAs,
    page,
    testGroup,
  }) => {
    const [authorUsername, reviewerUsername] = testGroup.usernames

    const { manuscriptIds } = await jsonOrThrow(
      await request.post(
        `${apiUrl}/testManuscripts/${testGroup.groupName}/5?submitterUsername=${encodeURIComponent(authorUsername)}`,
      ),
    )

    const reviewedManuscriptIds = manuscriptIds.slice(0, 3)

    await request.post(
      `${apiUrl}/assignRole/${encodeURIComponent(reviewerUsername)}/reviewer?manuscriptIds=${reviewedManuscriptIds.join(',')}`,
    )

    await loginAs(reviewerUsername)

    await page.goto(`/${testGroup.groupName}/dashboard/reviews`)

    await expect(
      page.locator('.ant-table-tbody td[data-testid="shortId"]'),
    ).toHaveCount(3)

    await page.goto(`/${testGroup.groupName}/dashboard/submissions`)
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()

    await page.goto(`/${testGroup.groupName}/dashboard/edits`)
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()
  })

  test('editor sees manuscripts across all three editor roles they hold', async ({
    request,
    apiUrl,
    loginAs,
    page,
    testGroup,
  }) => {
    const [authorUsername, editorUsername] = testGroup.usernames

    const { manuscriptIds } = await jsonOrThrow(
      await request.post(
        `${apiUrl}/testManuscripts/${testGroup.groupName}/5?submitterUsername=${encodeURIComponent(authorUsername)}`,
      ),
    )

    const [
      seniorEditorManuscriptId,
      handlingEditorManuscriptId,
      editorManuscriptId,
    ] = manuscriptIds

    await Promise.all(
      [
        ['seniorEditor', seniorEditorManuscriptId],
        ['handlingEditor', handlingEditorManuscriptId],
        ['editor', editorManuscriptId],
      ].map(([role, manuscriptId]) =>
        request.post(
          `${apiUrl}/assignRole/${encodeURIComponent(editorUsername)}/${role}?manuscriptIds=${manuscriptId}`,
        ),
      ),
    )

    await loginAs(editorUsername)

    await page.goto(`/${testGroup.groupName}/dashboard/edits`)
    await expect(
      page.locator('.ant-table-tbody td[data-testid="shortId"]'),
    ).toHaveCount(3)

    await page.goto(`/${testGroup.groupName}/dashboard/submissions`)
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()

    await page.goto(`/${testGroup.groupName}/dashboard/reviews`)
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()
  })
})
