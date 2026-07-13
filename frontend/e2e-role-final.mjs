// Final targeted check: subadmin -> admin promotion via the real UI, with
// generous waits for dev-mode hydration after a client-side navigation.
import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1360, height: 1000 } });
page.on("dialog", (d) => d.accept());

await page.goto(BASE + "/console/login", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await page.fill('input[type="email"]', "a4nsah@gmail.com");
await page.fill('input[type="password"]', "AdminTest#2026");
await page.click('button[type="submit"]');
await page.waitForURL((u) => u.pathname === "/console", { timeout: 30000 });

// Navigate via the list + row click (client-side transition), like a real user.
await page.goto(BASE + "/console/subadmins?search=Roletest", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await page.click('tbody tr:has-text("Roletest") a');
await page.waitForURL("**/console/subadmins/**", { timeout: 20000 });
await page.waitForTimeout(2500);
console.log("before badge:", await page.locator("h1 ~ span").first().textContent());
console.log("permissions before:", await page.locator('h2:has-text("Permissions")').isVisible());

const respPromise = page.waitForResponse((r) => r.url().includes("/bff/admin/members/") && r.url().endsWith("/role"));
await page.click('button:has-text("Make Admin")');
const resp = await respPromise;
console.log("role POST status:", resp.status(), await resp.json().catch(() => "?"));
await page.waitForTimeout(5000);
console.log("after badge:", await page.locator("h1 ~ span").first().textContent());
console.log("permissions after:", await page.locator('h2:has-text("Permissions")').isVisible().catch(() => false));
console.log("current URL:", page.url());

// Clean up: revert back to member.
await page.click('button:has-text("Revert to Member")');
await page.waitForTimeout(4000);
await page.goto(BASE + "/console/members?search=Roletest", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
console.log("back in members:", await page.locator('tbody tr:has-text("Roletest")').count());

await browser.close();
