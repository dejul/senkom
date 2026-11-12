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
const protectedPaths = [
  /^\.github\//,
  /^AGENTS\.md$/,
  /^docs\/(?:git-workflow\.md|openapi\.json)$/,
  /^scripts\//,
  /^packages\/(?:shared-types\/api\.generated\.d\.ts|map-schema\/schema\/)/,
  /(?:^|\/)(?:package(?:-lock)?\.json|tsconfig(?:\.[^/]+)?\.json|vite(?:\.[^/]+)?\.config\.[cm]?[jt]s)$/,
  /^(?:vitest\.config\.ts|eslint\.config\.[^/]+|\.(?:nvmrc|node-version|npmrc|prettierrc\.json|prettierignore|gitignore|gitattributes))$/,
  /^apps\/api\/(?:composer\.(?:json|lock)|phpunit\.xml|bootstrap\/|config\/|routes\/|tools\/|database\/|app\/Http\/Middleware\/|app\/Http\/Controllers\/AuthController\.php|app\/Models\/User\.php)/,
  /^apps\/desktop\/electron\/(?:main|preload|security|admin)\.ts$/,
  /^apps\/admin-web\/src\/api\.ts$/,
  /(?:^|\/)[^/]*(?:auth|session|csrf|token|permission|access|security|login|logout)[^/]*\.[^/]+$/i,
];
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

export function claim(pr) {
  const body = (pr.body ?? '').replace(/^\uFEFF/, '');
  const phase = [
    ...body.matchAll(/^Phase-Final-Acceptance: ([1-9][0-9]*[ABC]?)$/gm),
  ];
  const verified = [
    ...body.matchAll(/^Verified-(Fix|Micro-Batch): ([a-zA-Z0-9-]+)$/gm),
  ];
  if (phase.length + verified.length !== 1) return null;
  if (phase.length) {
    const id = phase[0][1];
    return { kind: 'phase', id, number: id.match(/^\d+/)[0] };
  }
  const kind = verified[0][1] === 'Fix' ? 'fix' : 'micro-batch';
  const id = verified[0][2];
  if (
    (kind === 'fix' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) ||
    (kind === 'micro-batch' && !/^\d+(?:[A-C])?-\d+[a-z]$/.test(id))
  )
    return null;
  const commits = [...body.matchAll(/^Verified-Commit: ([0-9a-f]{40})$/gm)];
  const paths = [
    ...body.matchAll(
      /^Verified-Evidence: (docs\/phase-([1-9]\d*)-verification\.md)$/gm,
    ),
  ];
  if (commits.length !== 1 || paths.length !== 1) return null;
  const number = paths[0][2];
  if (kind === 'micro-batch' && id.match(/^\d+/)[0] !== number) return null;
  return { kind, id, number, sha: commits[0][1], path: paths[0][1] };
}

