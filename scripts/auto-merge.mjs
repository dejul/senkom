/* global fetch */
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const repository = 'dejul/senkom';
const workflowId = 414398729; // Existing trusted .github/workflows/ci.yml.
export const requiredSteps = [
  'Composer validate',
  'Composer audit',
  'Backend PHPUnit',
  'Disposable MySQL integration',
  'Zero skipped mandatory tests',
  'HTTP smoke',
  'Frontend tests',
  'Schema tests',
  'PHP lint',
  'ESLint',
  'Prettier',
  'Typecheck',
  'Build',
  'Electron smoke',
  'OpenAPI contract',
  'NPM audit',
];
const protectedPaths =
  /^(?:\.github\/|AGENTS\.md$|docs\/git-workflow\.md$|scripts\/auto-merge(?:\.test)?\.mjs$)/;
const privatePaths = /(?:^|\/)(?:\.env(?:\.|$)|[^/]+\.(?:pem|key|p12|pfx)$)/i;
const secretPattern =
  /-----BEGIN [^-]*PRIVATE KEY-----|\b(?:github_pat_|gh[opusr]_|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,}|xox[baprs]-|sk_live_)[0-9A-Za-z_-]+/;

export function ciCurrent(run, current, runs) {
  return (
    current.id === run.id &&
    current.run_attempt === run.run_attempt &&
    current.status === 'completed' &&
    current.conclusion === 'success' &&
    !runs.some(
      (other) => other.head_branch === run.head_branch && other.id > run.id,
    )
  );
}

export function denial({ event, run, pr, jobs, files, evidence }) {
  if (
    event.repository?.full_name !== repository ||
    run.repository?.id !== event.repository.id ||
    run.head_repository?.id !== event.repository.id ||
    run.workflow_id !== workflowId ||
    run.path !== '.github/workflows/ci.yml' ||
    run.event !== 'pull_request' ||
    run.status !== 'completed' ||
    run.conclusion !== 'success'
  )
    return 'Untrusted or unsuccessful CI run';
  if (
    !pr ||
    pr.state !== 'open' ||
    pr.draft ||
    pr.base?.ref !== 'main' ||
    pr.base?.repo?.id !== event.repository.id ||
    pr.head?.repo?.id !== event.repository.id ||
    pr.head?.sha !== run.head_sha ||
    pr.head?.ref !== run.head_branch ||
    pr.mergeable !== true ||
    pr.mergeable_state !== 'clean'
  )
    return 'PR head, base, or mergeability changed';
  const marker = pr.body?.match(
    /^Phase-Final-Acceptance: ([1-9][0-9]*[ABC]?)$/m,
  );
  if (
    !marker ||
    !pr.labels?.some((label) => label.name === 'phase-final-acceptance')
  )
    return 'Missing final acceptance marker';
  const phase = marker[1];
  const number = phase.match(/^\d+/)[0];
  const approvalStatus = evidence?.approval?.match(/^Status:.*$/m)?.[0];
  const checkpointStatus = evidence?.checkpoint?.match(
    /^Tanggal:.*Status:.*$/m,
  )?.[0];
  const headings = [
    ...(evidence?.verification ?? '').matchAll(
      new RegExp(`^## Phase ${phase} Final Acceptance[^\\n]*$`, 'gm'),
    ),
  ];
  const finalSection =
    headings.length === 1
      ? evidence.verification
          .slice(headings[0].index + headings[0][0].length)
          .split(/^## /m, 1)[0]
      : '';
  if (
    approvalStatus !== `Status: **Phase ${phase} COMPLETE**` ||
    !new RegExp(
      `^Tanggal: [^\\n]*\\. Status: \\*\\*Phase ${phase} COMPLETE\\*\\*`,
      'm',
    ).test(checkpointStatus ?? '') ||
    finalSection.match(/^Status:.*$/m)?.[0] !== 'Status: **COMPLETE**'
  )
    return 'Final acceptance evidence incomplete';
  if (evidence.number !== number) return 'Wrong evidence phase';
  if (
    jobs.length !== 1 ||
    jobs[0].name !== 'checks' ||
    jobs[0].conclusion !== 'success'
  )
    return 'CI job missing or skipped';
  for (const name of requiredSteps) {
    const matching = jobs[0].steps?.filter((step) => step.name === name) ?? [];
    if (matching.length !== 1 || matching[0].conclusion !== 'success')
      return `Required CI step missing, failed, or skipped: ${name}`;
  }
  if (!files.length || files.length !== pr.changed_files)
    return 'PR file list incomplete';
  for (const file of files) {
    if (protectedPaths.test(file.filename))
      return 'Workflow or merge policy changed';
    if (privatePaths.test(file.filename) || typeof file.patch !== 'string')
      return 'Private or unreviewable file';
    const lines = file.patch.split('\n');
    if (
      lines.filter((line) => line.startsWith('+') && !line.startsWith('+++'))
        .length !== file.additions ||
      lines.filter((line) => line.startsWith('-') && !line.startsWith('---'))
        .length !== file.deletions
    )
      return 'PR patch incomplete';
    if (
      lines.some(
        (line) =>
          line.startsWith('+') &&
          !line.startsWith('+++') &&
          secretPattern.test(line),
      )
    )
      return 'Secret audit failed';
  }
  return null;
}

async function api(path, options = {}) {
  const response = await fetch(
    `https://api.github.com/repos/${repository}${path}`,
    {
      ...options,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...options.headers,
      },
    },
  );
  if (!response.ok) throw new Error(`GitHub API ${response.status} at ${path}`);
  return response.json();
}

