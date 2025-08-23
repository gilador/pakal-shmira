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

  test("can add 2 users and edit both names to John Doe", async ({ page }) => {
    await page.goto("/");

    // Wait for app to load
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Staff" })).toBeVisible();

    // Get initial staff count
    const initialStaffCount = await page
      .locator('[data-testid="staff-member"]')
      .count();

    // Enter edit mode
    const editToggleButton = page
      .getByRole("button", { name: "Enter edit mode" })
      .first();
    await expect(editToggleButton).toBeVisible();
    await editToggleButton.click();

    // Wait for edit mode to activate
    const addUserButton = page.getByRole("button", { name: "Add user" });
    await expect(addUserButton).toBeVisible({ timeout: 5000 });

    // Add first user
    await addUserButton.click();

    // Add second user
    await addUserButton.click();

    // Verify 2 new staff members were added
    await expect(page.locator('[data-testid="staff-member"]')).toHaveCount(
      initialStaffCount + 2
    );

    // Get the first two staff members (new members are added at the top)
    const staffMembers = page.locator('[data-testid="staff-member"]');
    const firstNewUser = staffMembers.nth(0);
    const secondNewUser = staffMembers.nth(1);

    // Verify the new staff members have default name pattern
    await expect(firstNewUser).toContainText(/New User \d+/);
    await expect(secondNewUser).toContainText(/New User \d+/);

    // Edit first user's name to "John Doe"
    const firstUserEditButton = firstNewUser
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first();
    await firstUserEditButton.click();

    const firstUserNameInput = firstNewUser.getByRole("textbox");
    await expect(firstUserNameInput).toBeVisible();
    await firstUserNameInput.clear();
    await firstUserNameInput.fill("John Doe");
    await firstUserNameInput.press("Enter");

    // Wait for first user name to be updated
    await expect(firstNewUser).toContainText("John Doe");

    // Edit second user's name to "John Doe"
    const secondUserEditButton = secondNewUser
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first();
    await secondUserEditButton.click();

    const secondUserNameInput = secondNewUser.getByRole("textbox");
    await expect(secondUserNameInput).toBeVisible();
    await secondUserNameInput.clear();
    await secondUserNameInput.fill("John Doe");
    await secondUserNameInput.press("Enter");

    // Wait for second user name to be updated
    await expect(secondNewUser).toContainText("John Doe");

    // Verify both users now have the name "John Doe"
    await expect(firstNewUser).toContainText("John Doe");
    await expect(secondNewUser).toContainText("John Doe");

    // Count how many "John Doe" staff members exist (should be at least 3: original + 2 new)
    const johnDoeStaffMembers = page.locator(
      '[data-testid="staff-member"]:has-text("John Doe")'
    );
    const johnDoeCount = await johnDoeStaffMembers.count();
    expect(johnDoeCount).toBeGreaterThanOrEqual(3);

    // Exit edit mode
    await editToggleButton.click();
  });
});
