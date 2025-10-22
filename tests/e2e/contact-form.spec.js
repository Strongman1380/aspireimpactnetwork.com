import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact.html');
  });

  test('should display contact form', async ({ page }) => {
    const form = page.locator('form#contact-form');
    await expect(form).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check for HTML5 validation
    const firstNameInput = page.locator('input[name="first_name"]');
    const isInvalid = await firstNameInput.evaluate(
      (el) => !el.validity.valid
    );
    expect(isInvalid).toBeTruthy();
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid-email');
    await emailInput.blur();

    const isInvalid = await emailInput.evaluate(
      (el) => !el.validity.valid
    );
    expect(isInvalid).toBeTruthy();
  });

  test('should submit form successfully', async ({ page }) => {
    // Fill out form
    await page.fill('input[name="first_name"]', 'John');
    await page.fill('input[name="last_name"]', 'Doe');
    await page.fill('input[type="email"]', 'john.doe@example.com');
    await page.fill('input[type="tel"]', '402-555-1234');
    await page.fill('textarea[name="message"]', 'Test message');
    await page.check('input[name="privacy_consent"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message
    const successMessage = page.locator('.success-message');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('should handle rate limiting', async ({ page }) => {
    // Fill and submit form multiple times rapidly
    for (let i = 0; i < 6; i++) {
      await page.fill('input[name="first_name"]', `User${i}`);
      await page.fill('input[name="last_name"]', 'Test');
      await page.fill('input[type="email"]', `user${i}@example.com`);
      await page.check('input[name="privacy_consent"]');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(100);
    }

    // Should show rate limit error
    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).toContainText(/too many attempts/i);
  });

  test('should auto-save form data', async ({ page }) => {
    // Fill out partial form
    await page.fill('input[name="first_name"]', 'Jane');
    await page.fill('input[name="last_name"]', 'Smith');
    await page.fill('input[type="email"]', 'jane@example.com');

    // Wait for auto-save
    await page.waitForTimeout(1000);

    // Reload page
    await page.reload();

    // Check if data was restored
    const firstName = await page.inputValue('input[name="first_name"]');
    expect(firstName).toBe('Jane');
  });
});
