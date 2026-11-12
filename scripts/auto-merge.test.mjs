import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { URL } from 'node:url';
import { ciCurrent, denial, requiredSteps } from './auto-merge.mjs';

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
    head_sha: 'abc',
    head_branch: 'feature/phase-2a',
  },
  pr: {
    state: 'open',
    draft: false,
    base: { ref: 'main', repo: { id: 1 } },
    head: { sha: 'abc', ref: 'feature/phase-2a', repo: { id: 1 } },
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

test('complete acceptance and all CI steps are eligible', () =>
  assert.equal(denial(eligible()), null));
test('newer pending CI run blocks merge', () =>
  assert.equal(
    ciCurrent(
      { id: 10, run_attempt: 1, head_branch: 'feature/phase-2a' },
      { id: 10, run_attempt: 1, status: 'completed', conclusion: 'success' },
      [{ id: 11, head_branch: 'feature/phase-2a', status: 'in_progress' }],
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
