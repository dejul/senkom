import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  writeFile,
  unlink,
} from 'node:fs/promises';
import { randomBytes, createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const root = resolve(import.meta.dirname, '..');
const api = join(root, 'apps/api');
assert.ok(
  process.env.SENKOM_TEST_DB_PORT,
  'Set SENKOM_TEST_DB_PORT for an isolated MySQL server.',
);
const database = process.env.SENKOM_TEST_DB_DATABASE ?? 'senkom_test';
const secureCookie = process.env.SENKOM_TEST_SECURE_COOKIE === 'true';
const adminOrigin = 'http://127.0.0.1:5173';
assert.ok(
  database.endsWith('_test'),
  'Smoke requires a dedicated *_test database.',
);
const artifacts = join(root, '.artifacts');
await mkdir(artifacts, { recursive: true });
const directory = await mkdtemp(join(artifacts, 'phase2-run-'));
for (const path of [
  'framework/sessions',
  'framework/cache/data',
  'framework/views',
  'logs',
]) {
  await mkdir(join(directory, 'storage', path), { recursive: true });
}
const env = {
  ...process.env,
  APP_ENV: 'testing',
  APP_DEBUG: 'false',
  APP_KEY: 'base64:' + randomBytes(32).toString('base64'),
  DB_HOST: '127.0.0.1',
  DB_PORT: process.env.SENKOM_TEST_DB_PORT,
  DB_DATABASE: database,
  DB_USERNAME: process.env.SENKOM_TEST_DB_USERNAME ?? 'root',
  DB_PASSWORD: process.env.SENKOM_TEST_DB_PASSWORD ?? '',
  SENKOM_INFRASTRUCTURE_ENABLED: 'true',
  SENKOM_MAP_ID: 'smoke-' + randomBytes(8).toString('hex'),
  SESSION_DRIVER: 'file',
  SESSION_SECURE_COOKIE: String(secureCookie),
  SENKOM_ADMIN_ORIGINS: adminOrigin,
  CACHE_STORE: 'file',
  LARAVEL_STORAGE_PATH: join(directory, 'storage'),
};
const php = process.env.SENKOM_PHP_BINARY ?? 'php';
async function command(args) {
  const child = spawn(php, args, {
    cwd: api,
    env,
    stdio: 'inherit',
    windowsHide: true,
  });
  await new Promise((done, reject) => {
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? done() : reject(new Error('PHP setup failed: ' + code)),
    );
  });
}
await command(['artisan', 'migrate', '--force', '--no-interaction']);
const credentialsPath = join(directory, 'credentials.json');
await command([join(root, 'scripts/phase2-api-fixture.php'), credentialsPath]);
const credentials = JSON.parse(await readFile(credentialsPath, 'utf8'));
await unlink(credentialsPath);
const listener = createServer();
await new Promise((done) => listener.listen(0, '127.0.0.1', done));
const port = listener.address().port;
await new Promise((done) => listener.close(done));
const origin = `http://127.0.0.1:${port}`;
// cli-server needs E so Laravel sees LARAVEL_STORAGE_PATH in $_ENV.
const child = spawn(
  php,
  [
    '-d',
    'variables_order=EGPCS',
    '-S',
    `127.0.0.1:${port}`,
    '-t',
    'public',
    'public/index.php',
  ],
  { cwd: api, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true },
);
let serverLog = '';
child.stdout.on('data', (chunk) => {
  serverLog = (serverLog + chunk).slice(-50000);
});
child.stderr.on('data', (chunk) => {
  serverLog = (serverLog + chunk).slice(-50000);
});
child.on('error', (error) => {
  serverLog += error.message;
});
const cookies = new Map();
let csrf = '';
async function request(
  path,
  { method = 'GET', body, headers = {}, viewer = false, session } = {},
) {
  const jar = session?.cookies ?? cookies;
  const response = await globalThis.fetch(origin + '/api/v1' + path, {
    method,
    headers: {
      Accept: 'application/json',
      ...(!viewer
        ? {
            Cookie: [...jar]
              .map(([key, value]) => key + '=' + value)
              .join('; '),
            'X-CSRF-TOKEN': session?.csrf ?? csrf,
          }
        : { Authorization: 'Bearer ' + credentials.viewerToken }),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: globalThis.AbortSignal.timeout(10000),
  });
  if (!viewer)
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(';')[0];
      const equal = pair.indexOf('=');
      jar.set(pair.slice(0, equal), pair.slice(equal + 1));
    }
  const text = await response.text();
  return { response, text, json: text ? JSON.parse(text) : null };
}
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if (
        (
          await globalThis.fetch(origin + '/api/v1/health', {
            signal: globalThis.AbortSignal.timeout(1000),
          })
        ).ok
      ) {
        ready = true;
        break;
      }
    } catch {
      /* Server may still be starting. */
    }
    await delay(100);
  }
  assert.ok(ready, 'PHP server did not start.');
  const session = await request('/auth/session');
  assert.equal(session.response.status, 200);
  assert.equal(session.json.data.user, null);
  csrf = session.json.data.csrfToken;
  assert.ok(typeof csrf === 'string' && csrf.length > 0);
  assert.ok(cookies.has('senkom_admin_session'));
  assert.equal(
    session.response.headers
      .getSetCookie()
      .some((cookie) => /;\s*secure(?:;|$)/i.test(cookie)),
    secureCookie,
  );
  const allowed = await globalThis.fetch(origin + '/api/v1/auth/session', {
    headers: { Origin: adminOrigin },
  });
  assert.equal(allowed.headers.get('access-control-allow-origin'), adminOrigin);
  assert.equal(allowed.headers.get('access-control-allow-credentials'), 'true');
  const preflight = await globalThis.fetch(origin + '/api/v1/auth/login', {
    method: 'OPTIONS',
    headers: {
      Origin: adminOrigin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type,x-csrf-token',
    },
  });
  assert.equal(preflight.status, 204);
  assert.equal(
    preflight.headers.get('access-control-allow-origin'),
    adminOrigin,
  );
  const blocked = await globalThis.fetch(origin + '/api/v1/auth/session', {
    headers: { Origin: 'http://127.0.0.1:5174' },
  });
  assert.notEqual(
    blocked.headers.get('access-control-allow-origin'),
    'http://127.0.0.1:5174',
  );
  const blockedPreflight = await globalThis.fetch(
    origin + '/api/v1/auth/login',
    {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://127.0.0.1:5174',
        'Access-Control-Request-Method': 'POST',
      },
    },
  );
  assert.notEqual(
    blockedPreflight.headers.get('access-control-allow-origin'),
    'http://127.0.0.1:5174',
  );
  assert.ok(
    (await readdir(join(directory, 'storage/framework/sessions'))).length > 0,
    'HTTP must persist sessions in isolated storage.',
  );
  assert.equal((await request('/admin/map/draft')).response.status, 401);
  assert.equal((await request('/viewer/map')).response.status, 401);
  const anonymousCookie = cookies.get('senkom_admin_session');
  const anonymousCsrf = csrf;
  const denied = await request('/auth/login', {
    method: 'POST',
    body: { email: credentials.email, password: credentials.password },
    headers: { 'X-CSRF-TOKEN': 'invalid' },
  });
  assert.equal(denied.response.status, 419);
  assert.equal(
    (
      await request('/auth/login', {
        method: 'POST',
        body: { email: credentials.email, password: credentials.password },
        headers: { 'X-CSRF-TOKEN': '' },
      })
    ).response.status,
    419,
  );
  assert.equal(
    (
      await request('/auth/login', {
        method: 'POST',
        body: {
          email: credentials.email,
          password: 'incorrect-smoke-password',
        },
      })
    ).response.status,
    401,
  );
  const editorLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: credentials.editorEmail, password: credentials.password },
  });
  assert.equal(editorLogin.response.status, 200);
  csrf = editorLogin.json.data.csrfToken;
  const editorDraft = await request('/admin/map/draft');
  assert.equal(editorDraft.response.status, 200);
  const camera = {
    ...editorDraft.json.data.content.cameras[0],
    id: 'smoke-camera',
    code: 'SMOKE-CAMERA',
    name: 'Smoke camera',
  };
  for (const [method, path, body] of [
    ['POST', '/admin/cameras', camera],
    ['PATCH', '/admin/cameras/demo-camera-01', { name: 'Denied' }],
    ['DELETE', '/admin/cameras/demo-camera-01', undefined],
  ]) {
    const denied = await request(path, {
      method,
      body,
      headers: { 'If-Match': editorDraft.response.headers.get('ETag') },
    });
    assert.equal(denied.response.status, 403);
    assert.equal(denied.json.error.code, 'FORBIDDEN');
  }
  assert.deepEqual(
    (await request('/admin/map/draft')).json.data,
    editorDraft.json.data,
  );
  const editorA = { cookies: new Map(cookies), csrf };
  const editorB = { cookies: new Map(), csrf: '' };
  editorB.csrf = (
    await request('/auth/session', { session: editorB })
  ).json.data.csrfToken;
  const secondLogin = await request('/auth/login', {
    method: 'POST',
    body: {
      email: credentials.secondEditorEmail,
      password: credentials.password,
    },
    session: editorB,
  });
  assert.equal(secondLogin.response.status, 200);
  editorB.csrf = secondLogin.json.data.csrfToken;
  assert.notEqual(
    editorA.cookies.get('senkom_admin_session'),
    editorB.cookies.get('senkom_admin_session'),
  );
  const secondDraft = await request('/admin/map/draft', { session: editorB });
  assert.equal(secondDraft.response.status, 200);
  assert.equal(
    secondDraft.response.headers.get('ETag'),
    editorDraft.response.headers.get('ETag'),
  );
  const firstLayoutResponse = await request('/admin/map-layouts', {
    session: editorA,
  });
  const secondLayoutResponse = await request('/admin/map-layouts', {
    session: editorB,
  });
  assert.equal(firstLayoutResponse.response.status, 200);
  assert.equal(secondLayoutResponse.response.status, 200);
  assert.equal(
    firstLayoutResponse.response.headers.get('ETag'),
    editorDraft.response.headers.get('ETag'),
  );
  assert.equal(
    secondLayoutResponse.response.headers.get('ETag'),
    firstLayoutResponse.response.headers.get('ETag'),
  );
  const firstLayout = globalThis.structuredClone(firstLayoutResponse.json.data);
  firstLayout.nodes[0].label = 'Editor A layout';
  const secondLayout = globalThis.structuredClone(
    secondLayoutResponse.json.data,
  );
  secondLayout.edges[0].label = 'Editor B route';
  const firstSave = await request('/admin/map-layouts', {
    method: 'PUT',
    body: firstLayout,
    session: editorA,
    headers: { 'If-Match': firstLayoutResponse.response.headers.get('ETag') },
  });
  assert.equal(firstSave.response.status, 200);
  const staleSave = await request('/admin/map-layouts', {
    method: 'PUT',
    body: secondLayout,
    session: editorB,
    headers: { 'If-Match': secondLayoutResponse.response.headers.get('ETag') },
  });
  assert.equal(staleSave.response.status, 409);
  assert.equal(staleSave.json.error.code, 'DRAFT_CONFLICT');
  const missingMatch = await request('/admin/map-layouts', {
    method: 'PUT',
    body: secondLayout,
    session: editorB,
  });
  assert.equal(missingMatch.response.status, 428);
  assert.equal(missingMatch.json.error.code, 'PRECONDITION_REQUIRED');
  const currentDraft = await request('/admin/map/draft', { session: editorB });
  assert.equal(
    currentDraft.json.data.version,
    secondDraft.json.data.version + 1,
  );
  assert.equal(
    currentDraft.json.data.content.layout.nodes[0].label,
    'Editor A layout',
  );
  assert.equal(currentDraft.json.data.content.layout.edges[0].label, undefined);
  assert.deepEqual(
    currentDraft.json.data.content.sites,
    secondDraft.json.data.content.sites,
  );
  const currentLayoutResponse = await request('/admin/map-layouts', {
    session: editorB,
  });
  assert.equal(
    currentLayoutResponse.response.headers.get('ETag'),
    currentDraft.response.headers.get('ETag'),
  );
  const mergedLayout = globalThis.structuredClone(
    currentLayoutResponse.json.data,
  );
  mergedLayout.edges[0].label = 'Editor B route';
  const secondSave = await request('/admin/map-layouts', {
    method: 'PUT',
    body: mergedLayout,
    session: editorB,
    headers: { 'If-Match': currentLayoutResponse.response.headers.get('ETag') },
  });
  assert.equal(secondSave.response.status, 200);
  const finalDraft = await request('/admin/map/draft', { session: editorA });
  assert.equal(finalDraft.json.data.version, secondDraft.json.data.version + 2);
  assert.equal(
    finalDraft.json.data.content.layout.nodes[0].label,
    'Editor A layout',
  );
  assert.equal(
    finalDraft.json.data.content.layout.edges[0].label,
    'Editor B route',
  );
  assert.equal(
    (await request('/viewer/map?schemaVersion=2', { viewer: true })).response
      .status,
    404,
  );
  csrf = (await request('/auth/logout', { method: 'POST' })).json.data
    .csrfToken;
  const login = await request('/auth/login', {
    method: 'POST',
    body: { email: credentials.email, password: credentials.password },
  });
  assert.equal(login.response.status, 200);
  csrf = login.json.data.csrfToken;
  assert.ok(csrf !== anonymousCsrf);
  assert.ok(cookies.get('senkom_admin_session') !== anonymousCookie);
  assert.ok(
    login.response.headers
      .getSetCookie()
      .some((cookie) => /senkom_admin_session=.*httponly/i.test(cookie)),
  );
  const authenticated = await request('/auth/session');
  assert.equal(authenticated.response.status, 200);
  assert.equal(authenticated.json.data.user.id, login.json.data.user.id);
  assert.ok(authenticated.json.data.csrfToken === csrf);
  const layoutAudit = await request('/admin/audit-logs?perPage=100');
  assert.equal(layoutAudit.response.status, 200);
  assert.equal(
    layoutAudit.json.data.filter((row) => row.action === 'map.save_layout')
      .length,
    2,
  );
  const adminCors = await request('/admin/map/draft', {
    headers: { Origin: adminOrigin },
  });
  assert.equal(
    adminCors.response.headers.get('access-control-allow-origin'),
    adminOrigin,
  );
  const adminPreflight = await globalThis.fetch(
    origin + '/api/v1/admin/sites/demo-site-01',
    {
      method: 'OPTIONS',
      headers: {
        Origin: adminOrigin,
        'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'content-type,x-csrf-token,if-match',
      },
    },
  );
  assert.equal(adminPreflight.status, 204);
  assert.equal(
    adminPreflight.headers.get('access-control-allow-origin'),
    adminOrigin,
  );
  const authenticatedCookie = cookies.get('senkom_admin_session');
  const draft = await request('/admin/map/draft');
  assert.equal(draft.response.status, 200);
  assert.equal(draft.json.data.content.sites.length, 8);
  assert.equal(
    (await request('/viewer/map?schemaVersion=2', { viewer: true })).response
      .status,
    404,
  );
  const headers = { 'If-Match': draft.response.headers.get('ETag') };
  const metadataSave = await request('/admin/sites/demo-site-01', {
    method: 'PATCH',
    body: { metadata: {} },
    headers,
  });
  assert.equal(metadataSave.response.status, 200);
  assert.deepEqual(metadataSave.json.data.content.sites[0].metadata, {});
  const site = await request('/admin/sites/demo-site-01');
  assert.equal(site.response.status, 200);
  assert.deepEqual(site.json.data.metadata, {});
  headers['If-Match'] = metadataSave.response.headers.get('ETag');
  assert.equal(
    (await request('/admin/map/validate', { method: 'POST', headers })).json
      .data.valid,
    true,
  );
  assert.equal(
    (await request('/admin/map/publish', { method: 'POST', headers })).response
      .status,
    201,
  );
  const published = await request('/viewer/map?schemaVersion=2', {
    viewer: true,
  });
  assert.equal(published.response.status, 200);
  assert.equal(
    createHash('sha256').update(published.text).digest('hex'),
    published.response.headers.get('X-Content-SHA256'),
  );
  assert.equal(published.json.data.status, 'published');
  assert.deepEqual(published.json.data.sites[0].metadata, {});
  assert.equal(published.json.data.layout.nodes[0].label, 'Editor A layout');
  assert.equal(published.json.data.layout.edges[0].label, 'Editor B route');
  assert.ok(!published.text.includes(credentials.viewerToken));
  assert.ok(!published.text.includes(credentials.password));
  assert.equal(
    (await request('/admin/map/draft', { viewer: true })).response.status,
    403,
  );
  assert.equal(
    (
      await request('/viewer/map?schemaVersion=2&mapId=unknown-map', {
        viewer: true,
      })
    ).text,
    published.text,
  );
  for (const path of [
    '/viewer/map',
    '/viewer/map?schemaVersion=2',
    '/viewer/cameras?schemaVersion=2',
    '/viewer/sites/demo-site-01?schemaVersion=2',
  ]) {
    const current = await request(path, { viewer: true });
    assert.equal(current.response.status, 200);
    const checksum = createHash('sha256').update(current.text).digest('hex');
    const etag = '"sha256:' + checksum + '"';
    assert.equal(current.response.headers.get('X-Content-SHA256'), checksum);
    assert.equal(current.response.headers.get('ETag'), etag);
    const cached = await request(path, {
      viewer: true,
      headers: { 'If-None-Match': etag },
    });
    assert.equal(cached.response.status, 304);
    assert.equal(cached.text, '');
  }
  assert.equal(
    (
      await request('/viewer/map?schemaVersion=2', {
        viewer: true,
        headers: { 'If-None-Match': published.response.headers.get('ETag') },
      })
    ).response.status,
    304,
  );
  const cameraHeaders = {
    'If-Match': (await request('/admin/map/draft')).response.headers.get(
      'ETag',
    ),
  };
  const cameraCreate = await request('/admin/cameras', {
    method: 'POST',
    body: camera,
    headers: cameraHeaders,
  });
  assert.equal(cameraCreate.response.status, 201);
  cameraHeaders['If-Match'] = cameraCreate.response.headers.get('ETag');
  const cameraUpdate = await request('/admin/cameras/smoke-camera', {
    method: 'PATCH',
    body: { name: 'Smoke camera changed' },
    headers: cameraHeaders,
  });
  assert.equal(cameraUpdate.response.status, 200);
  cameraHeaders['If-Match'] = cameraUpdate.response.headers.get('ETag');
  assert.equal(
    (
      await request('/admin/cameras/smoke-camera', {
        method: 'DELETE',
        headers: cameraHeaders,
      })
    ).response.status,
    200,
  );
  assert.equal(
    (await request('/admin/cameras/smoke-camera')).response.status,
    404,
  );
  assert.equal(
    (await request('/viewer/map?schemaVersion=2', { viewer: true })).text,
    published.text,
  );
  assert.equal(
    (await request('/admin/sites', { method: 'POST', body: {}, viewer: true }))
      .response.status,
    403,
  );
  assert.equal(
    (await request('/viewer/map', { method: 'POST', body: {}, viewer: true }))
      .response.status,
    403,
  );
  assert.equal(
    (
      await request('/admin/map/draft', {
        method: 'PUT',
        body: draft.json.data.content,
        headers,
      })
    ).response.status,
    409,
  );
  const legacy = await request('/viewer/map', { viewer: true });
  assert.equal(legacy.response.status, 200);
  assert.equal(legacy.json.data.schemaVersion, 1);
  assert.equal(Object.hasOwn(legacy.json.data.sites[0], 'metadata'), false);
  const unsupported = await request('/viewer/map?schemaVersion=3', {
    viewer: true,
  });
  assert.equal(unsupported.response.status, 406);
  assert.equal(unsupported.json.error.code, 'SCHEMA_UNSUPPORTED');
  await writeFile(
    join(artifacts, 'phase2-api-published.v1.json'),
    JSON.stringify(legacy.json.data, null, 2),
  );
  await writeFile(
    join(artifacts, 'phase2-api-published.v2.json'),
    JSON.stringify(published.json.data, null, 2),
  );
  const firstRevision = published.json.data.revision;
  const firstDetail = await request('/admin/map-revisions/' + firstRevision);
  assert.equal(firstDetail.response.status, 200);
  const historySave = await request('/admin/sites/demo-site-01', {
    method: 'PATCH',
    body: { name: 'Second published site' },
    headers: {
      'If-Match': (await request('/admin/map/draft')).response.headers.get(
        'ETag',
      ),
    },
  });
  assert.equal(historySave.response.status, 200);
  const secondHeaders = {
    'If-Match': historySave.response.headers.get('ETag'),
  };
  assert.equal(
    (
      await request('/admin/map/validate', {
        method: 'POST',
        headers: secondHeaders,
      })
    ).json.data.valid,
    true,
  );
  const secondPublish = await request('/admin/map/publish', {
    method: 'POST',
    headers: secondHeaders,
  });
  assert.equal(secondPublish.response.status, 201);
  const history = await request('/admin/map-revisions?perPage=1&page=2');
  assert.equal(history.response.status, 200);
  assert.equal(history.json.meta.total, 2);
  assert.equal(history.json.data.length, 1);
  assert.equal(
    (await request('/admin/map-revisions/' + firstRevision)).text,
    firstDetail.text,
  );
  const secondViewer = await request('/viewer/map?schemaVersion=2', {
    viewer: true,
  });
  assert.equal(
    secondViewer.json.data.revision,
    secondPublish.json.data.revisionId,
  );
  assert.notEqual(secondViewer.text, published.text);
  assert.equal(
    (
      await request('/admin/map/rollback', {
        method: 'POST',
        body: { revisionId: firstRevision },
      })
    ).response.status,
    428,
  );
  const rollbackHeaders = {
    'If-Match': (await request('/admin/map/draft')).response.headers.get(
      'ETag',
    ),
  };
  assert.equal(
    (
      await request('/admin/map/rollback', {
        method: 'POST',
        body: { revisionId: firstRevision },
        headers: secondHeaders,
      })
    ).response.status,
    409,
  );
  const rollback = await request('/admin/map/rollback', {
    method: 'POST',
    body: { revisionId: firstRevision },
    headers: rollbackHeaders,
  });
  assert.equal(rollback.response.status, 200);
  assert.equal(rollback.json.data.activeRevisionId, firstRevision);
  const restoredViewer = await request('/viewer/map?schemaVersion=2', {
    viewer: true,
  });
  assert.equal(restoredViewer.text, published.text);
  assert.equal(
    restoredViewer.response.headers.get('ETag'),
    published.response.headers.get('ETag'),
  );
  assert.equal(
    (await request('/admin/map-revisions/' + firstRevision)).text,
    firstDetail.text,
  );
  const rollbackAudit = await request('/admin/audit-logs?perPage=100');
  assert.equal(
    rollbackAudit.json.data.filter((row) => row.action === 'map.rollback')
      .length,
    1,
  );
  const corruptFixture = String.raw`
    require 'vendor/autoload.php';
    $app = require 'bootstrap/app.php';
    $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    $db = config('database.connections.mysql');
    if (!app()->environment('testing') || !str_ends_with($db['database'], '_test') || $db['host'] !== '127.0.0.1' || (string) $db['port'] !== getenv('SENKOM_TEST_DB_PORT')) throw new RuntimeException('Isolated DB required');
    $mapId = config('senkom.map_id');
    $revision = \Illuminate\Support\Facades\DB::table('map_revisions')->where('id', $argv[2])->where('map_id', $mapId)->first();
    if (!$revision) throw new RuntimeException('Original revision missing');
    \Illuminate\Support\Facades\DB::transaction(function () use ($argv, $mapId, $revision) {
      $db = \Illuminate\Support\Facades\DB::table('maps')->where('id', $mapId);
      if ($argv[1] === 'json' || $argv[1] === 'schema') {
        $snapshot = $argv[1] === 'json' ? '{broken' : '[]';
        $id = (string) \Illuminate\Support\Str::uuid();
        \Illuminate\Support\Facades\DB::table('map_revisions')->insert(['id' => $id, 'map_id' => $mapId, 'draft_version' => $revision->draft_version, 'published_by' => $revision->published_by, 'published_at' => now(), 'snapshot' => $snapshot, 'checksum' => hash('sha256', $snapshot)]);
        $db->update(['active_revision_id' => $id]);
      } elseif ($argv[1] === 'restore') $db->update(['active_revision_id' => $revision->id]);
      else throw new RuntimeException('Unknown fixture mode');
    });
  `;
  for (const kind of ['json', 'schema']) {
    await command(['-r', corruptFixture, kind, firstRevision]);
    try {
      for (const path of [
        '/viewer/map?schemaVersion=1',
        '/viewer/map?schemaVersion=2',
        '/viewer/cameras?schemaVersion=2',
        '/viewer/sites/demo-site-01?schemaVersion=2',
      ]) {
        const unavailable = await request(path, { viewer: true });
        assert.equal(unavailable.response.status, 503);
        assert.equal(unavailable.json.error.code, 'SNAPSHOT_UNAVAILABLE');
        assert.equal(unavailable.response.headers.get('ETag'), null);
        assert.equal(
          unavailable.response.headers.get('X-Content-SHA256'),
          null,
        );
        assert.equal(unavailable.json.data, undefined);
        assert.ok(!unavailable.text.includes(credentials.viewerToken));
      }
    } finally {
      await command(['-r', corruptFixture, 'restore', firstRevision]);
    }
  }
  assert.equal(
    (await request('/viewer/map?schemaVersion=2', { viewer: true })).text,
    published.text,
  );
  const previousCsrf = csrf;
  const logout = await request('/auth/logout', { method: 'POST' });
  assert.equal(logout.response.status, 200);
  assert.equal(logout.json.data.user, null);
  csrf = logout.json.data.csrfToken;
  assert.ok(csrf !== previousCsrf);
  assert.equal((await request('/admin/map/draft')).response.status, 401);
  assert.equal((await request('/auth/session')).json.data.user, null);
  assert.equal(
    (
      await request('/auth/logout', {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': previousCsrf },
      })
    ).response.status,
    419,
  );
  assert.equal(
    (await request('/auth/logout', { method: 'POST' })).response.status,
    401,
  );
  assert.equal(
    (
      await request('/admin/map/draft', {
        headers: { Cookie: 'senkom_admin_session=' + authenticatedCookie },
      })
    ).response.status,
    401,
    'Logout must invalidate the previously authenticated session.',
  );
  csrf = (await request('/auth/session')).json.data.csrfToken;
  for (let attempt = 0; attempt < 5; attempt++) {
    assert.equal(
      (
        await request('/auth/login', {
          method: 'POST',
          body: {
            email: credentials.email,
            password: 'incorrect-smoke-password',
          },
        })
      ).response.status,
      401,
    );
  }
  const limited = await request('/auth/login', {
    method: 'POST',
    body: { email: credentials.email, password: credentials.password },
  });
  assert.equal(limited.response.status, 429);
  assert.equal(limited.json.error.code, 'RATE_LIMITED');
  assert.ok(!limited.text.includes(credentials.password));
  assert.ok(!limited.text.includes(credentials.viewerToken));
  assert.ok(!limited.text.includes(authenticatedCookie));
  assert.ok(!limited.text.includes(previousCsrf));
  assert.ok(!serverLog.includes(credentials.password));
  assert.ok(!serverLog.includes(credentials.viewerToken));
  assert.ok(!serverLog.includes(authenticatedCookie));
  assert.ok(!serverLog.includes(previousCsrf));
  console.log(
    'PASS Phase 2A HTTP: two-editor If-Match 409/428 without lost update, isolated sessions, cookie login/logout, CSRF 419, auth 401, login 429, CORS, Secure cookie mode, draft/publish/rollback history, viewer byte cache, schema v1/v2, corrupt snapshot 503, viewer write denial.',
  );
} finally {
  child.kill();
  await new Promise((done) => {
    if (child.exitCode !== null) done();
    else child.once('exit', done);
  });
  await writeFile(join(directory, 'api-server.log'), serverLog);
}
