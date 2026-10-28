// One local command starts the UI and reuses/starts the local ML service.
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');
const http = require('node:http');
const children = [];
function run(command,args) {
  const child=spawn(command,args,{stdio:'inherit',windowsHide:true});
  children.push(child);
  child.on('error',e=>console.error(e.message));
  return child;
}
function connected() {
  return new Promise(resolve=>{
    const r=http.get('http://127.0.0.1:8001/api/xray/health',response=>{response.resume();resolve(response.statusCode===200)});
    r.on('error',()=>resolve(false));r.setTimeout(3000,()=>{r.destroy();resolve(false)});
  });
}
let stopping=false;
function stop(code=0) { if(stopping)return;stopping=true;for(const c of children)c.kill();setTimeout(()=>process.exit(code),200); }
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
(async()=>{
  const python=resolve('ml/.venv',process.platform==='win32'?'Scripts/python.exe':'bin/python');
  if(await connected()) console.log('OSSEO: reusing the local ML server on port 8001.');
  else if(existsSync(python)) run(python,['-m','uvicorn','server:app','--app-dir','ml','--host','127.0.0.1','--port','8001','--no-access-log']);
  else console.log('OSSEO: Python environment is not installed. Atlas works; see ml/README.md to enable X-ray research.');
  const vite=run(process.execPath,[resolve('node_modules/vite/bin/vite.js'),...process.argv.slice(2)]);
  vite.on('exit',code=>stop(code??0));
})();
