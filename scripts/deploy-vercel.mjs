// Deploy straight from this workspace to Vercel production, without going
// through GitHub. Zero dependencies: uses the globally installed Vercel CLI.
//
// Setup (one time):
//   Vercel dashboard -> Account Settings -> Tokens -> Create
//   Paste the token into .secrets/vercel-token.txt (git-ignored)
//
// Usage:
//   node scripts/deploy-vercel.mjs
//   node scripts/deploy-vercel.mjs --prebuilt   # upload local .vercel/output
//
// The token is passed via VERCEL_TOKEN env var (never a CLI argument, never
// printed). --no-wait returns as soon as the upload is accepted, so this
// command does not block on Vercel's build. Check deployment status in the
// Vercel dashboard or with `vercel ls` afterwards.

import { existsSync, readFileSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tokenFile = path.join(root, '.secrets', 'vercel-token.txt');

if (!existsSync(tokenFile)) {
  console.error('Missing .secrets/vercel-token.txt — see the header of this file.');
  process.exit(2);
}
const token = readFileSync(tokenFile, 'utf8').trim();
if (!token || token.startsWith('PASTE_')) {
  console.error('Placeholder token — paste a real Vercel token into .secrets/vercel-token.txt');
  process.exit(2);
}

// Extra CLI flags may be appended, e.g. --prebuilt. Reject token overrides.
const extra = process.argv.slice(2);
if (extra.some((a) => a.includes('token'))) {
  console.error('Do not pass token flags; the token is read from .secrets/.');
  process.exit(2);
}

// ---------------------------------------------------------------------------
// CI gate. GitHub branch protection cannot guard this path: `vercel deploy`
// uploads the workspace directly and never goes through a GitHub check run.
// Refuse to push production if the HEAD commit's `verify` job failed.
// A missing / still-running run is reported but does not block, because a
// just-pushed commit has no result yet.
// ---------------------------------------------------------------------------
const ALLOW_SKIP_CI = process.env.SKIP_CI_GATE === '1';
if (!ALLOW_SKIP_CI) {
  try {
    const sha = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    const conclusion = execFileSync(
      'gh',
      [
        'api',
        `repos/2046-RAG/TGWS-Dev/actions/runs?head_sha=${sha}&per_page=1`,
        '--jq',
        '.workflow_runs[0].conclusion // "none"',
      ],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();

    console.log(`CI gate: HEAD ${sha.slice(0, 8)} verify = ${conclusion}`);

    if (conclusion === 'failure' || conclusion === 'timed_out' || conclusion === 'cancelled') {
      console.error('CI failed for this commit. Deployment blocked.');
      console.error('Fix the failure, or set SKIP_CI_GATE=1 to override deliberately.');
      process.exit(3);
    }
  } catch {
    console.warn('CI gate: could not query GitHub (gh missing/offline). Continuing without gate.');
  }
}

const args = ['deploy', '--prod', '--yes', '--no-wait', ...extra];
console.log('> vercel ' + args.join(' '));

const child = spawn('vercel', args, {
  cwd: root, // has .vercel/project.json with rootDirectory = tgws
  // Node's built-in fetch ignores HTTP(S)_PROXY unless explicitly opted in.
  // In proxied environments `vercel deploy` can otherwise fail mid-upload
  // with "fetch failed" even though plain HTTPS requests work.
  env: {
    ...process.env,
    VERCEL_TOKEN: token,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, '--use-env-proxy'].filter(Boolean).join(' '),
  },
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true, // Windows needs shell to resolve the global .cmd shim
});

const scrub = (s) => s.split(token).join('***');
child.stdout.on('data', (d) => process.stdout.write(scrub(d.toString())));
child.stderr.on('data', (d) => process.stderr.write(scrub(d.toString())));
child.on('error', (e) => {
  console.error('Failed to start Vercel CLI:', scrub(String(e.message)));
  process.exit(1);
});
child.on('close', (code) => {
  console.log('\nDeploy command exit=' + code + ' (upload accepted; build continues on Vercel)');
  process.exit(code ?? 1);
});