function verifiedSection(text, work) {
  const heading =
    work.kind === 'fix' ? `## Verified Fix: ${work.id}` : `## ${work.id}`;
  const sections = [...text.matchAll(/^## [^\n]+$/gm)].filter((match) =>
    work.kind === 'fix'
      ? match[0] === heading
      : match[0] === heading || match[0].startsWith(`${heading} `),
  );
  if (sections.length !== 1) return '';
  return text
    .slice(sections[0].index + sections[0][0].length)
    .split(/^## /m, 1)[0];
}

function isVerified(text, work) {
  const status = verifiedSection(text, work).match(/^Status:.*$/m)?.[0] ?? '';
  return /^Status: \*\*VERIFIED\*\*(?:\s|$)/.test(status);
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
  const work = claim(pr);
  if (!work) return 'Missing or ambiguous verification claim';
  if (work.kind === 'phase') {
    if (!pr.labels?.some((label) => label.name === 'phase-final-acceptance'))
      return 'Missing final acceptance label';
    const approvalStatus = evidence?.approval?.match(/^Status:.*$/m)?.[0];
    const checkpointStatus = evidence?.checkpoint?.match(
      /^Tanggal:.*Status:.*$/m,
    )?.[0];
    const headings = [
      ...(evidence?.verification ?? '').matchAll(
        new RegExp(`^## Phase ${work.id} Final Acceptance[^\\n]*$`, 'gm'),
      ),
    ];
    const finalSection =
      headings.length === 1
        ? evidence.verification
            .slice(headings[0].index + headings[0][0].length)
            .split(/^## /m, 1)[0]
        : '';
    if (
      approvalStatus !== `Status: **Phase ${work.id} COMPLETE**` ||
      !new RegExp(
        `^Tanggal: [^\\n]*\\. Status: \\*\\*Phase ${work.id} COMPLETE\\*\\*`,
        'm',
      ).test(checkpointStatus ?? '') ||
      finalSection.match(/^Status:.*$/m)?.[0] !== 'Status: **COMPLETE**' ||
      evidence.number !== work.number
    )
      return 'Final acceptance evidence incomplete';
  } else {
    if (pr.labels?.some((label) => label.name === 'phase-final-acceptance'))
      return 'Conflicting final acceptance label';
    const branch =
      work.kind === 'fix'
        ? /^(?:fix|hotfix)\/[a-z0-9][a-z0-9-/]*$/.test(pr.head.ref)
        : pr.head.ref ===
          `feature/phase-${work.id.match(/^\d+(?:[A-C])?/)[0].toLowerCase()}`;
    if (!branch) return 'Wrong branch for verified work';
    if (work.sha !== run.head_sha) return 'Verification commit SHA mismatch';
    if (
      evidence?.path !== work.path ||
      !isVerified(evidence.verification ?? '', work) ||
      isVerified(evidence.baseVerification ?? '', work)
    )
      return 'Verified evidence missing or incomplete';
  }
  if (
    jobs.length !== 1 ||
    jobs[0].name !== 'checks' ||
    jobs[0].conclusion !== 'success'
  )
    return 'CI job missing or skipped';
  if (jobs[0].steps?.some((step) => step.conclusion !== 'success'))
    return 'CI step failed, pending, or skipped';
  for (const name of requiredSteps) {
    const matching = jobs[0].steps?.filter((step) => step.name === name) ?? [];
    if (matching.length !== 1 || matching[0].conclusion !== 'success')
      return `Required CI step missing, failed, or skipped: ${name}`;
  }
  if (!files.length || files.length !== pr.changed_files)
    return 'PR file list incomplete';
  for (const file of files) {
    if (
      [file.filename, file.previous_filename]
        .filter(Boolean)
        .some((name) => protectedPaths.some((pattern) => pattern.test(name))) ||
      ([file.filename, file.previous_filename]
        .filter(Boolean)
        .some((name) => /(?:^|\/)tests\//.test(name)) &&
        file.status !== 'added')
    )
      return 'Security-sensitive file requires manual merge';
    if (
      [file.filename, file.previous_filename]
        .filter(Boolean)
        .some((name) => privatePaths.test(name)) ||
      typeof file.patch !== 'string'
    )
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
  if (
    work.kind !== 'phase' &&
    (!files.some((file) => file.filename === work.path) ||
      !files.some(
        (file) =>
          !file.filename.startsWith('docs/') &&
          !/(?:^|\/)tests\//.test(file.filename),
      ))
  )
    return 'Verified work requires changed evidence and source';
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

async function content(path, sha, optional = false) {
  let data;
  try {
    data = await api(`/contents/${path}?ref=${sha}`);
  } catch (error) {
    if (optional && error.message.startsWith('GitHub API 404 at /contents/'))
      return '';
    throw error;
  }
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
  const work = claim(pr);
  const evidence =
    work?.kind === 'phase'
      ? {
          number: work.number,
          approval: await content(
            `docs/phase-${work.number}-approval.md`,
            run.head_sha,
          ),
          checkpoint: await content(
            `docs/phase-${work.number}-checkpoint.md`,
            run.head_sha,
          ),
          verification: await content(
            `docs/phase-${work.number}-verification.md`,
            run.head_sha,
          ),
        }
      : work
        ? {
            path: work.path,
            verification: await content(work.path, run.head_sha),
            baseVerification: await content(work.path, pr.base.sha, true),
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
    latest.base.sha !== pr.base.sha ||
    denial({ event, run, pr: latest, jobs, files, evidence })
  )
    return console.log('Auto-merge blocked: PR changed after checks');
  const mainBefore = await api('/git/ref/heads/main');
  if (mainBefore.object.sha !== pr.base.sha)
    return console.log('Auto-merge blocked: main changed after checks');
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