async function pages(path, key) {
  const results = [];
  for (let page = 1; ; page++) {
    const data = await api(
      `${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`,
    );
    const batch = key ? data[key] : data;
    results.push(...batch);
    if (batch.length < 100) return results;
  }
}

async function content(path, sha) {
  const data = await api(`/contents/${path}?ref=${sha}`);
  if (data.encoding !== 'base64')
    throw new Error(`Unreviewable evidence: ${path}`);
  return Buffer.from(data.content, 'base64').toString('utf8');
}

async function latestCi(run) {
  const current = await api(`/actions/runs/${run.id}`);
  const recent = await api(
    `/actions/workflows/${workflowId}/runs?event=pull_request&head_sha=${run.head_sha}&per_page=100`,
  );
  return ciCurrent(run, current, recent.workflow_runs);
}

async function main() {
  if (
    !process.env.GITHUB_ACTIONS ||
    !process.env.GITHUB_TOKEN ||
    !process.env.GITHUB_EVENT_PATH
  )
    throw new Error('Trusted GitHub Actions context required');
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const run = event.workflow_run;
  if (!run || run.event !== 'pull_request' || run.conclusion !== 'success')
    return console.log('No eligible CI run');
  const candidates = await pages(
    `/pulls?state=open&head=${encodeURIComponent(`${event.repository.owner.login}:${run.head_branch}`)}`,
    null,
  );
  const matching = candidates.filter((pr) => pr.head.sha === run.head_sha);
  if (matching.length !== 1) return console.log('No unique open PR at CI head');
  let pr = await api(`/pulls/${matching[0].number}`);
  for (let attempt = 0; pr.mergeable === null && attempt < 5; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    pr = await api(`/pulls/${pr.number}`);
  }
  const marker = pr.body?.match(
    /^Phase-Final-Acceptance: ([1-9][0-9]*[ABC]?)$/m,
  );
  const number = marker?.[1].match(/^\d+/)[0];
  const evidence = number
    ? {
        number,
        approval: await content(
          `docs/phase-${number}-approval.md`,
          run.head_sha,
        ),
        checkpoint: await content(
          `docs/phase-${number}-checkpoint.md`,
          run.head_sha,
        ),
        verification: await content(
          `docs/phase-${number}-verification.md`,
          run.head_sha,
        ),
      }
    : null;
  const jobs = await pages(`/actions/runs/${run.id}/jobs`, 'jobs');
  const files = await pages(`/pulls/${pr.number}/files`, null);
  const reason = denial({ event, run, pr, jobs, files, evidence });
  if (reason) return console.log(`Auto-merge blocked: ${reason}`);
  if (!(await latestCi(run)))
    return console.log('Auto-merge blocked: newer or pending CI run');
  const latest = await api(`/pulls/${pr.number}`);
  if (
    latest.head.sha !== run.head_sha ||
    latest.base.ref !== 'main' ||
    latest.mergeable !== true ||
    latest.mergeable_state !== 'clean'
  )
    return console.log('Auto-merge blocked: PR changed after checks');
  if (!(await latestCi(run)))
    return console.log('Auto-merge blocked: CI changed before merge');
  const result = await api(`/pulls/${pr.number}/merge`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sha: run.head_sha, merge_method: 'merge' }),
  });
  const mainRef = await api('/git/ref/heads/main');
  if (!result.merged || mainRef.object.sha !== result.sha)
    throw new Error('Merge or main SHA verification failed');
  console.log(`Merged PR #${pr.number} at ${result.sha}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
