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
const nav = await page.locator("nav").first().textContent();
console.log("public links in member nav:", ["Home", "Blog", "Sermons", "Contact"].every((l) => nav.includes(l)) ? "YES" : "NO");
console.log("church name in nav:", nav.includes("PIWC North Updated") ? "YES" : "NO");
// open avatar dropdown
await page.locator("nav button[aria-haspopup=menu]").click();
await page.waitForSelector("text=Change Password", { timeout: 5000 });
const menu = await page.locator("[role=menu]").textContent();
console.log("dropdown has member links:", ["Dashboard", "My Profile", "My Groups", "Sign Out"].every((l) => menu.includes(l)) ? "YES" : "NO");
await page.screenshot({ path: `${SHOT}/member-legacy-chrome.png` });
// footer present
console.log("footer present:", (await page.locator("footer").count()) > 0 ? "YES" : "NO");
await browser.close();
