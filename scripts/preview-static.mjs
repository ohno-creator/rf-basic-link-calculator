import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('out');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
http.createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/rf-basic-link-calculator(?=\/|$)/, '');
    if (!pathname || pathname.endsWith('/')) pathname += 'index.html';
    let file = path.resolve(root, '.' + (pathname.startsWith('/') ? pathname : '/' + pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    if (!path.extname(file)) file = path.join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }); res.end(body);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(4173, '127.0.0.1', () => console.log('Static production preview: http://127.0.0.1:4173/rf-basic-link-calculator/'));
