import { chromium } from "playwright";
const SHOT = process.env.SHOT_DIR ?? ".";
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
console.log("title:", await page.title());
const icon = await page.locator('link[rel~="icon"]').first().getAttribute("href").catch(() => null);
console.log("favicon link:", icon);
const logoImg = await page.locator("nav img[alt*='logo']").first().getAttribute("src").catch(() => null);
console.log("navbar logo img:", logoImg ? logoImg.slice(0, 70) : "none (monogram)");
const nav = await page.locator("nav").first().textContent();
console.log("nav shows name without Updated:", nav.includes("PIWC North") && !nav.includes("Updated") ? "YES" : "NO");
await page.screenshot({ path: `${SHOT}/branding-public-final.png` });

// console sidebar
await page.goto("http://localhost:3000/console/login", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.fill("#email", "a4nsah@gmail.com");
await page.fill("#password", "AdminTest#2026");
await page.click("button[type=submit]");
await page.waitForURL(/\/console$/, { timeout: 20000 });
await page.waitForLoadState("networkidle");
const sideLogo = await page.locator("aside img[alt*='logo']").first().getAttribute("src").catch(() => null);
console.log("console sidebar logo:", sideLogo ? "YES" : "no (monogram)");
const side = await page.locator("aside").textContent();
console.log("console name w/o Updated:", side.includes("PIWC North") && !side.includes("Updated") ? "YES" : "NO");
await page.screenshot({ path: `${SHOT}/branding-console-final.png` });
await browser.close();
