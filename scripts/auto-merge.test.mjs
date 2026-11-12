import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { URL } from 'node:url';
import { ciCurrent, claim, denial, requiredSteps } from './auto-merge.mjs';

const sha = 'a'.repeat(40);

test('Windows CI declares every trusted required step once', () => {
  const workflow = readFileSync(
    new URL('../.github/workflows/ci.yml', import.meta.url),
    'utf8',
  );
  const names = [...workflow.matchAll(/^\s+- name: (.+)$/gm)].map((match) =>
    match[1].trim(),
  );
  for (const name of requiredSteps)
    assert.equal(names.filter((entry) => entry === name).length, 1, name);
});

const eligible = () => ({
  event: { repository: { id: 1, full_name: 'dejul/senkom' } },
  run: {
    repository: { id: 1 },
    head_repository: { id: 1 },
    workflow_id: 414398729,
    path: '.github/workflows/ci.yml',
    event: 'pull_request',
    status: 'completed',
    conclusion: 'success',
    head_sha: sha,
    head_branch: 'feature/phase-2a',
  },
  pr: {
    state: 'open',
    draft: false,
    base: { ref: 'main', sha: 'b'.repeat(40), repo: { id: 1 } },
    head: { sha, ref: 'feature/phase-2a', repo: { id: 1 } },
    mergeable: true,
    mergeable_state: 'clean',
    changed_files: 1,
    body: 'Phase-Final-Acceptance: 2A',
    labels: [{ name: 'phase-final-acceptance' }],
  },
  jobs: [
    {
      name: 'checks',
      conclusion: 'success',
      steps: requiredSteps.map((name) => ({ name, conclusion: 'success' })),
    },
  ],
  files: [
    {
      filename: 'apps/api/app/Example.php',
      status: 'modified',
      additions: 1,
      deletions: 0,
      patch: '@@ -1 +1 @@\n+safe',
    },
  ],
  evidence: {
    number: '2',
    approval: 'Status: **Phase 2A COMPLETE**',
    checkpoint: 'Tanggal: 2026-11-11. Status: **Phase 2A COMPLETE**',
    verification:
      '## Phase 2A Final Acceptance — Database dan API\nStatus: **COMPLETE**\n',
  },
});

const verified = (kind = 'Micro-Batch') => {
  const x = eligible();
  const id = kind === 'Fix' ? 'map-render' : '2B-01a';
  x.pr.body = `Verified-${kind}: ${id}\nVerified-Commit: ${sha}\nVerified-Evidence: docs/phase-2-verification.md`;
  x.pr.labels = [];
  x.pr.head.ref = kind === 'Fix' ? 'fix/map-render' : 'feature/phase-2b';
  x.run.head_branch = x.pr.head.ref;
  x.pr.changed_files = 2;
  x.files.push({
    filename: 'docs/phase-2-verification.md',
    status: 'modified',
    additions: 1,
    deletions: 0,
    patch: '@@ -1 +1 @@\n+Status: **VERIFIED**',
  });
  x.evidence = {
    path: 'docs/phase-2-verification.md',
    baseVerification: '',
    verification:
      kind === 'Fix'
        ? '## Verified Fix: map-render\nStatus: **VERIFIED**\n'
        : '## 2B-01a — API client\nStatus: **VERIFIED** (2026-11-12)\n',
  };
  return x;
};

test('complete acceptance and all CI steps are eligible', () =>
  assert.equal(denial(eligible()), null));
test('verified ordinary fix and all CI steps are eligible', () =>
  assert.equal(denial(verified('Fix')), null));
test('verified micro-batch and all CI steps are eligible', () =>
  assert.equal(denial(verified()), null));
test('new test file may accompany verified micro-batch', () => {
  const x = verified();
  x.files.push({
    filename: 'tests/new.test.ts',
    status: 'added',
    additions: 1,
    deletions: 0,
    patch: '@@ -0,0 +1 @@\n+test',
  });
  x.pr.changed_files = x.files.length;
  assert.equal(denial(x), null);
});
test('BOM before final marker does not hide valid evidence', () => {
  const x = eligible();
  x.pr.body = '\uFEFF' + x.pr.body;
  assert.equal(claim(x.pr)?.kind, 'phase');
  assert.equal(denial(x), null);
});
test('newer pending CI run blocks merge', () =>
  assert.equal(
    ciCurrent(
      { id: 10, run_attempt: 1, head_branch: 'feature/phase-2a' },
      { id: 10, run_attempt: 1, status: 'completed', conclusion: 'success' },
      [{ id: 11, head_branch: 'feature/phase-2a', status: 'in_progress' }],
    ),
    false,
  ));
test('rerun attempt change blocks stale CI', () =>
  assert.equal(
    ciCurrent(
      { id: 10, run_attempt: 1, head_branch: 'fix/map-render' },
      { id: 10, run_attempt: 2, status: 'in_progress', conclusion: null },
      [],
    ),
    false,
  ));
