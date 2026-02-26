import { test, expect } from '@playwright/test'

test('page has correct title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/RustRocket/)
})

test('page heading is visible', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /RustRocket/ })).toBeVisible()
})

test('renders a task list state after load', async ({ page }) => {
  await page.goto('/')
  // Backend may not be running in CI — accept either the empty state or the error state
  await expect(
    page.getByText(/No tasks yet|Could not reach the API/)
  ).toBeVisible({ timeout: 10_000 })
})
