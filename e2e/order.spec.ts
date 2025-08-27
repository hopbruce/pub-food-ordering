import { test, expect } from "@playwright/test";

test("happy path order", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("button", { name: /add/i }).first().click();
  await page.getByRole("link", { name: /view basket/i }).click();
  await page.getByLabel(/table number/i).fill("12");
  await page.getByRole("button", { name: /place order/i }).click();
  await expect(page.getByText(/order confirmed/i)).toBeVisible();
  await expect(page.getByText(/order id/i)).toBeVisible();
});