for (const [name, change] of [
  [
    'CI failure',
    (x) => {
      x.run.conclusion = 'failure';
    },
  ],
  [
    'CI pending',
    (x) => {
      x.run.status = 'in_progress';
      x.run.conclusion = null;
    },
  ],
  [
    'stale workflow or SHA',
    (x) => {
      x.run.head_sha = 'c'.repeat(40);
    },
  ],
  [
    'mandatory step skipped',
    (x) => {
      x.jobs[0].steps[0].conclusion = 'skipped';
    },
  ],
  [
    'mandatory step pending',
    (x) => {
      x.jobs[0].steps[0].conclusion = null;
    },
  ],
  [
    'extra CI step skipped',
    (x) => {
      x.jobs[0].steps.push({ name: 'Optional', conclusion: 'skipped' });
    },
  ],
  ...['Backend PHPUnit', 'HTTP smoke', 'Composer audit'].map((step) => [
    step + ' failure',
    (x) => {
      x.jobs[0].steps.find((entry) => entry.name === step).conclusion =
        'failure';
    },
  ]),
  [
    'final acceptance WIP',
    (x) => {
      x.evidence.approval = 'Status: **Phase 2A WIP**';
    },
  ],
  [
    'final acceptance BLOCKED',
    (x) => {
      x.evidence.approval = 'Status: **Phase 2A BLOCKED**';
    },
  ],
  [
    'missing final label',
    (x) => {
      x.pr.labels = [];
    },
  ],
  [
    'PR head changed',
    (x) => {
      x.pr.head.sha = 'new';
    },
  ],
  [
    'secret audit failure',
    (x) => {
      x.files[0].patch =
        '@@ -1 +1 @@\n+' + 'github_pat_' + 'abcdefghijklmnopqrstuvwxyz';
    },
  ],
  [
    'fork PR',
    (x) => {
      x.pr.head.repo.id = 2;
    },
  ],
  [
    'merge conflict',
    (x) => {
      x.pr.mergeable = false;
      x.pr.mergeable_state = 'dirty';
    },
  ],
  [
    'workflow self-approval',
    (x) => {
      x.files[0].filename = '.github/workflows/auto-merge.yml';
    },
  ],
  [
    'CI harness self-approval',
    (x) => {
      x.files[0].filename = 'scripts/ci-mysql.ps1';
    },
  ],
  [
    'dependency gate self-approval',
    (x) => {
      x.files[0].filename = 'package.json';
    },
  ],
  [
    'workspace dependency gate self-approval',
    (x) => {
      x.files[0].filename = 'apps/admin-web/package.json';
    },
  ],
  [
    'generated contract self-approval',
    (x) => {
      x.files[0].filename = 'docs/openapi.json';
    },
  ],
  [
    'auth policy self-approval',
    (x) => {
      x.files[0].filename = 'apps/api/app/Http/Middleware/AdminCsrf.php';
    },
  ],
  [
    'new auth file self-approval',
    (x) => {
      x.files[0].filename = 'apps/admin-web/src/auth-session.ts';
    },
  ],
  [
    'renamed workflow self-approval',
    (x) => {
      x.files[0].status = 'renamed';
      x.files[0].previous_filename = '.github/workflows/auto-merge.yml';
    },
  ],
  [
    'policy self-approval',
    (x) => {
      x.files[0].filename = 'AGENTS.md';
    },
  ],
  [
    'missing mandatory step',
    (x) => {
      x.jobs[0].steps.pop();
    },
  ],
  [
    'incomplete patch',
    (x) => {
      x.files[0].additions = 2;
    },
  ],
])
  test(name + ' blocks merge', () => {
    const x = eligible();
    change(x);
    assert.ok(denial(x));
  });

for (const [name, change] of [
  [
    'WIP evidence',
    (x) => (x.evidence.verification = '## 2B-01a\nStatus: **WIP**'),
  ],
  [
    'BLOCKED evidence',
    (x) => (x.evidence.verification = '## 2B-01a\nStatus: **BLOCKED**'),
  ],
  [
    'wrong evidence section',
    (x) => (x.evidence.verification = '## 2B-01b\nStatus: **VERIFIED**'),
  ],
  [
    'duplicated evidence section',
    (x) =>
      (x.evidence.verification =
        '## 2B-01a\nStatus: **VERIFIED**\n## 2B-01a — copy\nStatus: **VERIFIED**'),
  ],
  [
    'VERIFIED only outside target section',
    (x) =>
      (x.evidence.verification =
        '## 2B-01a\nStatus: **WIP**\n## 2B-01b\nStatus: **VERIFIED**'),
  ],
  [
    'reused VERIFIED evidence from main',
    (x) => (x.evidence.baseVerification = x.evidence.verification),
  ],
  ['forged docs-only claim', (x) => (x.files = [x.files[1]])],
  [
    'stale verified SHA',
    (x) => (x.pr.body = x.pr.body.replace(sha, 'c'.repeat(40))),
  ],
  ['wrong branch', (x) => (x.pr.head.ref = 'feature/phase-3')],
  [
    'conflicting phase label',
    (x) => (x.pr.labels = [{ name: 'phase-final-acceptance' }]),
  ],
  ['fork', (x) => (x.pr.head.repo.id = 2)],
  [
    'missing evidence change',
    (x) => (x.files[1].filename = 'docs/phase-3-verification.md'),
  ],
  ['ambiguous marker', (x) => (x.pr.body += '\nPhase-Final-Acceptance: 2A')],
  [
    'modified existing test',
    (x) => (x.files[0].filename = 'tests/old.test.ts'),
  ],
  [
    'admin session client change',
    (x) => (x.files[0].filename = 'apps/admin-web/src/api.ts'),
  ],
  [
    'secret in source',
    (x) =>
      (x.files[0].patch =
        '@@ -1 +1 @@\n+' + 'github_pat_' + 'abcdefghijklmnopqrstuvwxyz'),
  ],
])
  test(`verified ${name} blocks merge`, () => {
    const x = verified();
    change(x);
    x.pr.changed_files = x.files.length;
    assert.ok(denial(x));
  });
