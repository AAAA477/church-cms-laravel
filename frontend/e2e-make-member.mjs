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

await page.goto("http://localhost:3000/console/guests", { waitUntil: "networkidle" });
const before = await page.textContent("main");
console.log("Testy in guests before:", before.includes("Testy") ? "YES" : "NO");
await page.screenshot({ path: `${SHOT}/guests-with-button.png` });

// convert Testy
const row = page.locator("tr", { hasText: "Testy" });
page.once("dialog", (d) => d.accept());
await row.getByRole("button", { name: "Make Member" }).click();
await page.waitForTimeout(3000);
await page.goto("http://localhost:3000/console/guests", { waitUntil: "networkidle" });
const after = await page.textContent("main");
console.log("Testy in guests after:", after.includes("Testy") ? "STILL THERE" : "gone (correct)");

await page.goto("http://localhost:3000/console/members", { waitUntil: "networkidle" });
const members = await page.textContent("main");
console.log("Testy in members now:", members.includes("Testy") ? "YES" : "NO");
await page.screenshot({ path: `${SHOT}/members-after-convert.png` });
await browser.close();
