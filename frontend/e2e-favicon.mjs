import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
const links = await page.$$eval('link[rel*="icon"]', (els) => els.map((e) => `${e.rel} -> ${e.href}`));
console.log("icon links:", links.length ? links : "NONE");
console.log("title:", await page.title());
await browser.close();
