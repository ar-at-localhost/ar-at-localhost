import { randEmail, randFirstName, randLastName, randText } from "@ngneat/falso";
import { test } from "@playwright/test";

test("it should submit", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("contact-form").waitFor();
  await page.locator("form [name=firstName]").fill(randFirstName());
  await page.locator("form [name=lastName]").fill(randLastName());
  await page.locator("form [name=email]").fill(randEmail());
  await page.locator("form [name=message]").fill(randText({ charCount: 128 }));
  await page.locator("button[type=submit]").click();
  await page.getByTestId("brief-submit-success").waitFor();
});
