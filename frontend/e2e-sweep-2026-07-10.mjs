// Full loose-ends sweep after the 2026-07-09/10 restructure:
// crawls every internal link from the public site, then walks the member
// portal and admin console signed in. Reports non-200s, page errors,
// broken images, and stale-path links (/blog, /faq, /gallery, /bulletins…).
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const STALE = [/^\/blog(\/|$)/, /^\/faq(\/|$)/, /^\/gallery(\/|$)/, /^\/bulletins(\/|$)/, /^\/sermons$/, /^\/posts(\/|$)/, /^\/help-requests(\/|$)/, /^\/prayer-requests(\/|$)/];

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1360, height: 950 } });
const problems = [];
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 200)));

async function visit(url, label = "") {
  pageErrors.length = 0;
  let res;
  try {
    res = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  } catch (e) {
    problems.push(`${label || url}: navigation failed — ${String(e).slice(0, 120)}`);
    return null;
  }
  const status = res?.status() ?? 0;
  if (status >= 400) problems.push(`${label || url}: HTTP ${status}`);
  await page.waitForTimeout(800);
  const broken = await page.$$eval("img", (im) => im.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute("src"))).catch(() => []);
  for (const b of broken) problems.push(`${label || url}: broken image ${b}`);
  for (const e of pageErrors) problems.push(`${label || url}: page error ${e}`);
  return status;
}

function collectHrefs() {
  return page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
}

// ---------- Public crawl ----------
const seen = new Set();
const queue = ["/"];
let crawled = 0;
while (queue.length > 0 && crawled < 40) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  crawled++;
  const status = await visit(BASE + path, `public ${path}`);
  if (status === null) continue;
  const hrefs = await collectHrefs().catch(() => []);
  for (let h of hrefs) {
    if (!h || h.startsWith("http") || h.startsWith("mailto:") || h.startsWith("tel:") || h.startsWith("#")) continue;
    h = h.split("#")[0].split("?")[0];
    if (!h) continue;
    for (const re of STALE) {
      if (re.test(h)) problems.push(`stale link on ${path}: ${h}`);
    }
    if (h.startsWith("/member") || h.startsWith("/console")) continue; // authed sections below
    if (!seen.has(h)) queue.push(h);
  }
}
console.log(`public pages crawled: ${crawled}`);

// ---------- Member flow ----------
await visit(BASE + "/member/login", "member login page");
await page.waitForTimeout(1500);
await page.fill('input[type="email"]', "aaaansah@gmail.com");
await page.fill('input[type="password"]', "MemberTest#2027");
await page.click('button[type="submit"]');
await page.waitForURL((u) => u.pathname.startsWith("/member") && !u.pathname.includes("login"), { timeout: 30000 }).catch(() => problems.push("member login: did not reach portal"));
for (const p of ["/member", "/member/profile", "/member/groups", "/member/give", "/member/id-card", "/member/notifications"]) {
  await visit(BASE + p, `member ${p}`);
}
// comment form appears for signed-in member on a devotion
await visit(BASE + "/devotions/1", "devotion signed-in");
const hasCommentForm = await page.locator("form textarea").first().isVisible().catch(() => false);
if (!hasCommentForm) problems.push("devotion detail: comment form missing for signed-in member");
await page.context().clearCookies();

// ---------- Console flow ----------
await visit(BASE + "/console/login", "console login page");
await page.waitForTimeout(2000);
await page.fill('input[type="email"]', "a4nsah@gmail.com");
await page.fill('input[type="password"]', "AdminTest#2026");
await page.click('button[type="submit"]');
await page.waitForURL((u) => u.pathname === "/console", { timeout: 30000 }).catch(() => problems.push("console login failed"));
await page.waitForTimeout(1000);
const consoleLinks = await page.$$eval('aside a[href^="/console"], nav a[href^="/console"]', (as) => [...new Set(as.map((a) => a.getAttribute("href")))]).catch(() => []);
console.log(`console sidebar links: ${consoleLinks.length}`);
for (const p of consoleLinks) {
  await visit(BASE + p, `console ${p}`);
}

await browser.close();
console.log(`\n==== ${problems.length} problem(s) ====`);
for (const p of problems) console.log("  - " + p);
