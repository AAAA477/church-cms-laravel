import { chromium } from "playwright";
const SHOT = process.env.SHOT_DIR ?? ".";
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

// console
await page.goto("http://localhost:3000/console/login", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.fill("#email", "a4nsah@gmail.com");
await page.fill("#password", "AdminTest#2026");
await page.click("button[type=submit]");
await page.waitForURL(/\/console$/, { timeout: 20000 });
await page.waitForLoadState("networkidle");
const sidebar = await page.locator("aside").textContent();
console.log("console sidebar has church name:", sidebar.includes("PIWC North Updated") ? "YES" : "NO");
await page.screenshot({ path: `${SHOT}/branding-console.png` });

// settings page shows About section
await page.goto("http://localhost:3000/console/settings", { waitUntil: "networkidle" });
const body = await page.textContent("body");
console.log("settings has About section:", body.includes("Short Summary") && body.includes("Quote / Motto") ? "YES" : "NO");
console.log("settings email prefilled:", await page.inputValue("#email") ? "YES" : "NO");
console.log("settings address prefilled:", await page.inputValue("#address") ? "YES" : "NO");
await page.screenshot({ path: `${SHOT}/branding-settings.png`, fullPage: false });

// member portal
await page.goto("http://localhost:3000/member/login", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.fill("#email", "aaaansah@gmail.com");
await page.fill("#password", "MemberTest#2027");
await page.click("button[type=submit]");
await page.waitForURL(/\/member$/, { timeout: 20000 });
await page.waitForLoadState("networkidle");
const nav = await page.locator("nav").first().textContent();
console.log("member nav has church name:", nav.includes("PIWC North Updated") ? "YES" : "NO");
await page.screenshot({ path: `${SHOT}/branding-member.png` });

await browser.close();
