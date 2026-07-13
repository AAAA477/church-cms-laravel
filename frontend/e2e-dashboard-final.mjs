import { chromium } from "playwright";
const SHOT = process.env.SHOT_DIR ?? ".";
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
await page.goto("http://localhost:3000/member/login", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await page.fill("#email", "aaaansah@gmail.com");
await page.fill("#password", "MemberTest#2027");
await page.click("button[type=submit]");
await page.waitForURL(/\/member$/, { timeout: 30000 });
await page.waitForLoadState("networkidle");
const body = await page.textContent("body");
console.log("upcoming events on dashboard:", body.includes("Sunday Worship Service") ? "YES" : "NO");
await page.screenshot({ path: `${SHOT}/dashboard-populated.png` });
// console members list
await page.goto("http://localhost:3000/console/members", { waitUntil: "networkidle" }).catch(() => {});
await browser.close();
