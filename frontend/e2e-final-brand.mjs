import { chromium } from "playwright";
const SHOT = process.env.SHOT_DIR ?? ".";
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1500, height: 400 } });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.screenshot({ path: `${SHOT}/final-navbar.png`, clip: { x: 0, y: 0, width: 1500, height: 90 } });
await browser.close();
