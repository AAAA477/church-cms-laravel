// Verify one-click role promotion directly from the Members and
// Subadmins list tables (no need to open the detail page first).
import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
page.on("dialog", (d) => d.accept());

await page.goto(BASE + "/console/login", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await page.fill('input[type="email"]', "a4nsah@gmail.com");
await page.fill('input[type="password"]', "AdminTest#2026");
await page.click('button[type="submit"]');
await page.waitForURL((u) => u.pathname === "/console", { timeout: 30000 });

await page.goto(BASE + "/console/members?search=Roletest", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
console.log("Role column header:", await page.locator("th:has-text('Role')").isVisible().catch(() => false));
console.log("Make Subadmin button in row:", await page.locator('tbody tr:has-text("Roletest") button:has-text("Make Subadmin")').isVisible().catch(() => false));
console.log("Make Admin button in row:", await page.locator('tbody tr:has-text("Roletest") button:has-text("Make Admin")').isVisible().catch(() => false));
await page.screenshot({ path: "inline-role-members.png" });

const nav = page.waitForURL("**/console/subadmins**", { timeout: 20000 });
await page.click('tbody tr:has-text("Roletest") button:has-text("Make Subadmin")');
await nav;
await page.waitForTimeout(2000);
console.log("landed on:", page.url());
console.log("appears in subadmins list:", await page.locator('tbody tr:has-text("Roletest")').count());
await page.screenshot({ path: "inline-role-subadmins.png" });

// Toggle to admin, then revert to member — all from the list, no detail page.
let loadPromise = page.waitForEvent("load", { timeout: 15000 });
await page.click('tbody tr:has-text("Roletest") button:has-text("Make Admin")');
await loadPromise;
await page.waitForTimeout(1500);
console.log("badge after list-based Make Admin:", await page.locator('tbody tr:has-text("Roletest") span').first().textContent().catch(() => "?"));

loadPromise = page.waitForEvent("load", { timeout: 15000 });
await page.click('tbody tr:has-text("Roletest") button:has-text("Revert to Member")');
await loadPromise;
await page.waitForTimeout(1500);
console.log("gone from staff list:", (await page.locator('tbody tr:has-text("Roletest")').count()) === 0);

await page.goto(BASE + "/console/members?search=Roletest", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
console.log("back in members:", (await page.locator('tbody tr:has-text("Roletest")').count()) >= 1);

// Confirm the admin's own row never shows self-action buttons.
await page.goto(BASE + "/console/subadmins", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const selfRow = page.locator('tbody tr:has-text("a4nsah@gmail.com")');
console.log("self row has no role buttons:", !(await selfRow.locator("button").isVisible().catch(() => false)));

await browser.close();
