// E2E: promote member -> subadmin (console access + no role powers),
// -> admin, -> revert to member. User 29 ("Roletest Candidate") is already
// membership_type=member (converted by a prior run of this script / the
// register e2e + Make Member).
import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const browser = await chromium.launch({ channel: "msedge" });
const out = [];
function log(k, v) { console.log(`${k}: ${v}`); }

async function consoleLogin(page, email, password) {
  await page.goto(BASE + "/console/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => u.pathname === "/console", { timeout: 30000 });
}

const admin = await browser.newPage({ viewport: { width: 1360, height: 1000 } });
await consoleLogin(admin, "a4nsah@gmail.com", "AdminTest#2026");
admin.on("dialog", (d) => d.accept());

await admin.goto(BASE + "/console/members?search=Roletest", { waitUntil: "networkidle" });
await admin.waitForTimeout(1500);
log(...["found in members list", await admin.locator('tbody tr:has-text("Roletest")').count()]);
await admin.click('tbody tr:has-text("Roletest") a');
await admin.waitForURL("**/console/members/**", { timeout: 20000 });
await admin.waitForTimeout(1500);
const staffEmail = (await admin.locator("p.text-sm.text-ink-soft").first().textContent()).trim();
log(...["target email", staffEmail]);
log(...["role card visible", await admin.locator("text=Promote this member").isVisible().catch(() => false)]);

await admin.click('button:has-text("Make Subadmin")');
await admin.waitForURL("**/console/subadmins**", { timeout: 20000 });
await admin.waitForTimeout(1500);
log(...["staff list after promote", await admin.locator('tbody tr:has-text("Roletest")').count()]);
log(...["badge text", (await admin.locator('tbody tr:has-text("Roletest") span').first().textContent().catch(() => "?"))]);

// ---- The new subadmin can log into the console but cannot change roles ----
const sub = await browser.newPage();
await consoleLogin(sub, staffEmail, "RegTest#2026x");
log(...["subadmin console login", sub.url().includes("/console") ? "OK" : sub.url()]);
const forbidden = await sub.evaluate(async () => {
  const r = await fetch("/bff/admin/members/1/role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "member" }),
  });
  return r.status;
});
log(...["subadmin role-change attempt (expect 403)", forbidden]);
await sub.close();

// ---- Admin: subadmin detail -> promote to admin -> permissions hidden -> revert ----
await admin.goto(BASE + "/console/subadmins?search=Roletest", { waitUntil: "networkidle" });
await admin.waitForTimeout(1500);
await admin.click('tbody tr:has-text("Roletest") a');
await admin.waitForURL("**/console/subadmins/**", { timeout: 20000 });
await admin.waitForTimeout(1500);
log(...["permissions panel (subadmin)", await admin.locator('h2:has-text("Permissions")').isVisible().catch(() => false)]);

// A same-page role change reloads the page (see RoleButtons.tsx) rather
// than navigating — the reload fires asynchronously (after the fetch
// resolves), so the 'load' listener must be armed BEFORE the click or it
// can resolve against the page's already-completed prior load instead of
// waiting for the new one.
let loadPromise = admin.waitForEvent("load", { timeout: 15000 });
await admin.click('button:has-text("Make Admin")');
await loadPromise;
await admin.waitForTimeout(1500);
log(...["badge after make admin", (await admin.locator("h1 ~ span").first().textContent().catch(() => "?"))]);
log(...["permissions hidden for admin", !(await admin.locator('h2:has-text("Permissions")').isVisible().catch(() => false))]);

loadPromise = admin.waitForEvent("load", { timeout: 15000 });
await admin.click('button:has-text("Revert to Member")');
await loadPromise;
await admin.waitForTimeout(1500);

await admin.goto(BASE + "/console/subadmins?search=Roletest", { waitUntil: "networkidle" });
await admin.waitForTimeout(1200);
log(...["gone from staff after revert", (await admin.locator('tbody tr:has-text("Roletest")').count()) === 0]);

await admin.goto(BASE + "/console/members?search=Roletest", { waitUntil: "networkidle" });
await admin.waitForTimeout(1200);
log(...["back in members after revert", (await admin.locator('tbody tr:has-text("Roletest")').count()) >= 1]);

await browser.close();
for (const [k, v] of out) console.log(`${k}: ${v}`);
