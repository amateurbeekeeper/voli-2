import { test, expect } from "@playwright/test";

test.describe("App", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/voli-2/i);
  });

  test("renders the app", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /vite \+ react/i })).toBeVisible();
  });

  test("counter increments when clicked", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: /count is \d+/ });
    await expect(button).toHaveText("count is 0");
    await button.click();
    await expect(button).toHaveText("count is 1");
    await button.click();
    await expect(button).toHaveText("count is 2");
  });
});
