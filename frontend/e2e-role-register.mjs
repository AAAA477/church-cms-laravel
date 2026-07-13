// E2E: extended registration form + member->subadmin->admin role changes.
import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1360, height: 1100 } });
const out = [];
const stamp = Date.now().toString().slice(-7);

// ---- Register with every new field ----
await page.goto(BASE + "/member/register", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.fill("#firstname", "Roletest");
await page.fill("#lastname", "Candidate");
await page.selectOption("#gender", "female");
await page.selectOption('select[name="birth_day"]', "14");
await page.selectOption('select[name="birth_month"]', "3");
// year intentionally left blank — tests the day/month-only path
await page.fill("#mobile_no", `55${stamp}0`.slice(0, 10));
await page.fill("#email", `roletest${stamp}@example.com`);
await page.selectOption("#profession", "teacher");
await page.selectOption("#preferred_channel", "whatsapp");
await page.fill("#address", "42 Testing Ave");
await page.fill("#pincode", "T5T 1A1");
await page.selectOption("#country", { label: "Canada" });
await page.waitForTimeout(1500);
await page.selectOption("#province", { label: "Alberta" });
await page.waitForTimeout(1500);
const cityOptions = await page.$$eval("#city option", (os) => os.length);
out.push(["alberta cities loaded", cityOptions]);
await page.selectOption("#city", { index: 1 });
await page.selectOption("#relation", "head");
await page.fill("#password", "RegTest#2026x");
await page.fill("#password_confirmation", "RegTest#2026x");
await page.screenshot({ path: "register-extended.png", fullPage: true });
await page.click('button[type="submit"]');
await page.waitForURL((u) => u.pathname === "/member", { timeout: 40000 }).catch(async () => {
  out.push(["register FAILED", (await page.locator('[role="alert"], .text-red-700').first().textContent().catch(() => "no error text"))]);
});
out.push(["registered, landed", page.url()]);
await browser.close();
for (const [k, v] of out) console.log(`${k}: ${v}`);
