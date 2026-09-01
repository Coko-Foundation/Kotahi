import { colorSecondary, testOrcid } from './utils/constants'
import { test, expect, type Page } from './utils/fixtures'
import { formatAbsoluteDate, hexToRgb } from './utils/helpers'

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

test.describe('manuscripts table default columns', () => {
  test.beforeEach(async ({ loginAs, testGroup }) => {
    await loginAs(testGroup.adminUsername)
  })

  test('submissions table shows the default submitter columns', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/dashboard/submissions')
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toEqual(DEFAULT_COLUMNS.submitter)
  })

  test('reviews table shows the default reviewer columns', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/dashboard/reviews')
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toEqual(DEFAULT_COLUMNS.reviewer)
  })

  test('edits table shows the default editor columns', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/dashboard/edits')
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toEqual(DEFAULT_COLUMNS.editor)
  })

  test('manuscripts table shows the default admin columns', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/admin/manuscripts')
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
    api,
    navigateTo,
  }) => {
    await navigateTo('/dashboard/reviews')
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toContain('reviewerStatusBadge')

    await api.updateGroupConfig({
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
    api,
    navigateTo,
  }) => {
    await navigateTo('/dashboard/edits')
    await expect(page.locator('.ant-table-thead')).toBeVisible()

    const before = await getHeaderTestIds(page)
    expect(before).toContain('statusCounts')
    expect(before).toContain('lastUpdated')

    await api.updateGroupConfig({
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
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const submitterUsername = testGroup.usernames[0]

    await api.createManuscripts({ amount: 15, submitter: submitterUsername })

    await loginAs(submitterUsername)

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await navigateTo('/dashboard/submissions')
    await expect(shortIdCells).toHaveCount(10)
    const pageOneIds = await shortIdCells.allTextContents()

    await navigateTo('/dashboard/submissions?pagenum=2')
    await expect(shortIdCells).toHaveCount(5)
    const pageTwoIds = await shortIdCells.allTextContents()

    // shortId is a global sequence, not scoped to this group, so check
    // uniqueness/count rather than specific values.
    const allIds = new Set([...pageOneIds, ...pageTwoIds])
    expect(allIds.size).toBe(15)

    await navigateTo('/dashboard/reviews')
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()

    await navigateTo('/dashboard/edits')
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()
  })

  test('reviewer sees only the manuscripts they were assigned to review', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const [authorUsername, reviewerUsername] = testGroup.usernames

    const { manuscriptIds } = await api.createManuscripts({
      amount: 5,
      submitter: authorUsername,
    })

    const reviewedManuscriptIds = manuscriptIds.slice(0, 3)

    await api.assignRole({
      username: reviewerUsername,
      role: 'reviewer',
      manuscriptIds: reviewedManuscriptIds,
    })

    await loginAs(reviewerUsername)

    await navigateTo('/dashboard/reviews')

    await expect(
      page.locator('.ant-table-tbody td[data-testid="shortId"]'),
    ).toHaveCount(3)

    await navigateTo('/dashboard/submissions')
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()

    await navigateTo('/dashboard/edits')
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()
  })

  test('editor sees manuscripts across all three editor roles they hold', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const [authorUsername, editorUsername] = testGroup.usernames

    const { manuscriptIds } = await api.createManuscripts({
      amount: 5,
      submitter: authorUsername,
    })

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
        api.assignRole({
          username: editorUsername,
          role,
          manuscriptIds: [manuscriptId],
        }),
      ),
    )

    await loginAs(editorUsername)

    await navigateTo('/dashboard/edits')
    await expect(
      page.locator('.ant-table-tbody td[data-testid="shortId"]'),
    ).toHaveCount(3)

    await navigateTo('/dashboard/submissions')
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()

    await navigateTo('/dashboard/reviews')
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()
  })

  test('admin, group admin and group manager all see manuscripts from every submitter', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    // No submitter - round-robins across the group's 5 generic users, so
    // these 3 manuscripts get 3 different submitters.
    await api.createManuscripts({ amount: 3 })

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    const usernames = [
      testGroup.adminUsername,
      testGroup.groupAdminUsername,
      testGroup.groupManagerUsername,
    ]

    for (const username of usernames) {
      // eslint-disable-next-line no-await-in-loop
      await loginAs(username)
      // eslint-disable-next-line no-await-in-loop
      await navigateTo('/admin/manuscripts')
      // eslint-disable-next-line no-await-in-loop
      await expect(shortIdCells).toHaveCount(3)
    }
  })
})

