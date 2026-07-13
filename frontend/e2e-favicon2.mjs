import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
const html = await page.content();
console.log("favicon url in DOM:", html.includes("HGRtwJrbkhbZXGa2KcAwya7m2QSb8FabmNC24nz8") ? "YES" : "NO");
const linkTags = html.match(/<link[^>]*>/g)?.filter((l) => l.includes("icon")) ?? [];
console.log("icon-ish link tags:", linkTags.length ? linkTags : "none");
await browser.close();
