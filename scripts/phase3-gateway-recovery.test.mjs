import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtemp, mkdir, rm, unlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { recoverGateway } from './phase3-gateway-recovery.mjs';

const root = resolve(fileURLToPath(new globalThis.URL('..', import.meta.url)));
const artifacts = join(root, '.artifacts');
const compose = join(root, 'infrastructure/media-gateway/compose.yaml');
const childRunId = randomBytes(16).toString('hex');
const project = `senkom-e2e-${childRunId}`;
await mkdir(artifacts, { recursive: true });
const directory = await mkdtemp(join(artifacts, 'gateway-recovery-test-'));
const ownerFile = join(directory, 'owner.json');
const env = {
  ...process.env,
  SENKOM_GATEWAY_RUN_ID: childRunId,
  SENKOM_GATEWAY_PROJECT: project,
  FFMPEG_PATH: process.execPath,
  SENKOM_GATEWAY_PUBLISH_PASSWORD: randomBytes(16).toString('hex'),
};
const run = (command, args, cwd = root, childEnv = env) =>
  new Promise((done, fail) => {
    const child = spawn(command, args, {
      cwd,
      env: childEnv,
      windowsHide: true,
    });
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk;
    });
    child.stderr.on('data', (chunk) => {
      output += chunk;
    });
    child.once('error', fail);
    child.once('close', (code) =>
      code === 0
        ? done(output)
        : fail(new Error(`${command} exited ${code}: ${output}`)),
    );
  });
const composeArgs = (args) => [
  'compose',
  '-p',
  project,
  '-f',
  compose,
  ...args,
];
let started = false;
let exitedPid;
let publisher;
try {
  assert.equal((await run('docker', composeArgs(['ps', '-aq']))).trim(), '');
  exitedPid = await new Promise((done, fail) => {
    const child = spawn(process.execPath, ['-e', ''], { windowsHide: true });
    child.once('error', fail);
    child.once('close', () => done(child.pid));
  });
  await writeFile(
    ownerFile,
    JSON.stringify({ runId: childRunId, project, childPid: exitedPid }),
  );
  await run('docker', composeArgs(['up', '-d']));
  started = true;
  assert.ok((await run('docker', composeArgs(['ps', '-q']))).trim());
  await unlink(ownerFile);
  await assert.rejects(
    recoverGateway({ env, ownerFile, childRunId, run, root, compose }),
    /without ownership record/,
  );
  assert.ok(
    (await run('docker', composeArgs(['ps', '-q']))).trim(),
    'Missing owner must preserve container.',
  );
  await writeFile(
    ownerFile,
    JSON.stringify({ runId: 'foreign', project, childPid: exitedPid }),
  );
  await assert.rejects(
    recoverGateway({ env, ownerFile, childRunId, run, root, compose }),
    /ownership record mismatch/,
  );
  assert.ok(
    (await run('docker', composeArgs(['ps', '-q']))).trim(),
    'Foreign record must preserve container.',
  );
  await writeFile(
    ownerFile,
    JSON.stringify({ runId: childRunId, project, childPid: process.pid }),
  );
  await assert.rejects(
    recoverGateway({ env, ownerFile, childRunId, run, root, compose }),
    /still active/,
  );
  assert.ok(
    (await run('docker', composeArgs(['ps', '-q']))).trim(),
    'Active owner must preserve container.',
  );
  await writeFile(
    ownerFile,
    JSON.stringify({
      runId: childRunId,
      project,
      childPid: exitedPid,
      publisherPid: process.pid,
    }),
  );
  await assert.rejects(
    recoverGateway({
      env: {
        ...env,
        FFMPEG_PATH: process.execPath,
        SENKOM_GATEWAY_PUBLISH_PASSWORD: 'foreign',
      },
      ownerFile,
      childRunId,
      run,
      root,
      compose,
    }),
    /Foreign publisher process/,
  );
  assert.ok(
    (await run('docker', composeArgs(['ps', '-q']))).trim(),
    'Foreign publisher must preserve container.',
  );
  await writeFile(
    ownerFile,
    JSON.stringify({ runId: childRunId, project, childPid: exitedPid }),
  );
  publisher = spawn(
    process.execPath,
    [
      '-e',
      'setInterval(() => {}, 1000)',
      '/lab',
      env.SENKOM_GATEWAY_PUBLISH_PASSWORD,
    ],
    { windowsHide: true, stdio: 'ignore' },
  );
  await new Promise((done, fail) => {
    publisher.once('spawn', done);
    publisher.once('error', fail);
  });
  const publisherClosed = new Promise((done) => publisher.once('close', done));
  await recoverGateway({ env, ownerFile, childRunId, run, root, compose });
  await publisherClosed;
  started = false;
  assert.equal((await run('docker', composeArgs(['ps', '-aq']))).trim(), '');
  let probes = 0;
  await assert.rejects(
    recoverGateway({
      env,
      ownerFile,
      childRunId,
      root,
      compose,
      run: async (_command, args) =>
        args.includes('ps') && args.includes('-aq') && ++probes === 2
          ? 'leftover'
          : '',
    }),
    /Owned gateway containers remain/,
  );
  process.stdout.write(
    'PASS actual owned Compose/publisher fallback, missing/foreign/active owner protection, cleanup verification failure.\n',
  );
} finally {
  if (started) {
    await writeFile(
      ownerFile,
      JSON.stringify({ runId: childRunId, project, childPid: exitedPid }),
    );
    await recoverGateway({ env, ownerFile, childRunId, run, root, compose });
  }
  if (publisher?.exitCode === null && publisher?.signalCode === null)
    publisher.kill('SIGKILL');
  assert.ok(
    directory.startsWith(artifacts + '\\') ||
      directory.startsWith(artifacts + '/'),
  );
  await rm(directory, { recursive: true, force: true });
}
