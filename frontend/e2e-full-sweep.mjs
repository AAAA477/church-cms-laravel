import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const results = [];

const consolePages = [
  "/console", "/console/members", "/console/guests", "/console/subadmins",
  "/console/groups", "/console/events", "/console/sermons", "/console/bulletins",
  "/console/gallery", "/console/mediafiles", "/console/quotes", "/console/prayer-board",
  "/console/helps", "/console/messages", "/console/donations", "/console/payaccounts",
  "/console/paymentgateways", "/console/funds", "/console/campaigns", "/console/emails",
  "/console/subscribers", "/console/mailing-lists", "/console/newsletter", "/console/rules",
  "/console/mails-delivered", "/console/mailqueues", "/console/smtps", "/console/webhooks",
  "/console/contacts", "/console/feedbacks", "/console/reports", "/console/activity-log",
  "/console/pages", "/console/posts", "/console/faq", "/console/widgets",
  "/console/pages/categories", "/console/posts/categories", "/console/google-analytics",
  "/console/settings", "/console/countries", "/console/states", "/console/cities",
  "/console/profile", "/console/prayer-board/categories",
];

const publicPages = [
  "/", "/blog", "/events", "/gallery", "/sermons", "/bulletins", "/faq",
  "/prayer-board", "/help-requests", "/pages", "/contact",
];

const memberPages = [
  "/member", "/member/groups", "/member/give", "/member/notifications",
  "/member/profile", "/member/id-card",
];

// Phrases that indicate a legitimate-but-empty list vs a crash.
const emptyMarkers = [/no .{0,30}(yet|right now|found|records)/i, /nothing .{0,20}here/i, /haven't/i];
const errorMarkers = [/something went wrong/i, /server error/i, /unhandled/i, /exception/i, /ECONNREFUSED/i];

async function audit(page, path, label) {
  try {
    const res = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });
    const status = res?.status() ?? 0;
    const body = (await page.textContent("body").catch(() => "")) ?? "";
    const rows = await page.locator("main table tbody tr, main tbody tr").count();
    const cards = await page.locator("main a[href], main li").count();
    const isError = status >= 400 || errorMarkers.some((m) => m.test(body));
    const isEmpty = emptyMarkers.some((m) => m.test(body));
    const verdict = isError ? "ERROR" : rows > 0 ? `OK rows=${rows}` : isEmpty ? "EMPTY-STATE" : cards > 3 ? "OK content" : "SPARSE";
    results.push(`${verdict.padEnd(14)} [${label}] ${path} (http ${status})`);
    if (isError) results.push(`    body: ${body.replace(/\s+/g, " ").slice(0, 160)}`);
  } catch (e) {
    results.push(`CRASH          [${label}] ${path}: ${String(e).slice(0, 120)}`);
  }
}

const browser = await chromium.launch({ channel: "msedge" });

// ── Console sweep (admin) ─────────────────────────────────────────────
const admin = await browser.newPage({ viewport: { width: 1500, height: 900 } });
await admin.goto(`${BASE}/console/login`, { waitUntil: "networkidle" });
await admin.waitForTimeout(1500);
await admin.fill("#email", "a4nsah@gmail.com");
await admin.fill("#password", "AdminTest#2026");
await admin.click("button[type=submit]");
await admin.waitForURL(/\/console$/, { timeout: 20000 });
for (const p of consolePages) await audit(admin, p, "console");

// ── Public sweep (fresh page, no auth) ────────────────────────────────
const pub = await browser.newPage();
for (const p of publicPages) await audit(pub, p, "public");

// ── Member sweep ──────────────────────────────────────────────────────
await pub.goto(`${BASE}/member/login`, { waitUntil: "networkidle" });
await pub.waitForTimeout(1500);
await pub.fill("#email", "aaaansah@gmail.com");
await pub.fill("#password", "MemberTest#2027");
await pub.click("button[type=submit]");
await pub.waitForURL(/\/member$/, { timeout: 20000 });
for (const p of memberPages) await audit(pub, p, "member");

await browser.close();
console.log(results.join("\n"));
