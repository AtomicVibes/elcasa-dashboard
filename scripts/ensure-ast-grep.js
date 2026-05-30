const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BINDING_NAME = '@ast-grep/napi-linux-x64-gnu';
const BINDING_VERSION = '0.40.5';
const TARGET_DIR = path.join(__dirname, '..', 'node_modules', BINDING_NAME);

function ensureBinding() {
  if (fs.existsSync(TARGET_DIR)) {
    return;
  }

  if (process.platform !== 'linux' || process.arch !== 'x64') {
    return;
  }

  console.log(`[ensure-ast-grep] ${BINDING_NAME} not found, installing...`);

  fs.mkdirSync(TARGET_DIR, { recursive: true });

  const result = execSync(`npm pack ${BINDING_NAME}@${BINDING_VERSION} --pack-destination "${TARGET_DIR}"`, {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8',
    timeout: 60000,
    shell: true,
  });

  const tarball = path.join(TARGET_DIR, result.trim());

  if (!fs.existsSync(tarball)) {
    throw new Error(`Downloaded tarball not found: ${tarball}`);
  }

  execSync(`tar -xzf "${tarball}" -C "${TARGET_DIR}" --strip-components=1`, {
    timeout: 30000,
    shell: true,
  });

  fs.unlinkSync(tarball);

  console.log(`[ensure-ast-grep] Successfully installed ${BINDING_NAME}@${BINDING_VERSION}`);
}

ensureBinding();
