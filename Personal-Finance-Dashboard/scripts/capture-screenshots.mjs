// Capture fresh fictional data; never reuse real user sessions.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
await mkdir('docs/screenshots',{recursive:true});
try {
 await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:4173');
 await page.getByRole('button',{name:'Try demo'}).waitFor();
 await page.waitForTimeout(1800);
 await page.screenshot({path:'docs/screenshots/sign-in.png',fullPage:true});
 await page.getByRole('button',{name:'Try demo'}).click();
 await page.getByRole('heading',{name:'Your finances at a glance.'}).waitFor();
 await page.waitForTimeout(1800);
 await page.screenshot({path:'docs/screenshots/dashboard-dark.png',fullPage:true});
 await page.getByRole('button',{name:'Switch to light theme'}).click();
 await page.waitForTimeout(1800);
 await page.screenshot({path:'docs/screenshots/dashboard-light.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(1800);
 await page.screenshot({path:'docs/screenshots/mobile.png',fullPage:true});
 console.log('Saved four fictional-demo documentation screenshots.');
} finally {await browser.close();}
