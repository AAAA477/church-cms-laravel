import { chromium } from "playwright";

const BASE = "http://localhost:3000";
// [path, string that must appear if the page correctly shows DB data]
const checks = [
  ["/console", "Members", "console"],
  ["/console/posts", "Welcome to Our New Website", "console"],
  ["/console/quotes", "Lorem", "console"],
  ["/console/funds", "cash", "console"],
  ["/console/payaccounts", "cash", "console"],
  ["/console/paymentgateways", "tripe", "console"],
  ["/console/subscribers", "ama.serwaa@example.com", "console"],
  ["/console/campaigns", "Friday Newsletter", "console"],
  ["/console/mails-delivered", "delivered", "console"],
  ["/console/emails", "", "console"],
  ["/console/faq", "?", "console"],
  ["/console/widgets", "widget", "console"],
  ["/console/pages/categories", "", "console"],
  ["/console/posts/categories", "", "console"],
  ["/console/prayer-board/categories", "Health", "console"],
  ["/console/cities", "", "console"],
  ["/console/webhooks", "Webhooks", "console"],
  ["/console/contacts", "hi via nginx", "console"],
  ["/console/feedbacks", "grace", "console"],
  ["/gallery", "", "public"],
  ["/sermons", "", "public"],
  ["/bulletins", "", "public"],
  ["/faq", "", "public"],
  ["/prayer-board", "Praise report", "public"],
  ["/member/groups", "Young Adults Fellowship", "member"],
  ["/member/give", "25.00", "member"],
  ["/member/id-card", "Andrew", "member"],
];

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });

// admin login
await page.goto(`${BASE}/console/login`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.fill("#email", "a4nsah@gmail.com");
await page.fill("#password", "AdminTest#2026");
await page.click("button[type=submit]");
await page.waitForURL(/\/console$/, { timeout: 20000 });

// member login on second tab
const mp = await browser.newPage({ viewport: { width: 1500, height: 900 } });
await mp.goto(`${BASE}/member/login`, { waitUntil: "networkidle" });
await mp.waitForTimeout(1500);
await mp.fill("#email", "aaaansah@gmail.com");
await mp.fill("#password", "MemberTest#2027");
await mp.click("button[type=submit]");
await mp.waitForURL(/\/member$/, { timeout: 20000 });

for (const [path, needle, kind] of checks) {
  const p = kind === "member" ? mp : page;
  try {
    const res = await p.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });
    const body = ((await p.textContent("main").catch(() => "")) ?? "").replace(/\s+/g, " ");
    const status = res?.status() ?? 0;
    if (status >= 400) {
      console.log(`ERROR ${status}   ${path}`);
    } else if (needle && !body.toLowerCase().includes(needle.toLowerCase())) {
      console.log(`MISSING "${needle}"  ${path}`);
      console.log(`    main text: ${body.slice(0, 220)}`);
    } else {
      console.log(`OK            ${path}${needle ? ` (found "${needle}")` : ` — ${body.slice(0, 90)}`}`);
    }
  } catch (e) {
    console.log(`CRASH         ${path}: ${String(e).slice(0, 100)}`);
  }
}
await browser.close();
