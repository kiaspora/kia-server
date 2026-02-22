import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { URL } from 'node:url';
import path from 'node:path';
import { BearerTokenGuard } from '../auth/bearer-token.guard';
import { chromium } from 'playwright';

@Controller('api/parse')
export class ParseController {
  @UseGuards(BearerTokenGuard)
  @Get('html')
  async parseHtml(
    @Query('url') urlStr: string | undefined,
    @Res() res: Response,
  ) {
    const started = Date.now();

    if (!urlStr) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required query param: url',
      });
    }

    let url: URL;
    try {
      url = new URL(urlStr);
    } catch {
      return res.status(400).json({
        ok: false,
        error: 'Invalid url',
      });
    }

    const TIMEOUT_MS = 45000;
    const SCROLL_MS = 6000;

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        locale: 'en-US',
        viewport: { width: 1400, height: 900 },
      });

      const page = await context.newPage();

      const networkLog: any[] = [];

      page.on('requestfailed', (req) => {
        networkLog.push({
          type: 'requestfailed',
          url: req.url(),
          method: req.method(),
          failure: req.failure()?.errorText,
        });
      });

      page.on('response', (resp) => {
        if (resp.status() >= 400) {
          networkLog.push({
            type: 'response',
            url: resp.url(),
            status: resp.status(),
          });
        }
      });

      // 1️⃣ Navigate
      await page.goto(url.toString(), {
        waitUntil: 'domcontentloaded',
        timeout: TIMEOUT_MS,
      });

      // 2️⃣ Attempt consent click (best effort)
      const consentButtons = [
        'button:has-text("Accept")',
        'button:has-text("I Agree")',
        '[data-testid="accept-button"]',
      ];

      for (const sel of consentButtons) {
        const btn = page.locator(sel).first();
        if (await btn.isVisible().catch(() => false)) {
          await btn.click().catch(() => {});
          await page.waitForTimeout(800);
          break;
        }
      }

      // 3️⃣ Wait for app boot
      await page.waitForLoadState('networkidle', {
        timeout: 15000,
      }).catch(() => {});

      // 4️⃣ Click "Most Anticipated"
      const anticipatedTab = page.locator('[data-testid="trailer-most-anticipated"]').first();
      if (await anticipatedTab.isVisible().catch(() => false)) {
        await anticipatedTab.click().catch(() => {});
        await page.waitForTimeout(1000);
      }

      // 5️⃣ Force lazy loading
      const startScroll = Date.now();
      while (Date.now() - startScroll < SCROLL_MS) {
        await page.mouse.wheel(0, 2000).catch(() => {});
        await page.waitForTimeout(400);
      }

      // 6️⃣ Final settle
      await page.waitForTimeout(2000);

      const html = await page.content();
      const screenshot = await page.screenshot({ fullPage: true });

      const safeHost = url.host.replace(/[^a-zA-Z0-9.-]/g, '_');
      const hash = createHash('sha1').update(url.toString()).digest('hex').slice(0, 16);

      const outDir = path.join(process.cwd(), 'temp');
      await mkdir(outDir, { recursive: true });

      const htmlName = `${safeHost}-${hash}.rendered.html`;
      const shotName = `${safeHost}-${hash}.png`;
      const netName = `${safeHost}-${hash}.net.json`;

      await writeFile(path.join(outDir, htmlName), html, 'utf8');
      await writeFile(path.join(outDir, shotName), screenshot);
      await writeFile(path.join(outDir, netName), JSON.stringify(networkLog, null, 2));

      await context.close();

      return res.status(200).json({
        ok: true,
        rendered: true,
        url: page.url(),
        htmlPath: `temp/${htmlName}`,
        screenshotPath: `temp/${shotName}`,
        networkLogPath: `temp/${netName}`,
        size: Buffer.byteLength(html, 'utf8'),
        latencyMs: Date.now() - started,
      });
    } catch (err: any) {
      return res.status(500).json({
        ok: false,
        error: err?.message ?? 'Unknown error',
      });
    } finally {
      await browser.close().catch(() => {});
    }
  }
}