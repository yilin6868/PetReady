const http = require('http');
const fs = require('fs');
const path = require('path');
const { questions, chapters, breeds } = require('./lib/data');
const { assess } = require('./lib/engine');

const publicDir = path.join(__dirname, 'public');
const port = Number(process.env._FAAS_RUNTIME_PORT || process.env.PORT || 4173);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml' };
const send = (res,status,data,type='application/json; charset=utf-8') => { res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'}); res.end(type.startsWith('application/json')?JSON.stringify(data):data); };

const server=http.createServer((req,res)=>{
  const url=new URL(req.url,`http://${req.headers.host}`);
  if(req.method==='GET'&&url.pathname==='/api/questions') return send(res,200,{questions,chapters});
  if(req.method==='GET'&&url.pathname==='/api/breeds') return send(res,200,{breeds});
  if(req.method==='POST'&&url.pathname==='/api/assess'){
    let body=''; req.on('data',c=>{ body+=c; if(body.length>200000) req.destroy(); });
    return req.on('end',()=>{ try { const {answers}=JSON.parse(body||'{}'); const missing=questions.filter(q=>!answers?.[q.id]).map(q=>q.id); if(missing.length) return send(res,400,{error:'请完成全部必答题',missing}); send(res,200,assess(answers)); } catch(e){ send(res,400,{error:'请求数据无效'}); } });
  }
  if(req.method!=='GET') return send(res,405,{error:'Method not allowed'});
  let file=path.join(publicDir,decodeURIComponent(url.pathname));
  if(url.pathname==='/'||!path.extname(file)) file=path.join(publicDir,'index.html');
  if(!file.startsWith(publicDir)) return send(res,403,'Forbidden','text/plain');
  fs.readFile(file,(err,data)=>{ if(err){ if(path.extname(file)) return send(res,404,'Not found','text/plain'); return fs.readFile(path.join(publicDir,'index.html'),(e,d)=>send(res,e?500:200,e?'Server error':d,'text/html; charset=utf-8')); } send(res,200,data,types[path.extname(file)]||'application/octet-stream'); });
});
server.listen(port,'0.0.0.0',()=>console.log(`PetReady running on port ${port}`));
