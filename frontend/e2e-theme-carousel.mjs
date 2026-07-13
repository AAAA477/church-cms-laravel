// E2E: Settings > Appearance palette + About carousel slides -> public site.
import { chromium } from "playwright";

const CONSOLE = "http://localhost:3000";
const IMG1 = "C:/Users/aaaan/test-cms/church-cms-laravel/public/uploads/Images/sermon.jpg";
const IMG2 = "C:/Users/aaaan/test-cms/church-cms-laravel/public/uploads/banner.jpg";

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1360, height: 950 } });
const out = [];

// Warm up dev-mode compilation so later navigations don't race hydration.
await page.goto(CONSOLE + "/console/login", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

// --- Console: login (exact-path wait: "**/console**" also matches /console/login) ---
await page.fill('input[type="email"]', "a4nsah@gmail.com");
await page.fill('input[type="password"]', "AdminTest#2026");
await page.click('button[type="submit"]');
await page.waitForURL((u) => u.pathname === "/console", { timeout: 30000 });

// --- Settings: Appearance tab, pick Coastal Blue ---
await page.goto(CONSOLE + "/console/settings", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.click('button[role="tab"]:has-text("Appearance")');
await page.click('button:has-text("Coastal Blue")');
out.push(["palette picked", "Coastal Blue"]);

// --- Settings: About tab, two carousel slides ---
await page.click('button[role="tab"]:has-text("About")');
await page.click('button:has-text("+ Add Slide")');
await page.fill('input[placeholder="Slide heading"]', "Who We Are");
await page.fill('textarea[placeholder="Slide text"]', "A family of believers serving our city with faith, hope and love since 1998.");
await page.setInputFiles('input[aria-label="Slide 1 image"]', IMG1);

await page.click('button:has-text("+ Add Slide")');
const headings = page.locator('input[placeholder="Slide heading"]');
const texts = page.locator('textarea[placeholder="Slide text"]');
await headings.nth(1).fill("Our Mission");
await texts.nth(1).fill("To make disciples, care for our community, and share the good news with everyone.");
await page.setInputFiles('input[aria-label="Slide 2 image"]', IMG2);

// --- Save ---
await page.click('button[type="submit"]');
await page.waitForTimeout(4000);
await page.screenshot({ path: "theme-settings-saved.png" });

// --- API: verify persisted ---
const api = await page.evaluate(async () => {
  const r = await fetch("http://127.0.0.1:8000/api/v2/church/details/1");
  const j = await r.json();
  return { palette: j.theme_palette, slides: j.about_carousel?.map((s) => ({ t: s.title, img: !!s.image })) };
});
out.push(["api palette", api.palette]);
out.push(["api slides", JSON.stringify(api.slides)]);

// --- Public site: palette + carousel + no About nav ---
await page.goto(CONSOLE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

const primary = await page.evaluate(() =>
  getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim()
);
out.push(["--color-primary", primary]);

const aboutNav = await page.locator('nav a:has-text("About")').count();
out.push(["About links in nav", aboutNav]);

const aboutSection = page.locator("#about");
out.push(["About section visible", await aboutSection.isVisible()]);
out.push(["slide 1 heading visible", await page.locator('#about h3:has-text("Who We Are")').isVisible()]);

await page.locator('#about button[aria-label="Next slide"]').click();
await page.waitForTimeout(900);
out.push(["slide 2 heading visible after next", await page.locator('#about h3:has-text("Our Mission")').isVisible()]);

const brokenImgs = await page.$$eval("#about img", (imgs) =>
  imgs.filter((i) => i.complete && i.naturalWidth === 0).length
);
out.push(["broken carousel images", brokenImgs]);

await page.locator("#about").scrollIntoViewIfNeeded();
await page.screenshot({ path: "theme-home-carousel.png" });

await browser.close();
for (const [k, v] of out) console.log(`${k}: ${v}`);
