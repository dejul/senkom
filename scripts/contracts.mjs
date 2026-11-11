import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';
import prettier from 'prettier';

const source = new URL('../docs/openapi.json', import.meta.url);
const target = new URL(
  '../packages/shared-types/api.generated.d.ts',
  import.meta.url,
);
const generated = await prettier.format(astToString(await openapiTS(source)), {
  ...(await prettier.resolveConfig(fileURLToPath(target))),
  parser: 'typescript',
});
if (process.argv.includes('--check')) {
  if ((await readFile(target, 'utf8')) !== generated) {
    throw new Error(
      'Generated contracts differ. Run npm run contracts:generate.',
    );
  }
  console.log('OpenAPI and generated TypeScript contracts match.');
} else {
  await writeFile(target, generated);
  console.log('Generated TypeScript contracts from OpenAPI 3.1.');
}
