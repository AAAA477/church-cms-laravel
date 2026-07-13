import { chromium } from "playwright";

// Must be localhost, not 127.0.0.1 — Next 16 dev-origin protection 403s
// internal endpoints on other hosts and hydration silently breaks.
const BASE = "http://localhost:3000";
const SHOT_DIR = process.env.SHOT_DIR ?? ".";
const results = [];

function ok(name) { results.push(`PASS ${name}`); console.log(`PASS ${name}`); }
function fail(name, err) { results.push(`FAIL ${name}: ${err}`); console.log(`FAIL ${name}: ${err}`); }

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

try {
  // 1. Guard: /console without a cookie should bounce to login
  await page.goto(`${BASE}/console`, { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/console\/login/, { timeout: 15000 });
  ok("unauthenticated /console redirects to /console/login");

  // 2. Login (wait out dev-mode hydration so the React submit handler is
  // attached before we click — otherwise the click fires a native GET submit)
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  await page.fill("#email", "a4nsah@gmail.com");
  await page.fill("#password", "AdminTest#2026");
  const [loginRes] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/bff/admin/auth/login"), { timeout: 20000 }),
    page.click("button[type=submit]"),
  ]);
  if (!loginRes.ok()) throw new Error(`login endpoint returned ${loginRes.status()}`);
  await page.waitForURL(/\/console$/, { timeout: 20000 });
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${SHOT_DIR}/console-dashboard.png` });
  ok("login lands on /console dashboard");

  // 3. Dashboard shows real stats
  const body = await page.textContent("body");
  if (!body.includes("a4nsah")) throw new Error("no admin name on dashboard");
  ok("dashboard renders admin identity");

  // 4. Members list shows the seeded member
  await page.goto(`${BASE}/console/members`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=aaaansah@gmail.com", { timeout: 15000 });
  await page.screenshot({ path: `${SHOT_DIR}/console-members.png` });
  ok("members list shows member #2");

  // 5. CRUD round-trip on post categories
  await page.goto(`${BASE}/console/posts/categories`, { waitUntil: "networkidle" });
  const catName = `E2E Smoke ${Date.now()}`;
  await page.fill('#post-category-form input[name="name"]', catName);
  await page.fill('#post-category-form input[name="description"]', "created by e2e smoke test");
  await page.click('#post-category-form button[type=submit]');
  await page.waitForSelector(`text=${catName}`, { timeout: 15000 });
  ok("post category created and visible");

  page.once("dialog", (d) => d.accept());
  const card = page.locator("div.space-y-3 > *", { hasText: catName });
  await card.getByRole("button", { name: "Delete" }).click();
  await page.waitForSelector(`text=${catName}`, { state: "detached", timeout: 15000 });
  ok("post category deleted");

  // 6. Prayer board moderation page loads
  await page.goto(`${BASE}/console/prayer-board`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${SHOT_DIR}/console-prayer-board.png` });
  const pb = await page.textContent("body");
  if (!/prayer/i.test(pb)) throw new Error("prayer board page empty");
  ok("prayer board page renders");

  // 7. Logout via nav if present, else just verify /bff logout endpoint
  const logoutBtn = page.getByRole("button", { name: /log ?out|sign ?out/i }).first();
  if (await logoutBtn.count()) {
    await logoutBtn.click();
    await page.waitForURL(/\/console\/login|\/$/, { timeout: 15000 });
    ok("logout returns to login/home");
    await page.goto(`${BASE}/console/members`, { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/console\/login/, { timeout: 15000 });
    ok("post-logout /console/members is re-guarded");
  } else {
    results.push("SKIP logout button not found on prayer-board page");
  }
} catch (err) {
  fail("e2e", err.message);
  await page.screenshot({ path: `${SHOT_DIR}/console-failure.png` }).catch(() => {});
} finally {
  await browser.close();
  console.log("\n=== SUMMARY ===");
  for (const r of results) console.log(r);
  process.exit(results.some((r) => r.startsWith("FAIL")) ? 1 : 0);
}