test.describe('manuscripts table data types', () => {
  test('single-select options column renders the selected option with its color', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const singleOptions = [
      { label: 'Alpha', value: 'alpha', labelColor: '#1d4ed8' },
      { label: 'Beta', value: 'beta', labelColor: '#b91c1c' },
    ]

    await api.updateFormFields({
      purpose: 'submit',
      category: 'submission',
      fields: [
        {
          name: 'submission.testSingleOption',
          title: 'Test Single Option',
          component: 'RadioGroup',
          options: singleOptions,
        },
      ],
    })

    await api.updateGroupConfig({
      manuscript: { tableColumns: 'shortId,submission.testSingleOption' },
    })

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { testSingleOption: 'beta' },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const singleCell = rows
      .first()
      .locator('td[data-testid="submission.testSingleOption"]')

    await expect(singleCell).toHaveText('Beta')
    await expect(singleCell.locator('span')).toHaveCSS(
      'background-color',
      hexToRgb('#b91c1c'),
    )
  })

  test('options column without a color falls back to the badge default color', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const uncoloredOptions = [
      { label: 'Alpha', value: 'alpha' },
      { label: 'Beta', value: 'beta' },
    ]

    await api.updateFormFields({
      purpose: 'submit',
      category: 'submission',
      fields: [
        {
          name: 'submission.testSingleOption',
          title: 'Test Single Option',
          component: 'RadioGroup',
          options: uncoloredOptions,
        },
      ],
    })

    await api.updateGroupConfig({
      manuscript: { tableColumns: 'shortId,submission.testSingleOption' },
    })

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { testSingleOption: 'beta' },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const singleCell = rows
      .first()
      .locator('td[data-testid="submission.testSingleOption"]')

    await expect(singleCell).toHaveText('Beta')

    await expect(singleCell.locator('span')).toHaveCSS(
      'background-color',
      hexToRgb(colorSecondary),
    )
  })

  test('multi-select options column renders every selected option with its color', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const multiOptions = [
      { label: 'Red Team', value: 'red', labelColor: '#dc2626' },
      { label: 'Blue Team', value: 'blue', labelColor: '#2563eb' },
      { label: 'Green Team', value: 'green', labelColor: '#16a34a' },
    ]

    await api.updateFormFields({
      purpose: 'submit',
      category: 'submission',
      fields: [
        {
          name: 'submission.testMultiOption',
          title: 'Test Multi Option',
          component: 'CheckboxGroup',
          options: multiOptions,
        },
      ],
    })

    await api.updateGroupConfig({
      manuscript: { tableColumns: 'shortId,submission.testMultiOption' },
    })

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { testMultiOption: ['red', 'blue'] },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const multiCell = rows
      .first()
      .locator('td[data-testid="submission.testMultiOption"]')

    const multiBadges = multiCell.locator('span')
    await expect(multiBadges).toHaveCount(2)
    await expect(multiCell).toContainText('Red Team')
    await expect(multiCell).toContainText('Blue Team')
    await expect(multiBadges.nth(0)).toHaveCSS(
      'background-color',
      hexToRgb('#dc2626'),
    )
    await expect(multiBadges.nth(1)).toHaveCSS(
      'background-color',
      hexToRgb('#2563eb'),
    )
  })

  test('editable options column renders as a select showing the current option and its color', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const statusOptions = [
      { label: 'Ready', value: 'ready', labelColor: '#059669' },
      { label: 'Blocked', value: 'blocked', labelColor: '#d97706' },
    ]

    // 'submission.$customStatus' is the only column the app will ever render
    // as editable (see useManuscriptsTable.tsx) - reusing it here to
    // exercise that rendering path.
    await api.updateFormFields({
      purpose: 'submit',
      category: 'submission',
      fields: [
        {
          name: 'submission.$customStatus',
          title: 'Test Custom Status',
          component: 'Select',
          options: statusOptions,
        },
      ],
    })

    await api.updateGroupConfig({
      manuscript: {
        tableColumns: 'shortId,submission.$customStatus',
        labelColumn: true,
      },
    })

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { $customStatus: 'ready' },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const statusSelect = rows
      .first()
      .locator(
        'td[data-testid="submission.$customStatus"] [data-testid="editable-option-select"]',
      )

    await expect(statusSelect).toContainText('Ready')
    await expect(statusSelect.locator('span').first()).toHaveCSS(
      'background-color',
      hexToRgb('#059669'),
    )

    // change the value
    await statusSelect.click()
    await page
      .getByTestId('editable-option')
      .filter({ hasText: 'Blocked' })
      .click()

    await expect(statusSelect).toContainText('Blocked')
    await expect(statusSelect.locator('span').first()).toHaveCSS(
      'background-color',
      hexToRgb('#d97706'),
    )

    // unset the value
    await statusSelect.locator('.ant-select-clear').click()

    await expect(statusSelect).not.toContainText('Blocked')
    await expect(statusSelect).not.toContainText('Ready')
  })

  test('person datatype column shows the submitter without an ORCID', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const submitterUsername = testGroup.usernames[0]

    // 'author' (admin's default columns already include it) resolves to
    // dataType 'person' unconditionally (see useManuscriptsTable.tsx) - no
    // form field or config change needed to exercise it.
    await api.createManuscripts({ amount: 1, submitter: submitterUsername })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const authorCell = rows.first().locator('td[data-testid="author"]')

    await expect(authorCell.getByTestId('person-name')).toHaveText(
      submitterUsername,
    )

    // This shared pw-* user has no linked ORCID, so that line shouldn't render
    await expect(authorCell).not.toContainText('ORCID')
  })

  test('person datatype column shows the submitter with an ORCID', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const submitterUsername = testGroup.userWithOrcidUsername

    await api.createManuscripts({ amount: 1, submitter: submitterUsername })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const authorCell = rows.first().locator('td[data-testid="author"]')

    await expect(authorCell.getByTestId('person-name')).toHaveText(
      submitterUsername,
    )

    await expect(authorCell).toContainText(`ORCID: ${testOrcid}`)
  })

  test('date column shows "today" for a manuscript created just now', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    await api.createManuscripts({ amount: 1 })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    await expect(rows.first().locator('td[data-testid="created"]')).toHaveText(
      'today',
    )
  })

  test('date column shows "yesterday" for a manuscript created a day ago', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.setManuscriptCreated({
      manuscriptId,
      created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    await expect(rows.first().locator('td[data-testid="created"]')).toHaveText(
      'yesterday',
    )
  })

  test('date column shows "N days ago" for a manuscript created a few days ago', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.setManuscriptCreated({
      manuscriptId,
      created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    await expect(rows.first().locator('td[data-testid="created"]')).toHaveText(
      '3 days ago',
    )
  })

  test('date column shows the absolute date for a manuscript older than a week', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    const created = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)

    await api.setManuscriptCreated({
      manuscriptId,
      created: created.toISOString(),
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    await expect(rows.first().locator('td[data-testid="created"]')).toHaveText(
      formatAbsoluteDate(created),
    )
  })
})
