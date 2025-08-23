import { test, expect } from "@playwright/test";

test.describe("Staff Management", () => {
  test("can add a new staff member", async ({ page }) => {
    await page.goto("/");

    // Wait for app to load and sync
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Staff" })).toBeVisible();

    // Get initial staff count
    const initialStaffCount = await page
      .locator('[data-testid="staff-member"]')
      .count();

    // Enter edit mode by clicking the main edit toggle button
    const editToggleButton = page
      .getByRole("button", { name: "Enter edit mode" })
      .first();
    await expect(editToggleButton).toBeVisible();
    await editToggleButton.click();

    // Wait for edit mode to activate - the add user button should become visible
    const addUserButton = page.getByRole("button", { name: "Add user" });
    await expect(addUserButton).toBeVisible({ timeout: 5000 });

    // Click the add user button
    await addUserButton.click();

    // Verify a new staff member was added
    await expect(page.locator('[data-testid="staff-member"]')).toHaveCount(
      initialStaffCount + 1
    );

    // Verify the new staff member has a default name pattern
    const staffMembers = page.locator('[data-testid="staff-member"]');
    const firstStaffMember = staffMembers.first(); // New members are added at the top
    await expect(firstStaffMember).toContainText(/New User \d+/);

    // Test completed successfully - new staff member was added with correct name
  });

  test("can edit staff member name", async ({ page }) => {
    await page.goto("/");

    // Wait for app to load
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Staff" })).toBeVisible();

    // Enter edit mode
    const editToggleButton = page
      .getByRole("button", { name: "Enter edit mode" })
      .first();
    await editToggleButton.click();

    // Wait for edit mode controls
    await expect(page.getByRole("button", { name: "Add user" })).toBeVisible();

    // Find the first staff member and click its edit button (pencil icon within the staff member)
    const firstStaffMember = page
      .locator('[data-testid="staff-member"]')
      .first();
    const staffEditButton = firstStaffMember
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first();
    await staffEditButton.click();

    // Find the input field and change the name
    const nameInput = firstStaffMember.getByRole("textbox");
    await expect(nameInput).toBeVisible();

    await nameInput.clear();
    await nameInput.fill("Test Staff Member");
    await nameInput.press("Enter");

    // Verify the name was updated
    await expect(firstStaffMember).toContainText("Test Staff Member");

    // Exit edit mode
    await editToggleButton.click();
  });

  test("staff list shows default workers on first load", async ({ page }) => {
    await page.goto("/");

    // Wait for app to load
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Staff" })).toBeVisible();

    // Should have default workers loaded
    const staffMembers = page.locator('[data-testid="staff-member"]');
    const staffCount = await staffMembers.count();
    expect(staffCount).toBeGreaterThan(0);

    // Check that some default names are present
    await expect(page.locator("text=John Doe")).toBeVisible();
    await expect(page.locator("text=Jane Smith")).toBeVisible();
  });
});
