import { chromium } from "playwright";
const SHOT = process.env.SHOT_DIR ?? ".";
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
// settings UI shows the rows
await page.goto("http://localhost:3000/console/login", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.fill("#email", "a4nsah@gmail.com");
await page.fill("#password", "AdminTest#2026");
await page.click("button[type=submit]");
await page.waitForURL(/\/console$/, { timeout: 20000 });
await page.goto("http://localhost:3000/console/settings", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page.getByRole("tab", { name: "Social Media" }).click();
const yt = await page.locator('input[value="YouTube"]').count();
console.log("settings shows saved YouTube row:", yt > 0 ? "YES" : "NO");
await page.screenshot({ path: `${SHOT}/settings-social-links.png` });
// footer shows the links (fresh page, cache may lag - check icon titles)
const p2 = await browser.newPage();
await p2.goto("http://localhost:3000/faq", { waitUntil: "networkidle" });
const titles = await p2.$$eval("footer a[title]", (els) => els.map((e) => e.title));
console.log("footer social titles:", titles.join(", ") || "(cache may still hold old data)");
await browser.close();
