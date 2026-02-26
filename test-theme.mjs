import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173');
  
  console.log('Waiting for load...');
  await page.waitForTimeout(2000);
  
  console.log('Clicking theme toggle...');
  try {
    await page.click('.theme-btn');
    console.log('Clicked theme toggle button.');
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('Failed to click:', e.message);
  }

  await browser.close();
})();
