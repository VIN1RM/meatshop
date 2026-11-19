// Rasterize the exported SVG after layout settles (avoids CLI/browser clipping).
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
async function main() {
  const [input, output, mermaidCommand, configFile] = process.argv.slice(2);
  const puppeteer = require(require.resolve('puppeteer', { paths: [path.dirname(mermaidCommand)] }));
  const config = configFile ? JSON.parse(fs.readFileSync(configFile, 'utf8').replace(/^\uFEFF/, '')) : {};
  const browser = await puppeteer.launch({ headless: true, ...config });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 14000, height: 900, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(path.resolve(input)).href, { waitUntil: 'load' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const svg = document.documentElement;
      const box = svg.viewBox.baseVal;
      const scale = Math.min(1, 14000 / box.width);
      svg.setAttribute('width', String(Math.ceil(box.width * scale)));
      svg.setAttribute('height', String(Math.ceil(box.height * scale)));
    });
    await page.screenshot({ path: output, fullPage: true });
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
