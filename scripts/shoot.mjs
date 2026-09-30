// Visual smoke test: loads the site in headless Chrome with software WebGL,
// reports console and shader errors, and writes screenshots to /screenshots.
//
//   node scripts/shoot.mjs [url]
import { mkdir } from 'node:fs/promises';
import puppeteer from 'puppeteer';

const url = process.argv[2] ?? 'http://localhost:3210';
const out = 'screenshots';
await mkdir(out, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
    '--no-sandbox',
  ],
});

const problems = [];

async function shoot(label, width, height, steps) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  // Headless Chrome reports `reduce` by default, which would freeze the scene.
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error' || /shader|glsl|three\.|uniform/i.test(text)) {
      problems.push(`[${label}/${msg.type()}] ${text}`);
    }
  });
  page.on('pageerror', (error) => problems.push(`[${label}/pageerror] ${error.message}`));

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
  await new Promise((resolve) => setTimeout(resolve, 14000));

  for (const step of steps) {
    if (step.anchor) {
      await page.evaluate((id) => document.getElementById(id)?.scrollIntoView({ block: 'start' }), step.anchor);
    }
    if (step.pointer) {
      await page.mouse.move(step.pointer[0], step.pointer[1], { steps: 20 });
    }
    if (step.click) {
      await page.mouse.click(step.click[0], step.click[1]);
    }
    await new Promise((resolve) => setTimeout(resolve, step.settle ?? 3000));
    await page.screenshot({ path: `${out}/${step.name}.png` });
  }

  const info = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return {
      canvas: canvas ? `${canvas.width}x${canvas.height}` : 'missing',
      pageHeight: document.body.scrollHeight,
    };
  });
  console.log(label, JSON.stringify(info));
  await page.close();
}

await shoot('desktop', 1600, 1000, [
  { name: 'hero', pointer: [1150, 640], settle: 4000 },
  { name: 'hero-gust', pointer: [430, 780], click: [430, 780], settle: 3500 },
  { name: 'about', anchor: 'about' },
  { name: 'work', anchor: 'work' },
  { name: 'contact', anchor: 'contact' },
]);

await shoot('mobile', 414, 896, [
  { name: 'mobile-hero', settle: 4000 },
  { name: 'mobile-work', anchor: 'work' },
  { name: 'mobile-contact', anchor: 'contact' },
]);

console.log(problems.length ? `PROBLEMS (${problems.length}):` : 'no console problems');
for (const problem of [...new Set(problems)]) console.log(' -', problem);

await browser.close();
