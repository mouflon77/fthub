import puppeteer from 'puppeteer';

const shots = [
  { url: 'https://onchainhub.co', file: 'public/work/onchainhub.jpg' },
  { url: 'https://frontiertechjobs.com', file: 'public/work/frontiertechjobs.jpg' },
];

const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--no-sandbox',
    '--ignore-gpu-blocklist',
  ],
});

for (const shot of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  page.setDefaultNavigationTimeout(120000);
  try {
    await page.goto(shot.url, { waitUntil: 'domcontentloaded' });
    await new Promise((resolve) => setTimeout(resolve, 4000));
    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button')];
      const reject = buttons.find((button) => /^(reject|essential only)$/i.test(button.textContent?.trim() ?? ''));
      (reject ?? buttons.find((button) => /^accept( all)?$/i.test(button.textContent?.trim() ?? '')))?.click();
    });
    await page.addStyleTag({
      content: `
        [class*="cookie" i], [id*="cookie" i], [aria-label*="cookie" i],
        [class*="consent" i], [id*="consent" i] { display: none !important; }
      `,
    });
    await new Promise((resolve) => setTimeout(resolve, 2500));
    await page.screenshot({
      path: shot.file,
      type: 'jpeg',
      quality: 92,
      clip: { x: 0, y: 0, width: 1440, height: 820 },
    });
    console.log('wrote', shot.file);
  } catch (error) {
    console.error('FAIL', shot.url, error.message);
  }
  await page.close();
}

await browser.close();
