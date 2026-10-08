const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
require('node:fs').mkdirSync('outputs', { recursive: true });
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = process.argv[2] || 'http://localhost:3001';
    await page.goto(url, { waitUntil: 'networkidle' });
    assert.match(await page.title(), /^Astraa/);
    assert.equal(await page.locator('.tpp-root h1').textContent(), 'A developer with aneye for the interface.');
    assert.doesNotMatch(await page.locator('.tpp-root').innerText(), /Kedhareswer|Hyderabad|Frostline|Hearth|Nordlys|7 years|40\+ launches|example\.com/);
    const go = async label => {
      console.log('Checking chapter:', label);
      await page.getByRole('navigation', { name: 'Chapters' }).getByRole('button', { name: label, exact: true }).click();
      await page.waitForTimeout(1800);
      assert.equal(await page.locator('.tpp-link[aria-current=true]').textContent(), label);
    };
    await go('About');
    await page.getByRole('button', { name: 'Turn over ↻', exact: true }).click();
    await page.waitForTimeout(700);
    assert.equal(await page.locator('.tpp-flip').getAttribute('data-back'), '');
    assert.equal(await page.locator('[data-side=front]').evaluate(node => node.inert), true);
    assert.match(await page.locator(':focus').textContent(), /Front/);
    assert.match(await page.getByRole('region', { name: 'About', exact: true }).innerText(), /Ho Chi Minh, Vietnam/);
    assert.equal(await page.locator('a[href="mailto:lagna0175@gmail.com"]').count(), 1);
    await go('Work');
    const names = ['ProZ0', 'MediMate AI', 'FinGenie', 'GeoConnect', 'CVmate', 'Ecommerce Mobile', 'MLN Web'];
    const paths = ['ProZ0', 'SEP490_FE_MedicalAIAssistant', 'FinGenie', 'geoconnect', 'CVmate', 'ecomerce-mobile', 'MLN-web'];
    for (let i = 0; i < names.length; i++) {
      assert.equal(await page.getByRole('group', { name: 'Projects', exact: true }).locator('[aria-current=true]').getAttribute('aria-label'), names[i]);
      assert.equal(await page.getByRole('link', { name: 'View project ↗', exact: true }).getAttribute('href'), 'https://github.com/5erax/' + paths[i]);
      if (i === 0) await page.screenshot({ path: 'outputs/astraa-scroll-work-preview.png' });
      await page.getByRole('button', { name: 'Next project', exact: true }).click();
      await page.waitForTimeout(450);
    }
    assert.equal(await page.getByRole('group', { name: 'Projects', exact: true }).locator('[aria-current=true]').getAttribute('aria-label'), 'ProZ0');
    await page.getByRole('button', { name: 'Next project', exact: true }).focus();
    const workY = await page.evaluate(() => scrollY);
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.getByRole('group', { name: 'Projects', exact: true }).locator('[aria-current=true]').getAttribute('aria-label'), 'MLN Web');
    assert.equal(await page.evaluate(() => scrollY), workY);
    for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Next project', exact: true }).click();
    await page.waitForTimeout(500);
    assert.equal(await page.getByRole('group', { name: 'Projects', exact: true }).locator('[aria-current=true]').getAttribute('aria-label'), 'CVmate');
    await go('Journey');
    const pin = page.locator('.tpp-pin').first();
    await pin.click();
    assert.equal(await pin.getAttribute('aria-pressed'), 'true');
    await go('Contact');
    await page.getByRole('button', { name: 'Open email draft ↗', exact: true }).click();
    assert.equal(await page.locator('textarea').evaluate(node => node === document.activeElement), true);
    assert.equal(await page.locator('textarea').getAttribute('aria-invalid'), 'true');
    assert.match(await page.getByRole('status').innerText(), /Write a short message/);
    await page.locator('textarea').fill('A small test draft.');
    assert.equal(await page.locator('textarea').getAttribute('aria-invalid'), 'false');
    await page.getByRole('textbox', { name: 'From', exact: true }).fill('invalid-address');
    assert.equal(await page.getByRole('textbox', { name: 'From', exact: true }).evaluate(node => node.validity.typeMismatch), true);
    // Exercise clipboard rejection without sending an email or opening an external app.
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('denied')) } }));
    await page.getByRole('button', { name: 'Copy email', exact: true }).click();
    assert.match(await page.getByRole('status').innerText(), /Copy unavailable/);
    assert.equal(await page.getByRole('link', { name: 'GitHub', exact: true }).getAttribute('href'), 'https://github.com/5erax');
    assert.equal(await page.getByRole('link', { name: 'LinkedIn', exact: true }).getAttribute('href'), 'https://linkedin.com/in/dha2608');
    await go('Cover');
    await page.screenshot({ path: 'outputs/astraa-scroll-cover-preview.png' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.mouse.wheel(0, 780);
    await page.waitForTimeout(160);
    assert.ok(await page.locator('.tpp-ch[data-on] .tpp-light').evaluateAll(nodes => nodes.some(node => +node.style.opacity > .01)), 'Tearing paper should react to scroll with directional light.');
    assert.match(await page.locator('.tpp-ch[data-on] .tpp-up').first().getAttribute('style'), /rotateX/);
    await page.screenshot({ path: 'outputs/astraa-scroll-tear.png' });
    await go('Cover');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    const mobileGo = async label => {
      await page.getByRole('button', { name: 'Choose chapter', exact: true }).click();
      await page.getByRole('navigation', { name: 'Chapter index', exact: true }).getByRole('button', { name: label + ' ', exact: false }).click();
      await page.waitForTimeout(1500);
      assert.equal(await page.locator('.tpp-index').evaluate(node => node.matches(':popover-open')), false);
    };
    await page.getByRole('button', { name: 'Choose chapter', exact: true }).click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.tpp-index').evaluate(node => node.matches(':popover-open')), false);
    await page.getByRole('button', { name: 'Choose chapter', exact: true }).click();
    await page.mouse.click(10, 740);
    assert.equal(await page.locator('.tpp-index').evaluate(node => node.matches(':popover-open')), false);
    await mobileGo('About');
    await page.screenshot({ path: 'outputs/astraa-scroll-mobile-preview.png' });
    await mobileGo('Work');
    const deck = page.locator('.tpp-project-stack');
    const box = await deck.boundingBox();
    await page.mouse.move(box.x + box.width * .8, box.y + box.height * .5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * .2, box.y + box.height * .5, { steps: 8 });
    await page.mouse.up();
    assert.equal(await page.getByRole('group', { name: 'Projects', exact: true }).locator('[aria-current=true]').getAttribute('aria-label'), 'MediMate AI');
    const touch = await page.context().newCDPSession(page);
    const swipe = async (x1, y1, x2, y2) => {
      await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y: y1 }] });
      for (let i = 1; i <= 8; i++) {
        await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + (x2 - x1) * i / 8, y: y1 + (y2 - y1) * i / 8 }] });
        await page.waitForTimeout(20);
      }
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(500);
    };
    await swipe(box.x + box.width * .2, box.y + box.height * .5, box.x + box.width * .8, box.y + box.height * .5);
    assert.equal(await page.getByRole('group', { name: 'Projects', exact: true }).locator('[aria-current=true]').getAttribute('aria-label'), 'ProZ0');
    const panY = await page.evaluate(() => scrollY);
    await swipe(box.x + box.width * .5, box.y + box.height * .8, box.x + box.width * .5, box.y + box.height * .2);
    assert.ok(await page.evaluate(() => scrollY) > panY + 20, 'Vertical touch gestures must keep native page scrolling.');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'outputs/astraa-scroll-mobile-work.png' });
    await page.setViewportSize({ width: 390, height: 640 });
    await page.waitForTimeout(400);
    assert.equal(await page.locator('.tpp-root').getAttribute('data-mode'), 'stack');
    assert.match(await page.getByRole('button', { name: 'Choose chapter', exact: true }).textContent(), /03/);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    assert.equal(await page.locator('.tpp-root').getAttribute('data-mode'), 'pin');
    assert.match(await page.getByRole('button', { name: 'Choose chapter', exact: true }).textContent(), /03/);
    assert.equal(await page.locator('img').evaluateAll(images => images.filter(image => image.src && !image.complete || image.src && image.naturalWidth === 0).length), 0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(300);
    assert.match(await page.getByRole('button', { name: 'Choose chapter', exact: true }).textContent(), /03/);
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('.tpp-root').getAttribute('data-mode'), 'stack');
    assert.equal(await page.locator('.tpp-ch').count(), 5);
    await page.getByRole('button', { name: 'Choose chapter', exact: true }).click();
    await page.getByRole('navigation', { name: 'Chapter index', exact: true }).getByRole('button', { name: /Contact/ }).click();
    await page.waitForTimeout(300);
    assert.match(await page.getByRole('button', { name: 'Choose chapter', exact: true }).textContent(), /05/);
    for (const [width, height] of [[320, 640], [768, 1024], [1024, 768]]) {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.setViewportSize({ width, height });
      await page.goto(url, { waitUntil: 'networkidle' });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (width === 320) {
        assert.equal(await page.locator('.tpp-root').getAttribute('data-mode'), 'stack');
        await mobileGo('Contact');
        const submit = await page.getByRole('button', { name: 'Open email draft ↗', exact: true }).boundingBox();
        assert.ok(submit.y >= 0 && submit.y + submit.height <= height, 'Small-screen contact action must fit the viewport.');
        await page.screenshot({ path: 'outputs/astraa-scroll-small-contact.png' });
      }
    }
    assert.deepEqual(errors, []);
    console.log('PASS: identity, 7 real projects, flip focus/inert, rapid gallery and arrow keys, paper depth/light, validation and clipboard failure, mobile chapter menu/Escape/swipe/native pan, 320–1440px layouts, rotation/reduced-motion chapter preservation, no browser errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
