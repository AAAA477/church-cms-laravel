import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage();
for (let attempt = 1; attempt <= 5; attempt++) {
  await page.goto("http://localhost:3000/member", { waitUntil: "networkidle" });
  const nav = await page.locator("nav").first().textContent().catch(() => "");
  const ok = nav.includes("PIWC North Updated");
  console.log(`attempt ${attempt}:`, ok ? "YES" : "no");
  if (ok) break;
  await page.waitForTimeout(20000);
}
await browser.close();
