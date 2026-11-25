import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

export async function recoverGateway({
  env,
  ownerFile,
  childRunId,
  run,
  root,
  compose,
}) {
  assert.match(childRunId, /^[0-9a-f]{32}$/);
  const project = `senkom-e2e-${childRunId}`;
  let owner;
  try {
    owner = JSON.parse(await readFile(ownerFile, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (
    owner &&
    (owner.runId !== childRunId ||
      owner.project !== project ||
      !Number.isSafeInteger(owner.childPid) ||
      owner.childPid < 1)
  )
    throw new Error('Gateway ownership record mismatch.');
  if (owner) {
    let active = false;
    try {
      process.kill(owner.childPid, 0);
      active = true;
    } catch (error) {
      if (error.code !== 'ESRCH') throw error;
    }
    if (active) throw new Error('Gateway owner is still active.');
  }
  const composeArgs = (args) => [
    ...(env.COMPOSE_PATH ? [] : ['compose']),
    '-p',
    project,
    '-f',
    compose,
    ...args,
  ];
  const composeCommand = env.COMPOSE_PATH || env.DOCKER_PATH || 'docker';
  const ids = (await run(composeCommand, composeArgs(['ps', '-aq']), root, env))
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!owner && ids.length)
    throw new Error('Gateway project exists without ownership record.');
  for (const id of ids) {
    const label = (
      await run(
        env.DOCKER_PATH || 'docker',
        [
          'inspect',
          id,
          '--format',
          '{{ index .Config.Labels "com.docker.compose.project" }}',
        ],
        root,
        env,
      )
    ).trim();
    if (label !== project)
      throw new Error('Foreign gateway container in test project.');
  }
  if (owner) {
    const pid = owner.publisherPid == null ? null : Number(owner.publisherPid);
    if (pid !== null && (!Number.isSafeInteger(pid) || pid < 1))
      throw new Error('Invalid publisher identity.');
    const recorded =
      pid === null
        ? ''
        : `$recorded = Get-CimInstance Win32_Process -Filter 'ProcessId = ${pid}'; if ($recorded -and (-not [string]::Equals($recorded.ExecutablePath, $expected, [StringComparison]::OrdinalIgnoreCase) -or -not $recorded.CommandLine.Contains($secret))) { throw 'Foreign publisher process.' };`;
    const script = `$expected = [IO.Path]::GetFullPath($env:FFMPEG_PATH); $secret = $env:SENKOM_GATEWAY_PUBLISH_PASSWORD; if (-not $secret) { throw 'Publisher identity unavailable.' }; ${recorded} $owned = @(Get-CimInstance Win32_Process | Where-Object { [string]::Equals($_.ExecutablePath, $expected, [StringComparison]::OrdinalIgnoreCase) -and $_.CommandLine -and $_.CommandLine.Contains($secret) -and $_.CommandLine.Contains('/lab') }); foreach ($p in $owned) { Stop-Process -Id $p.ProcessId -ErrorAction Stop }; foreach ($p in $owned) { for ($i = 0; $i -lt 50 -and (Get-Process -Id $p.ProcessId -ErrorAction SilentlyContinue); $i++) { Start-Sleep -Milliseconds 100 }; if (Get-Process -Id $p.ProcessId -ErrorAction SilentlyContinue) { throw 'Publisher remains active.' } }`;
    await run('powershell', ['-NoProfile', '-Command', script], root, env);
  }
  if (owner)
    await run(composeCommand, composeArgs(['down']), root, env, 40_000);
  assert.equal(
    (await run(composeCommand, composeArgs(['ps', '-aq']), root, env)).trim(),
    '',
    'Owned gateway containers remain.',
  );
  assert.equal(
    (
      await run(
        env.DOCKER_PATH || 'docker',
        [
          'network',
          'ls',
          '--filter',
          `label=com.docker.compose.project=${project}`,
          '-q',
        ],
        root,
        env,
      )
    ).trim(),
    '',
    'Owned gateway networks remain.',
  );
}
