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

await page.goto(BASE + "/console/subadmins/29", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
console.log("BEFORE badge:", await page.locator("h1 ~ span").first().textContent());
await page.screenshot({ path: "debug-before.png" });

await page.click('button:has-text("Make Admin")');
await page.waitForTimeout(4000);
console.log("AFTER url:", page.url());
console.log("AFTER badge:", await page.locator("h1 ~ span").first().textContent().catch(() => "NOT FOUND"));
console.log("AFTER buttons:", await page.$$eval("button", (bs) => bs.map((b) => b.textContent.trim())));
await page.screenshot({ path: "debug-after.png" });

const r = await page.evaluate(async () => {
  const res = await fetch("/bff/admin/subadmins/29");
  return res.json();
});
console.log("API role after click:", r.role);

await browser.close();
