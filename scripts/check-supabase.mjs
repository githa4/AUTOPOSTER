import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const readEnvFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // ignore
  }
};

const loadEnv = () => {
  // Vite convention (we keep this minimal):
  // .env, .env.local, .env.[mode], .env.[mode].local
  // For a simple check, the two most relevant are .env and .env.local.
  readEnvFile(path.join(projectRoot, '.env'));
  readEnvFile(path.join(projectRoot, '.env.local'));
};

const tryLoadBuiltInSupabaseCreds = () => {
  // The app can run without env vars because it falls back to
  // PROVIDED_URL / PROVIDED_ANON_KEY in lib/supabaseClient.ts.
  // For a diagnostic script, we mirror that behavior so the check
  // works out-of-the-box.
  const candidatePaths = [
    path.join(projectRoot, 'lib', 'supabaseClient.ts'),
    path.join(projectRoot, 'src', 'lib', 'supabaseClient.ts'),
  ];

  for (const filePath of candidatePaths) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const urlMatch = content.match(/const\s+PROVIDED_URL\s*=\s*['"]([^'"]+)['"];?/);
      const keyMatch = content.match(/const\s+PROVIDED_ANON_KEY\s*=\s*['"]([^'"]+)['"];?/);
      if (urlMatch?.[1] && keyMatch?.[1]) {
        return {
          url: urlMatch[1],
          anonKey: keyMatch[1],
          source: path.relative(projectRoot, filePath),
        };
      }
    } catch {
      // ignore and continue
    }
  }

  return null;
};

const mask = (value) => {
  if (!value) return '';
  if (value.length <= 8) return '*'.repeat(value.length);
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
};

const sha256_8 = (value) => {
  if (!value) return '';
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 8);
};

const main = async () => {
  loadEnv();

  let supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.REACT_APP_SUPABASE_URL ||
    '';

  let supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.REACT_APP_SUPABASE_ANON_KEY ||
    '';

  let source = 'env';
  if (!supabaseUrl || !supabaseAnonKey) {
    const builtIn = tryLoadBuiltInSupabaseCreds();
    if (builtIn) {
      supabaseUrl = builtIn.url;
      supabaseAnonKey = builtIn.anonKey;
      source = `built-in (${builtIn.source})`;
    }
  }

  console.log('Supabase check');
  console.log(`- source: ${source}`);
  console.log(`- URL: ${supabaseUrl ? mask(supabaseUrl) : '(missing)'}`);
  console.log(
    `- ANON key: ${supabaseAnonKey ? `${mask(supabaseAnonKey)} (sha256:${sha256_8(supabaseAnonKey)})` : '(missing)'}`,
  );

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      'FAIL: Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local, or keep PROVIDED_URL/PROVIDED_ANON_KEY in lib/supabaseClient.ts',
    );
    process.exitCode = 1;
    return;
  }

  const healthUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`;
  const restUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/`;

  const headers = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  };

  try {
    const healthRes = await fetch(healthUrl, { headers });
    const healthText = await healthRes.text();
    console.log(`- /auth/v1/health: ${healthRes.status} ${healthRes.ok ? 'OK' : 'NOT OK'}`);
    if (!healthRes.ok) {
      console.log(`  body: ${healthText.slice(0, 300)}`);
    }
  } catch (e) {
    console.error('FAIL: fetch /auth/v1/health failed');
    console.error(e);
    process.exitCode = 1;
    return;
  }

  try {
    const restRes = await fetch(restUrl, { method: 'GET', headers });
    const restText = await restRes.text();
    // /rest/v1/ обычно отвечает 404/"Not Found" без указания таблицы,
    // но для нас важно, что сетевой коннект есть и Supabase отвечает.
    console.log(`- /rest/v1/: ${restRes.status} (response received)`);
    console.log(`  body: ${restText.slice(0, 120).replace(/\s+/g, ' ')}`);
  } catch (e) {
    console.error('FAIL: fetch /rest/v1/ failed');
    console.error(e);
    process.exitCode = 1;
    return;
  }

  // Optional: lightweight supabase-js check
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.log(`- supabase-js query (profiles): ERROR (${error.code || 'no_code'}) ${error.message}`);
      console.log('  note: this can be expected if table does not exist or RLS blocks anon access.');
    } else {
      console.log('- supabase-js query (profiles): OK');
    }
  } catch (e) {
    console.log('- supabase-js query: SKIPPED (exception)');
    console.error(e);
  }

  console.log('DONE');
};

main().catch((e) => {
  console.error('FAIL: unexpected error');
  console.error(e);
  process.exitCode = 1;
});
