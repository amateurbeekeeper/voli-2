import { test, expect } from "@playwright/test";

test.describe("App", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CoreWebApp/i);
  });

  test("renders the app", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /core web app/i })).toBeVisible();
  });

  test("counter increments when clicked", async ({ page }) => {
    await page.goto("/");
    const plusButton = page.getByRole("button", { name: "+" });
    const count = page.getByText("0").first();
    await expect(count).toBeVisible();
    await plusButton.click();
    await expect(page.getByText("1")).toBeVisible();
    await plusButton.click();
    await expect(page.getByText("2")).toBeVisible();
  });
});
