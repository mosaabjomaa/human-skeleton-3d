const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');
const python = resolve('ml/.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
if (!existsSync(python)) {
  console.error('Create the local Python environment first. See ml/README.md.');
  process.exit(1);
}
const actions = {
  download: ['ml/download.py'],
  train: ['ml/train_yolo.py'],
  serve: ['-m','uvicorn','server:app','--app-dir','ml','--host','127.0.0.1','--port','8001','--no-access-log'],
};
const args = actions[process.argv[2]];
if (!args) process.exit(1);
const child = spawn(python, args, { stdio:'inherit' });
child.on('error', e => { console.error(e.message); process.exit(1); });
child.on('exit', code => process.exit(code ?? 1));
