import { chromium } from "playwright";
const SHOT = process.env.SHOT_DIR ?? ".";
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
await page.goto("http://localhost:3000/console/login", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.fill("#email", "a4nsah@gmail.com");
await page.fill("#password", "AdminTest#2026");
await page.click("button[type=submit]");
await page.waitForURL(/\/console$/, { timeout: 20000 });
await page.goto("http://localhost:3000/console/settings", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const tabs = await page.locator("[role=tab]").allTextContents();
console.log("tabs:", tabs.join(" | "));
// General visible, Contact hidden initially
console.log("General field visible:", await page.locator("#church_full_name").isVisible());
console.log("Contact field hidden:", !(await page.locator("#phone").isVisible()));
// switch to Privacy, toggle on, save
await page.getByRole("tab", { name: "Privacy" }).click();
console.log("privacy checkbox visible:", await page.locator("input[name=hide_birth_year]").isVisible());
await page.screenshot({ path: `${SHOT}/settings-tabs-privacy.png` });
await page.getByRole("tab", { name: "General" }).click();
await page.screenshot({ path: `${SHOT}/settings-tabs-general.png` });
// save from a tab — all fields should persist
await page.click("button[type=submit]");
await page.waitForSelector("text=Settings saved", { timeout: 15000 });
console.log("save from tabbed form: OK");
await browser.close();
