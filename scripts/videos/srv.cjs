const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=require('path').resolve(__dirname,'../../dist');
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp','.pdf':'application/pdf','.ico':'image/x-icon','.mp4':'video/mp4'};
http.createServer((q,s)=>{let u=decodeURIComponent(q.url.split('?')[0]);let f=path.join(ROOT,u);
 const send=(fp)=>{s.writeHead(200,{'content-type':T[path.extname(fp)]||'application/octet-stream'});fs.createReadStream(fp).pipe(s);};
 fs.stat(f,(e,st)=>{ if(!e&&st.isFile()) return send(f); if(!e&&st.isDirectory()&&fs.existsSync(path.join(f,'index.html'))) return send(path.join(f,'index.html')); if(fs.existsSync(f+'.html')) return send(f+'.html'); send(path.join(ROOT,'index.html'));});
}).listen(4180);
