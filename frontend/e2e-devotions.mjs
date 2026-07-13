// E2E: Blog->Devotions rename, daily featured devotion, scheduling flow.
import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1360, height: 950 } });
const out = [];

// redirects
for (const p of ["/blog", "/posts"]) {
  const res = await page.request.get(BASE + p, { maxRedirects: 0 });
  out.push([`${p} ->`, `${res.status()} ${res.headers()["location"] ?? ""}`]);
}

// devotions page + featured block
await page.goto(BASE + "/devotions", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
out.push(["h1", (await page.locator("h1").first().textContent()).trim()]);
out.push(["featured label", (await page.locator("text=/Today's Devotion|Latest Devotion/").first().textContent().catch(() => "NONE"))]);
out.push(["nav", (await page.$$eval("nav .hidden a", (as) => as.map((a) => a.textContent.trim()))).join(", ")]);

// detail page: comments + likes present
await page.click('a:has-text("Read Devotion")');
await page.waitForURL("**/devotions/**", { timeout: 15000 });
await page.waitForTimeout(1500);
out.push(["detail url", page.url()]);
out.push(["comment form", await page.locator("form textarea").first().isVisible().catch(() => false)]);
out.push(["like button", await page.locator('button:has-text("Like"), button[aria-label*="ike"]').first().isVisible().catch(() => false)]);
await page.screenshot({ path: "devotions-detail.png" });

// console: schedule a devotion 1 minute out
await page.goto(BASE + "/console/login", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.fill('input[type="email"]', "a4nsah@gmail.com");
await page.fill('input[type="password"]', "AdminTest#2026");
await page.click('button[type="submit"]');
await page.waitForURL((u) => u.pathname === "/console", { timeout: 30000 });
await page.goto(BASE + "/console/posts/new", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await page.fill("#title", "Scheduled Devotion Test");
await page.fill("#description", "This devotion was scheduled one minute ahead to test automatic publishing.");
await page.click('label:has-text("Schedule for later") input');
const dt = new Date(Date.now() + 60000);
const pad = (n) => String(n).padStart(2, "0");
await page.fill("#posted_at", `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
await page.screenshot({ path: "devotion-schedule-form.png" });
await page.click('button:has-text("Schedule")');
await page.waitForURL("**/console/posts/**", { timeout: 20000 });
out.push(["scheduled post created at", page.url()]);

await browser.close();
for (const [k, v] of out) console.log(`${k}: ${v}`);
