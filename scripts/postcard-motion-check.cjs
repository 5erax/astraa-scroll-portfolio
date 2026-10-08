const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
require('node:fs').mkdirSync('outputs', { recursive: true });
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const url = process.argv[2] || 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=document-user-activation-required'] });
  try {
    const errors = [];
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.setDefaultTimeout(10000);
    // Every context uses a fake count; QA must never inflate the live total.
    await page.route('**/api/profile-views', route => route.fulfill({ json: { count: 319 } }));
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url, { waitUntil: 'networkidle' });
    const video = page.locator('.tpp-entry-media video');
    await page.waitForFunction(() => document.querySelector('video')?.currentTime > .2);
    assert.equal(await video.evaluate(node => node.muted && node.loop && node.playsInline), true);
    assert.equal(await page.locator('audio').evaluate(node => node.paused && node.currentTime === 0), true);
    await page.getByRole('button', { name: 'Pause background video', exact: true }).click();
    const pausedAt = await video.evaluate(node => node.currentTime);
    await page.waitForTimeout(200);
    assert.equal(await video.evaluate(node => node.currentTime), pausedAt);
    await page.getByRole('button', { name: 'Play background video', exact: true }).click();
    await page.waitForFunction(time => document.querySelector('video').currentTime > time + .1, pausedAt);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    assert.equal(await video.evaluate(node => node.paused), true);
    await page.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(() => !document.querySelector('video').paused);
    await page.screenshot({ path: 'outputs/astraa-entry-video.png' });
    await page.evaluate(() => { window.__entryVideo = document.querySelector('video'); });
    await page.getByRole('button', { name: 'Open letter', exact: true }).click();
    await page.locator('.tpp-root[data-entry=entered]').waitFor();
    assert.equal(await video.count(), 0, 'Entering must remove the video from the portfolio.');
    await page.waitForFunction(() => window.__entryVideo.paused);
    await page.getByRole('button', { name: /^Music player/ }).click();
    await page.getByRole('button', { name: 'Pause background music', exact: true }).click();
    await page.keyboard.press('Escape');
    const go = async label => {
      const desktopLink = page.getByRole('navigation', { name: 'Chapters', exact: true }).getByRole('button', { name: label, exact: true });
      if (await desktopLink.isVisible()) {
        await desktopLink.click();
      } else {
        await page.getByRole('button', { name: 'Choose chapter', exact: true }).click();
        await page.getByRole('navigation', { name: 'Chapter index', exact: true }).getByRole('button', { name: new RegExp(label) }).click();
      }
      await page.waitForTimeout(1500);
    };
    await go('About');
    const paper = page.locator('.tpp-flip');
    const back = async expected => {
      assert.equal(await paper.getAttribute('data-back'), expected ? '' : null);
      assert.equal(await page.locator(`[data-side=${expected ? 'front' : 'back'}]`).evaluate(node => node.inert), true);
      await page.waitForTimeout(330);
    };
    const clickAt = async (x, y) => {
      const box = await paper.boundingBox();
      await page.mouse.click(box.x + box.width * x, box.y + box.height * y);
    };
    await clickAt(.18, .25); // Portrait.
    await back(true);
    await clickAt(.5, .45); // Reverse copy.
    await back(false);
    await clickAt(.72, .48); // Handwritten copy.
    await back(true);
    await clickAt(.95, .9); // Paper margin.
    await back(false);
    const gallery = page.getByRole('button', { name: 'Next personal photo', exact: true });
    await gallery.click();
    assert.equal(await gallery.locator('img[data-current]').getAttribute('src'), '/media/friends.webp');
    await back(false);
    await page.getByRole('button', { name: 'Click for more ↻', exact: true }).focus();
    await page.keyboard.press('Enter');
    assert.equal(await paper.evaluate(node => getComputedStyle(node).transitionDuration), '0s', 'Keyboard flips must be instant.');
    await back(true);
    assert.match(await page.locator(':focus').textContent(), /Front/);
    await page.keyboard.press('Space');
    await back(false);
    const drag = async (fraction, cancel = false) => {
      const box = await paper.boundingBox();
      const x = box.x + box.width * .5, y = box.y + box.height * .45;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + box.width * fraction, y, { steps: 10 });
      assert.equal(await paper.getAttribute('data-dragging'), '');
      assert.equal(await paper.evaluate(node => getComputedStyle(node).transitionDuration), '0s', 'Held paper must track without easing.');
      if (cancel) await paper.dispatchEvent('pointercancel', { pointerId: 1 });
      await page.mouse.up();
    };
    await drag(-.34);
    await back(true);
    await drag(.34);
    await back(false);
    await drag(.1);
    await back(false);
    await drag(-.34, true);
    await back(false);
    assert.equal(await paper.getAttribute('data-dragging'), null);
    await page.getByRole('button', { name: 'Write Astraa a letter', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.tpp-link[aria-current=true]')?.textContent === 'Contact');
    assert.equal(await page.locator('textarea').evaluate(node => node === document.activeElement), true);
    assert.equal(await page.locator('textarea').inputValue(), '', 'The shortcut opens Contact without composing or sending a message.');

    for (const [width, height] of [[1440, 900], [1024, 768], [768, 1024], [390, 844], [320, 640]]) {
      console.log('Checking timeline:', width);
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(250);
      await go('Journey');
      assert.deepEqual(await page.locator('.tpp-pin-y').allTextContents(), ['2020–2024', '2023', '2024–present', 'Now']);
      for (let i = 0; i < 4; i++) {
        await page.locator('.tpp-pin').nth(i).click();
        await page.waitForTimeout(1000);
        const layout = await page.locator('.tpp-route-map').evaluate(map => {
          const route = map.querySelector('svg path');
          const matrix = route.getScreenCTM();
          const length = route.getTotalLength();
          const card = document.querySelector('.tpp-stop').getBoundingClientRect();
          const walker = map.querySelector('.tpp-walker').getBoundingClientRect();
          return [...map.querySelectorAll('.tpp-pin')].map(pin => {
            const dot = pin.querySelector('.tpp-pin-dot').getBoundingClientRect();
            const label = pin.querySelector('.tpp-pin-y');
            const rect = label.getBoundingClientRect();
            const x = dot.x + dot.width / 2, y = dot.y + dot.height / 2;
            let distance = Infinity;
            for (let n = 0; n <= 1000; n++) {
              const point = route.getPointAtLength(length * n / 1000).matrixTransform(matrix);
              distance = Math.min(distance, Math.hypot(x - point.x, y - point.y));
            }
            return { distance, nowrap: getComputedStyle(label).whiteSpace === 'nowrap', inside: rect.x >= 0 && rect.right <= innerWidth,
              clear: rect.bottom < card.top && y + dot.height / 2 < card.top,
              walker: pin.getAttribute('aria-pressed') !== 'true' || Math.hypot(x - walker.x - walker.width / 2, y - walker.y - walker.height / 2) < 1 };
          });
        });
        for (const point of layout) {
          assert.ok(point.distance < 2, `A timeline circle missed its route at ${width}px: ${point.distance}px`);
          assert.ok(point.nowrap && point.inside && point.clear && point.walker, `Timeline labels/card/walker overlap at ${width}px.`);
        }
      }
      await page.screenshot({ path: `outputs/astraa-journey-${width}.png` });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    await page.locator('.tpp-pin').first().focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('.tpp-pin').nth(1).getAttribute('aria-pressed'), 'true');
    for (const modifier of ['altKey', 'ctrlKey', 'metaKey']) {
      assert.equal(await page.locator('.tpp-pin').nth(1).evaluate((node, modifier) => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', [modifier]: true, bubbles: true, cancelable: true });
        node.dispatchEvent(event);
        return event.defaultPrevented;
      }, modifier), false);
      assert.equal(await page.locator('.tpp-pin').nth(1).getAttribute('aria-pressed'), 'true');
    }
    await page.setViewportSize({ width: 390, height: 844 });
    console.log('Checking touch and reduced motion');
    await go('About');
    const touch = await page.context().newCDPSession(page);
    const swipe = async (dx, dy) => {
      const box = await paper.boundingBox();
      const x = box.x + box.width * .5, y = box.y + box.height * .45;
      await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let i = 1; i <= 8; i++) {
        await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / 8, y: y + dy * i / 8 }] });
        await page.waitForTimeout(20);
      }
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(330);
    };
    await swipe(-130, 0);
    await back(true);
    await swipe(130, 0);
    await back(false);
    const startY = await page.evaluate(() => scrollY);
    await swipe(0, -180);
    assert.ok(await page.evaluate(() => scrollY) > startY + 20, 'Vertical touch on the postcard must scroll naturally.');
    await back(false);
    await go('About');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Click for more ↻', exact: true }).click();
    assert.equal(await paper.evaluate(node => getComputedStyle(node).transitionDuration), '0s');
    await back(true);

    // A fresh reduced-motion page must use the poster without requesting the video.
    console.log('Checking video fallbacks');
    const still = await browser.newPage({ reducedMotion: 'reduce' });
    const videoRequests = [];
    still.on('request', request => { if (request.url().includes('heart-lake.mp4')) videoRequests.push(request.url()); });
    await still.route('**/api/profile-views', route => route.fulfill({ json: { count: 319 } }));
    await still.goto(url, { waitUntil: 'networkidle' });
    assert.deepEqual(videoRequests, []);
    assert.equal(await still.locator('video').count(), 0);
    assert.equal(await still.locator('.tpp-entry-media img').evaluate(node => node.complete && node.naturalWidth > 0), true);
    await still.close();
    const blocked = await browser.newPage();
    await blocked.route('**/api/profile-views', route => route.fulfill({ json: { count: 319 } }));
    await blocked.addInitScript(() => {
      const play = HTMLMediaElement.prototype.play;
      window.__restorePlay = () => { HTMLMediaElement.prototype.play = play; };
      HTMLMediaElement.prototype.play = function () {
        return this instanceof HTMLVideoElement ? Promise.reject(new DOMException('Blocked', 'NotAllowedError')) : play.call(this);
      };
    });
    await blocked.goto(url, { waitUntil: 'domcontentloaded' });
    await blocked.getByRole('button', { name: 'Play background video', exact: true }).waitFor();
    assert.equal(await blocked.locator('video').evaluate(node => node.paused), true);
    await blocked.evaluate(() => window.__restorePlay());
    await blocked.getByRole('button', { name: 'Play background video', exact: true }).click();
    await blocked.waitForFunction(() => document.querySelector('video').currentTime > .1);
    await blocked.close();
    const failed = await browser.newPage();
    await failed.route('**/media/heart-lake.mp4', route => route.fulfill({ status: 503, body: 'Unavailable' }));
    await failed.route('**/api/profile-views', route => route.fulfill({ json: { count: 319 } }));
    await failed.goto(url, { waitUntil: 'networkidle' });
    await failed.waitForFunction(() => !document.querySelector('video'));
    assert.equal(await failed.locator('.tpp-entry-media img').evaluate(node => node.complete && node.naturalWidth > 0), true);
    await failed.getByRole('button', { name: 'Open letter', exact: true }).click();
    await failed.locator('.tpp-root[data-entry=entered]').waitFor();
    await failed.close();
    assert.deepEqual(errors, []);
    console.log('PASS: real muted video/pause/resume/unmount, still/error fallback, whole-paper click and keyboard/drag/cancel/touch flips, gallery preserved, vertical touch scroll, contact shortcut/focus, reduced motion, centered timeline nodes and readable dates with clear cards at 320–1440px.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
