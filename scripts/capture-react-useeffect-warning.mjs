import { spawn } from 'node:child_process';
import process from 'node:process';
import net from 'node:net';

import { chromium } from 'playwright';

const DEV_HOST = process.env.HOST ?? '127.0.0.1';
const PREFERRED_PORT = Number.parseInt(process.env.PORT ?? '5175', 10);

const TOTAL_TIMEOUT_MS = Number.parseInt(
  process.env.DEBUG_REACT_WARNING_TIMEOUT_MS ?? '25000',
  10,
);

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const waitForHttpOk = async (url, timeoutMs) => {
  const startedAt = Date.now();
  // Node 20 has global fetch
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const r = await fetch(url, { method: 'GET' });
      if (r.ok) return;
    } catch {
      // ignore
    }
    await sleep(250);
  }
  throw new Error(`Dev server did not become ready in ${timeoutMs}ms: ${url}`);
};

const findFreePort = async ({
  host,
  preferredPort,
  maxTries = 20,
} = {}) => {
  const tryPort = (port) => new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', (err) => {
      server.close();
      reject(err);
    });
    server.listen(port, host, () => {
      const address = server.address();
      const chosen = typeof address === 'object' && address ? address.port : port;
      server.close(() => resolve(chosen));
    });
  });

  for (let i = 0; i <= maxTries; i += 1) {
    const port = preferredPort + i;
    try {
      return await tryPort(port);
    } catch (e) {
      const code = e && typeof e === 'object' ? e.code : null;
      if (code === 'EADDRINUSE' || code === 'EACCES') continue;
      throw e;
    }
  }

  // Fallback: let OS pick a random free port.
  return await tryPort(0);
};

const main = async () => {
  const DEV_PORT = await findFreePort({
    host: DEV_HOST,
    preferredPort: PREFERRED_PORT,
  });
  const DEV_URL = `http://${DEV_HOST}:${DEV_PORT}/`;

  console.log(`[debug] Starting Vite dev server on ${DEV_URL}`);
  if (DEV_PORT !== PREFERRED_PORT) {
    console.log(
      `[debug] Note: preferred port ${PREFERRED_PORT} is busy; using ${DEV_PORT}`,
    );
  }
  console.log(`[debug] Total timeout: ${TOTAL_TIMEOUT_MS}ms`);

  const dev = spawn(
    npmCmd,
    ['run', 'dev', '--', '--host', DEV_HOST, '--port', String(DEV_PORT), '--strictPort'],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.cwd(),
      env: { ...process.env, BROWSER: 'none' },
    },
  );

  dev.stdout.on('data', (b) => process.stdout.write(String(b)));
  dev.stderr.on('data', (b) => process.stderr.write(String(b)));

  const shutdown = async () => {
    if (!dev.killed) {
      dev.kill('SIGTERM');
      await sleep(300);
      if (!dev.killed) dev.kill('SIGKILL');
    }
  };

  const run = async () => {
    await waitForHttpOk(DEV_URL, Math.min(12_000, TOTAL_TIMEOUT_MS - 2_000));

    console.log('[debug] Launching Chromium (headless)');
    let browser;
    try {
      // Prefer system-installed browsers to avoid big downloads.
      try {
        browser = await chromium.launch({ headless: true, channel: 'msedge' });
        console.log('[debug] Using channel: msedge');
      } catch {
        browser = await chromium.launch({ headless: true, channel: 'chrome' });
        console.log('[debug] Using channel: chrome');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[debug] Failed to launch system browser via Playwright.');
      console.error('[debug] Fix: ensure Edge/Chrome is installed OR run `npx playwright install chromium`.');
      console.error('[debug] Original error:', msg);
      process.exitCode = 1;
      return;
    }

    const page = await browser.newPage();

    let captured = null;

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();

      if (type === 'error' || type === 'warning') {
        console.log(`[browser:${type}] ${text}`);
      }

      if (typeof text === 'string') {
        if (text.includes('[autopost.ai] Captured stack for useEffect deps warning:')) {
          captured = text;
        }
        if (text.includes('The final argument passed to useEffect changed size between renders')) {
          captured = captured ?? text;
        }
      }
    });

    page.on('pageerror', (err) => {
      console.log('[browser:pageerror]', err?.stack || String(err));
    });

    console.log('[debug] Navigating…');
    await page.goto(DEV_URL, { waitUntil: 'domcontentloaded' });

    // Try a broader set of interactions (fast, best-effort).
    // 1) Toggle command palette (Ctrl/Cmd+K), then Escape.
    try {
      await page.keyboard.down(process.platform === 'darwin' ? 'Meta' : 'Control');
      await page.keyboard.press('KeyK');
      await page.keyboard.up(process.platform === 'darwin' ? 'Meta' : 'Control');
      await sleep(250);
      await page.keyboard.press('Escape');
    } catch {}

    // 2) Open Settings.
    try {
      await page.getByTitle('Settings').click({ timeout: 2000 });
    } catch {}

    // 3) Open Prompts tab.
    try {
      await page.getByText('Промпты', { exact: true }).click({ timeout: 2000 });
    } catch {
      try {
        await page.getByText('Prompts', { exact: true }).click({ timeout: 2000 });
      } catch {}
    }

    // 4) Go back to Dashboard and click New Draft on welcome if exists.
    try {
      await page.getByTitle('Dashboard').click({ timeout: 2000 });
    } catch {}
    try {
      await page.getByText('Новый черновик', { exact: false }).click({ timeout: 2000 });
    } catch {
      try {
        await page.getByText('New Draft', { exact: false }).click({ timeout: 2000 });
      } catch {}
    }

    // Short wait for React warnings.
    const waitMs = Math.min(6_000, TOTAL_TIMEOUT_MS - 6_000);
    const started = Date.now();
    while (!captured && Date.now() - started < waitMs) {
      await sleep(200);
    }

    await browser.close();

    if (!captured) {
      console.error('[debug] Did not capture the useEffect deps warning.');
      process.exitCode = 1;
    } else {
      console.log('\n[debug] SUCCESS: captured warning output.');
      process.exitCode = 0;
    }
  };

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('TIMEOUT')), TOTAL_TIMEOUT_MS);
  });

  try {
    await Promise.race([run(), timeoutPromise]);
  } catch (e) {
    if (String(e) === 'Error: TIMEOUT') {
      console.error('[debug] TIMEOUT: debug session exceeded total timeout');
      process.exitCode = 1;
    } else {
      throw e;
    }
  } finally {
    await shutdown();
  }
};

main().catch((e) => {
  console.error('[debug] Script failed:', e?.stack || String(e));
  process.exit(1);
});
