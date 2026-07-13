// E2E: nav restructure (Resources rename, Prayer/Help folded into Contact,
// FAQ+Gallery removed), custom theme colors, and instant recolor after save.
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1360, height: 950 } });
const out = [];

// --- Public: nav contents ---
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
const navLabels = await page.$$eval("nav .hidden a", (as) => as.map((a) => a.textContent.trim()));
out.push(["nav links", navLabels.join(", ")]);

// --- Removed pages 404 ---
for (const p of ["/faq", "/gallery"]) {
  const r = await page.goto(BASE + p, { waitUntil: "domcontentloaded" });
  out.push([`${p} status`, r.status()]);
}

// --- Resources rename ---
await page.goto(BASE + "/bulletins", { waitUntil: "networkidle" });
out.push(["/bulletins h1", (await page.locator("h1").first().textContent()).trim()]);

// --- Contact tabs ---
await page.goto(BASE + "/contact", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const tabs = await page.$$eval('[role="tab"]', (ts) => ts.map((t) => t.textContent.trim()));
out.push(["contact tabs", tabs.join(", ")]);
await page.click('[role="tab"]:has-text("Prayer Request")');
out.push(["prayer form visible", await page.locator('form textarea[name="text"], form select[name="category_id"]').first().isVisible().catch(() => false)]);
out.push(["prayer board link", await page.locator('a[href="/prayer-board"]:has-text("Prayer Board")').first().isVisible()]);
await page.click('[role="tab"]:has-text("Help Request")');
out.push(["help form visible", await page.locator("form").nth(2).isVisible()]);

// --- Console: custom colors + instant recolor ---
await page.goto(BASE + "/console/login", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.fill('input[type="email"]', "a4nsah@gmail.com");
await page.fill('input[type="password"]', "AdminTest#2026");
await page.click('button[type="submit"]');
await page.waitForURL((u) => u.pathname === "/console", { timeout: 30000 });
await page.goto(BASE + "/console/settings", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

const before = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim());
out.push(["console primary before", before]);

await page.click('button[role="tab"]:has-text("Appearance")');
await page.click('button:has-text("Custom…")');
// Teal primary, amber accent — dark enough for white text.
await page.fill("#custom_primary", "#0f766e");
await page.fill("#custom_accent", "#d4a373");
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);

const after = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim());
out.push(["console primary after save (no reload)", after]);
await page.screenshot({ path: "custom-console.png" });

// --- Public site shows custom color ---
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
out.push(["public primary", await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim())]);
await page.screenshot({ path: "custom-home.png" });

// --- Reset to Warm Earth ---
await page.goto(BASE + "/console/settings", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.click('button[role="tab"]:has-text("Appearance")');
await page.click('button:has-text("Warm Earth")');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
out.push(["console primary after reset", await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim())]);

await browser.close();
for (const [k, v] of out) console.log(`${k}: ${v}`);
