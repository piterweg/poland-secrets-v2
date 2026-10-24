#!/usr/bin/env node
/**
 * Minimalny serwer statyczny do lokalnego podglądu — zero zależności.
 *
 *   npm run dev            → http://localhost:8080
 *   npm run dev -- 3000    → http://localhost:3000
 *
 * Serwuje katalog repo tak, jak hosting: z poprawnymi typami MIME,
 * /index.html dla /, własną stroną 404 i blokadą wyjścia poza katalog.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = __dirname;
const PORT = Number(process.argv[2] || process.env.PORT || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf'
};

function send(res, status, body, type) {
  res.writeHead(status, {
    'Content-Type': type || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(url.parse(req.url).pathname);
  } catch (e) {
    return send(res, 400, 'Nieprawidłowy adres');
  }

  if (pathname.endsWith('/')) pathname += 'index.html';

  const filePath = path.join(ROOT, pathname);
  // Blokada wyjścia poza katalog repo
  if (!filePath.startsWith(ROOT + path.sep)) {
    return send(res, 403, 'Dostęp zabroniony');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      const notFound = path.join(ROOT, '404.html');
      if (fs.existsSync(notFound)) {
        return send(res, 404, fs.readFileSync(notFound), MIME['.html']);
      }
      return send(res, 404, 'Nie znaleziono: ' + pathname);
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} jest zajęty. Uruchom: npm run dev -- ${PORT + 1}`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Podgląd lokalny: http://localhost:${PORT}`);
  console.log(`  Katalog:          ${ROOT}`);
  console.log('  Zatrzymanie:      Ctrl+C\n');
});
