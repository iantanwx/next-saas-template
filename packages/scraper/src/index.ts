import { Browser, chromium } from 'playwright';

let browser: Browser;

async function main() {
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://internet-banking.dbs.com.sg/IB/Welcome');

  const username = process.env.DBS_USERNAME;
  const password = process.env.DBS_PASSWORD;
  // find input by id UID
  await page.click('input#UID');
  await page.keyboard.type(username ?? '');
  await page.click('input#PIN');
  await page.keyboard.type(password ?? '');

  // click login button
  // find by title login
  await page.click('button[title="Login"]');

  // wait for 3 seconds
  await page.waitForTimeout(3000);
  // take screenshot
  await page.screenshot({ path: 'login_screenshot.png' });

  // wait for the authenticate button
  // Find the user_area iframe
  const userArea = await page.waitForSelector('frame[name="user_area"]');
  // Get the frame's content
  const userAreaFrame = await userArea.contentFrame();
  if (!userAreaFrame) {
    throw new Error('No frame found');
  }

  // inside the frame we need to find another frame
  const authIframe = await userAreaFrame.waitForSelector('iframe[name="iframe1"]');
  const authFrame = await authIframe.contentFrame();
  if (!authFrame) {
    throw new Error('No frame found');
  }

  // Now wait for the button within the frame
  const authBtn = await authFrame.waitForSelector('a#AuthenticatBtnId');
  // Click the button
  await authBtn.click();

  // again wait for an iframe
  const dashboardFrame = await page.waitForSelector('frame[name="user_area"]');
  const dashboard = await dashboardFrame.contentFrame();
  if (!dashboard) {
    throw new Error('No frame found');
  }

  // wait for the second iframe again
  const dashboardIframe = await dashboard.waitForSelector('iframe[name="iframe1"]');
  const dashboardFrame2 = await dashboardIframe.contentFrame();
  if (!dashboardFrame2) {
    throw new Error('No frame found');
  }

  //<span id="username">Tan Wei Xiang, Ian</span>
  // wait for this span
  const usernameSpan = await dashboardFrame2.waitForSelector('span#username');
  console.log('username', await usernameSpan.innerText());

  // take screenshot
  await page.screenshot({ path: 'login_screenshot_final.png' });

  await browser.close();
}

main().catch(console.error);

process.on('SIGINT', async () => {
  console.log('Received SIGINT. Closing browser...');
  await browser.close();
  process.exit(0);
});

// Note: SIGKILL cannot be caught or handled
