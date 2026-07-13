// Quick visual + auth check of the Dockerized stack behind nginx :8090.
import { chromium } from "playwright";

const BASE = "http://localhost:8090";
const results = [];
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// 1. Public home renders with content
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
results.push(["home title", await page.title()]);
await page.screenshot({ path: "docker-home.png", fullPage: false });

// 2. Member area is guarded
await page.goto(BASE + "/member/dashboard", { waitUntil: "networkidle" });
results.push(["member guard ->", page.url()]);

// 3. Console login round-trip
await page.goto(BASE + "/console/login", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.fill('input[type="email"]', "a4nsah@gmail.com");
await page.fill('input[type="password"]', "AdminTest#2026");
await page.click('button[type="submit"]');
await page.waitForURL("**/console**", { timeout: 15000 });
await page.waitForTimeout(2000);
results.push(["console after login", page.url()]);
await page.screenshot({ path: "docker-console.png", fullPage: false });

// 4. Broken images on home?
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const broken = await page.$$eval("img", (imgs) =>
  imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src)
);
results.push(["broken images", broken.length ? broken.join(", ") : "none"]);

await browser.close();
for (const [k, v] of results) console.log(`${k}: ${v}`);
