const { app, BrowserWindow } = require('electron');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const {
  mkdtemp,
  mkdir,
  readFile,
  unlink,
  writeFile,
} = require('node:fs/promises');
const { join, resolve } = require('node:path');
const { randomBytes } = require('node:crypto');

const root = resolve(__dirname, '..');
const api = join(root, 'apps/api');
const artifacts = join(root, '.artifacts');
const php = process.env.SENKOM_PHP_BINARY || 'php';
const children = [];
const windows = [];
const responses = [];
let log = '';

function run(exe, args, cwd, env) {
  return new Promise((done, reject) => {
    const child = spawn(exe, args, {
      cwd,
      env,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (data) => {
      output += data;
    });
    child.stderr.on('data', (data) => {
      output += data;
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0
        ? done(output)
        : reject(new Error(`${exe} exited ${code}: ${output.slice(-1500)}`)),
    );
  });
}

function serve(exe, args, cwd, env) {
  const child = spawn(exe, args, {
    cwd,
    env,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  children.push(child);
  child.stdout.on('data', (data) => {
    log = (log + data).slice(-50000);
  });
  child.stderr.on('data', (data) => {
    log = (log + data).slice(-50000);
  });
  child.on('error', (error) => {
    log += error.message;
  });
  return child;
}

async function ready(url) {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      if (
        (
          await globalThis.fetch(url, {
            signal: globalThis.AbortSignal.timeout(500),
          })
        ).ok
      )
        return;
    } catch {
      /* starting */
    }
    await new Promise((done) => globalThis.setTimeout(done, 100));
  }
  throw new Error(`Server not ready: ${url}; ${log.slice(-1000)}`);
}

async function browser(partition) {
  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 900,
    webPreferences: {
      partition,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.webContents.session.webRequest.onCompleted(
    { urls: ['http://127.0.0.1:5174/api/v1/*'] },
    (details) => {
      responses.push({
        method: details.method,
        path: new globalThis.URL(details.url).pathname,
        status: details.statusCode,
      });
    },
  );
  windows.push(win);
  await win.loadURL('http://127.0.0.1:5174/');
  return win;
}

const js = async (win, code) => {
  try {
    return await win.webContents.executeJavaScript(code);
  } catch (error) {
    throw new Error('Renderer script failed', { cause: error });
  }
};
async function until(win, code) {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      if (await js(win, code)) return;
    } catch {
      /* React may be replacing this subtree. */
    }
    await new Promise((done) => globalThis.setTimeout(done, 100));
  }
  throw new Error(
    `Browser timeout: ${code}; ${await js(win, 'document.body.innerText.slice(0,700)')}`,
  );
}
const click = (win, label) =>
  js(
    win,
    `[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(label)})?.click()`,
  );
async function login(win, email, password) {
  await until(win, "document.querySelector('#email') !== null");
  await js(
    win,
    `(()=>{const form=document.querySelector('form');form.querySelector('#email').value=${JSON.stringify(email)};form.querySelector('#password').value=${JSON.stringify(password)};form.requestSubmit()})()`,
  );
  await until(
    win,
    "document.querySelector('#canvas .site-properties, #canvas .map-viewport') !== null && document.querySelector('#published-history ol, #published-history p') !== null",
  );
}
async function request(win, path, method = 'GET', body, etag) {
  return js(
    win,
    `(async()=>{const session=await fetch('/api/v1/auth/session',{credentials:'same-origin'}).then(x=>x.json());const response=await fetch('/api/v1${path}',{method:${JSON.stringify(method)},credentials:'same-origin',headers:{Accept:'application/json',...( ${JSON.stringify(method)} !== 'GET' ? {'X-CSRF-TOKEN':session.data.csrfToken}:{}),...(${etag ? JSON.stringify(etag) : 'null'} ? {'If-Match':${JSON.stringify(etag)}}:{}),...(${body ? 'true' : 'false'} ? {'Content-Type':'application/json'}:{})},${body ? `body:JSON.stringify(${JSON.stringify(body)})` : ''}});return {status:response.status,etag:response.headers.get('ETag'),json:await response.json().catch(()=>null)}})()`,
  );
}

app.whenReady().then(async () => {
  let directory;
  let failed = false;
  try {
    assert.ok(
      process.env.SENKOM_TEST_DB_PORT &&
        process.env.SENKOM_TEST_DB_DATABASE?.endsWith('_test'),
    );
    await mkdir(artifacts, { recursive: true });
    directory = await mkdtemp(join(artifacts, 'browser-e2e-'));
    for (const path of [
      'framework/sessions',
      'framework/cache/data',
      'framework/views',
      'logs',
    ])
      await mkdir(join(directory, 'storage', path), { recursive: true });
    const env = {
      ...process.env,
      APP_ENV: 'testing',
      APP_DEBUG: 'false',
      APP_KEY: 'base64:' + randomBytes(32).toString('base64'),
      DB_HOST: '127.0.0.1',
      DB_PORT: process.env.SENKOM_TEST_DB_PORT,
      DB_DATABASE: process.env.SENKOM_TEST_DB_DATABASE,
      DB_USERNAME: process.env.SENKOM_TEST_DB_USERNAME,
      DB_PASSWORD: process.env.SENKOM_TEST_DB_PASSWORD,
      SENKOM_INFRASTRUCTURE_ENABLED: 'true',
      SENKOM_MAP_ID: 'browser-' + randomBytes(8).toString('hex'),
      SESSION_DRIVER: 'file',
      SESSION_SECURE_COOKIE: 'false',
      CACHE_STORE: 'file',
      LARAVEL_STORAGE_PATH: join(directory, 'storage'),
    };
    await run(
      php,
      ['artisan', 'migrate', '--force', '--no-interaction'],
      api,
      env,
    );
    const credentialPath = join(directory, 'credentials.json');
    await run(
      php,
      [join(root, 'scripts/phase2-api-fixture.php'), credentialPath],
      api,
      env,
    );
    // ponytail: Fixture seeds one map; add a second map here when browser cross-map grants enter scope.
    const credentials = JSON.parse(await readFile(credentialPath, 'utf8'));
    await unlink(credentialPath);
    serve(
      php,
      [
        '-d',
        'variables_order=EGPCS',
        '-S',
        '127.0.0.1:8000',
        '-t',
        'public',
        'public/index.php',
      ],
      api,
      env,
    );
    await ready('http://127.0.0.1:8000/api/v1/health');
    serve(
      process.execPath,
      [
        join(root, 'node_modules/vite/bin/vite.js'),
        '--host',
        '127.0.0.1',
        '--port',
        '5174',
        '--strictPort',
      ],
      join(root, 'apps/admin-web'),
      { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    );
    await ready('http://127.0.0.1:5174/');

    const admin = await browser('e2e-admin-' + Date.now());
    await login(admin, credentials.email, credentials.password);
    const before = await request(admin, '/admin/map/draft');
    assert.equal(before.status, 200);
    await js(
      admin,
      "document.querySelector('#canvas svg [aria-label^=\"Site \" ]')?.dispatchEvent(new MouseEvent('click',{bubbles:true}))",
    );
    await until(admin, "document.querySelector('#site-label') !== null");
    await js(
      admin,
      "(()=>{const input=document.querySelector('#site-label');input.value='Browser E2E site';input.closest('form').requestSubmit()})()",
    );
    await until(
      admin,
      "document.querySelector('#canvas').innerText.includes('Draft berubah')",
    );
    assert.equal((await request(admin, '/admin/map/draft')).etag, before.etag);
    await click(admin, 'Simpan draft');
    await until(
      admin,
      "document.querySelector('#canvas').innerText.includes('Draft tersimpan di server')",
    );
    const saved = await request(admin, '/admin/map/draft');
    assert.notEqual(saved.etag, before.etag);
    assert.ok(
      saved.json.data.content.layout.nodes.some(
        (node) => node.label === 'Browser E2E site',
      ),
    );
    await admin.reload();
    await until(
      admin,
      "document.querySelector('#canvas').innerText.includes('Browser E2E site')",
    );
    await click(admin, 'Validasi draft');
    await until(
      admin,
      "document.querySelector('#canvas').innerText.includes('Draft valid dan siap dipublikasikan')",
    );
    await click(admin, 'Publikasikan draft');
    await until(
      admin,
      "document.querySelector('#canvas').innerText.includes('dipublikasikan pada')",
    );
    await click(admin, 'Muat ulang riwayat');
    await until(
      admin,
      "document.querySelector('#published-history ol li') !== null",
    );
    const first = await request(
      admin,
      '/admin/map-revisions?page=1&perPage=10',
    );
    assert.equal(first.json.meta.total, 1);
    const revisionId = first.json.data[0].revisionId;
    const immutable = await request(
      admin,
      `/admin/map-revisions/${revisionId}`,
    );
    await js(
      admin,
      "document.querySelector('#published-history ol button').click()",
    );
    await until(
      admin,
      "document.querySelector('#published-history .map-viewport')?.textContent.includes('Browser E2E site')",
    );
    assert.equal(
      await js(
        admin,
        "document.querySelector('#published-history .site-properties') === null",
      ),
      true,
    );

    const invalidBase = await request(admin, '/admin/map/draft');
    const invalid = globalThis.structuredClone(invalidBase.json.data.content);
    invalid.logicalLinks[0].coreSegments = [
      'demo-core-01',
      'demo-core-03',
      'demo-core-02',
    ];
    const invalidSave = await request(
      admin,
      '/admin/map/draft',
      'PUT',
      invalid,
      invalidBase.etag,
    );
    assert.equal(invalidSave.status, 200);
    await admin.reload();
    await until(
      admin,
      "document.querySelector('#canvas .map-viewport') !== null",
    );
    await click(admin, 'Validasi draft');
    await until(
      admin,
      "document.querySelector('#canvas').innerText.includes('Draft belum valid')",
    );
    assert.equal(
      await js(
        admin,
        "document.querySelector('#canvas').innerText.includes('PATH_GAP')",
      ),
      true,
    );
    assert.equal(
      await js(
        admin,
        "[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Publikasikan draft').disabled",
      ),
      true,
    );
    const restored = await request(
      admin,
      '/admin/map/draft',
      'PUT',
      invalidBase.json.data.content,
      invalidSave.etag,
    );
    assert.equal(restored.status, 200);
    await admin.reload();
    await until(
      admin,
      "document.querySelector('#canvas .map-viewport') !== null",
    );

    const editor = await browser('e2e-editor-' + Date.now());
    await login(editor, credentials.editorEmail, credentials.password);
    assert.equal(
      await js(
        editor,
        "document.body.innerText.includes('Pilih revisi untuk rollback')",
      ),
      false,
    );
    assert.equal(
      (
        await request(
          editor,
          '/admin/map/rollback',
          'POST',
          { revisionId },
          (await request(editor, '/admin/map/draft')).etag,
        )
      ).status,
      403,
    );
    const editorDraft = await request(editor, '/admin/map/draft');
    const changed = globalThis.structuredClone(editorDraft.json.data.content);
    changed.layout.nodes[0].label = 'Concurrent server edit';
    assert.equal(
      (
        await request(
          editor,
          '/admin/map/draft',
          'PUT',
          changed,
          editorDraft.etag,
        )
      ).status,
      200,
    );
    await js(
      admin,
      "document.querySelector('#canvas svg [aria-label^=\"Site \" ]')?.dispatchEvent(new MouseEvent('click',{bubbles:true}))",
    );
    await until(admin, "document.querySelector('#site-label') !== null");
    await js(
      admin,
      "(()=>{const input=document.querySelector('#site-label');input.value='Unsaved local edit';input.closest('form').requestSubmit()})()",
    );
    await click(admin, 'Simpan draft');
    await until(
      admin,
      "document.querySelector('#canvas').innerText.includes('Draft server berubah')",
    );
    assert.ok(
      responses.some(
        (item) =>
          item.method === 'PUT' &&
          item.path.endsWith('/admin/map/draft') &&
          item.status === 409,
      ),
    );
    assert.equal(
      await js(
        admin,
        "document.querySelector('#canvas').innerText.includes('Unsaved local edit')",
      ),
      true,
    );
    assert.equal(
      await js(
        admin,
        "[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Undo').disabled",
      ),
      false,
    );
    await click(admin, 'Undo');
    await until(
      admin,
      "!document.querySelector('#canvas').innerText.includes('Unsaved local edit')",
    );
    await click(admin, 'Redo');
    await until(
      admin,
      "document.querySelector('#canvas').innerText.includes('Unsaved local edit')",
    );
    assert.equal(
      (await request(admin, '/admin/map/draft')).json.data.content.layout
        .nodes[0].label,
      'Concurrent server edit',
    );
    await admin.reload();
    await until(
      admin,
      "document.querySelector('#canvas').innerText.includes('Concurrent server edit')",
    );
    assert.equal(
      (
        await request(admin, `/admin/map-revisions/${revisionId}`)
      ).json.data.layout.nodes.some(
        (node) => node.label === 'Browser E2E site',
      ),
      true,
    );
    assert.deepEqual(
      (await request(admin, `/admin/map-revisions/${revisionId}`)).json,
      immutable.json,
    );

    const anonymous = await browser('e2e-anonymous-' + Date.now());
    assert.equal((await request(anonymous, '/admin/map/draft')).status, 401);
    assert.equal(
      await js(
        anonymous,
        `fetch('/api/v1/admin/map/draft',{method:'PUT',headers:{Authorization:'Bearer ${credentials.viewerToken}',Accept:'application/json','Content-Type':'application/json','If-Match':'${saved.etag}'},body:'{}'}).then(x=>x.status)`,
      ),
      403,
    );

    for (let index = 2; index <= 11; index++) {
      const draft = await request(admin, '/admin/map/draft');
      const content = globalThis.structuredClone(draft.json.data.content);
      content.layout.nodes[0].label = `Browser revision ${index}`;
      const updated = await request(
        admin,
        '/admin/map/draft',
        'PUT',
        content,
        draft.etag,
      );
      assert.equal(updated.status, 200);
      assert.equal(
        (
          await request(
            admin,
            '/admin/map/validate',
            'POST',
            undefined,
            updated.etag,
          )
        ).json.data.valid,
        true,
      );
      assert.equal(
        (
          await request(
            admin,
            '/admin/map/publish',
            'POST',
            undefined,
            updated.etag,
          )
        ).status,
        201,
      );
    }
    await click(admin, 'Muat ulang riwayat');
    await until(
      admin,
      "document.querySelector('#published-history ol')?.children.length === 10",
    );
    await click(admin, 'Berikutnya');
    await until(
      admin,
      "document.querySelector('#published-history').innerText.includes('Halaman 2')",
    );
    assert.equal(
      await js(
        admin,
        "document.querySelector('#published-history ol').children.length",
      ),
      1,
    );
    await js(
      admin,
      "document.querySelector('#published-history ol button').click()",
    );
    await until(
      admin,
      "document.querySelector('#published-history .map-viewport')?.textContent.includes('Browser E2E site')",
    );
    const beforeCancel = await request(admin, '/admin/map/draft');
    await click(admin, 'Pilih revisi untuk rollback');
    await until(
      admin,
      'document.querySelector(\'[aria-label="Konfirmasi rollback"]\') !== null',
    );
    await click(admin, 'Batal');
    assert.equal(
      (await request(admin, '/admin/map/draft')).etag,
      beforeCancel.etag,
    );
    await click(admin, 'Pilih revisi untuk rollback');
    await until(
      admin,
      'document.querySelector(\'[aria-label="Konfirmasi rollback"]\') !== null',
    );
    const staleContent = globalThis.structuredClone(
      beforeCancel.json.data.content,
    );
    staleContent.layout.nodes[0].label = 'Rollback conflict edit';
    assert.equal(
      (
        await request(
          editor,
          '/admin/map/draft',
          'PUT',
          staleContent,
          beforeCancel.etag,
        )
      ).status,
      200,
    );
    await click(admin, 'Konfirmasi rollback');
    await until(
      admin,
      "document.querySelector('.rollback-controls [role=alert]')?.textContent.includes('Draft berubah')",
    );
    assert.ok(
      responses.some(
        (item) =>
          item.method === 'POST' &&
          item.path.endsWith('/admin/map/rollback') &&
          item.status === 409,
      ),
    );
    assert.equal(
      (await request(admin, '/admin/map/draft')).json.data.activeRevisionId !==
        revisionId,
      true,
    );
    await click(admin, 'Pilih revisi untuk rollback');
    await until(
      admin,
      'document.querySelector(\'[aria-label="Konfirmasi rollback"]\') !== null',
    );
    await click(admin, 'Konfirmasi rollback');
    await until(
      admin,
      "document.querySelector('#published-history').innerText.includes('berhasil')",
    );
    const afterRollback = await request(admin, '/admin/map/draft');
    assert.equal(afterRollback.json.data.activeRevisionId, revisionId);
    assert.equal(
      afterRollback.json.data.content.layout.nodes[0].label,
      'Rollback conflict edit',
    );
    assert.deepEqual(
      (await request(admin, `/admin/map-revisions/${revisionId}`)).json,
      immutable.json,
    );
    assert.equal(
      (await request(admin, '/admin/map-revisions?page=1&perPage=10')).json.meta
        .total,
      11,
    );
    await js(
      anonymous,
      `(()=>{const input=document.querySelector('#viewer-token');input.value=${JSON.stringify(credentials.viewerToken)};input.closest('form').requestSubmit()})()`,
    );
    await until(
      anonymous,
      "document.querySelector('.map-viewport')?.textContent.includes('Browser E2E site')",
    );
    assert.equal(
      await js(
        anonymous,
        "document.body.innerText.includes('Simpan draft') || document.body.innerText.includes('Pilih revisi untuk rollback')",
      ),
      false,
    );
    await writeFile(
      join(directory, 'browser-e2e.png'),
      (await admin.webContents.capturePage()).toPNG(),
    );
    console.log(
      'PASS real API browser: draft/reload, validation errors, publish, immutable paginated history, two-editor 409/recovery, rollback cancel/stale/confirm, role/viewer/anonymous checks',
    );
  } catch (error) {
    failed = true;
    console.error(error);
  } finally {
    for (const win of windows) if (!win.isDestroyed()) win.destroy();
    for (const child of children.reverse()) if (!child.killed) child.kill();
    if (directory) await writeFile(join(directory, 'servers.log'), log);
    app.exit(failed ? 1 : 0);
  }
});
