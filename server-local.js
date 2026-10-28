'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 4173);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', 'Allow': 'GET, HEAD' });
    return res.end('Method Not Allowed');
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${HOST}:${PORT}`).pathname);
  } catch {
    res.writeHead(400);
    return res.end('Bad Request');
  }

  if (pathname === '/') pathname = '/index.html';
  const filePath = path.resolve(ROOT, '.' + pathname);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (statErr, stat) => {
    if (statErr || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end('Fichier introuvable');
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store'
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Le port ${PORT} est déjà utilisé. Fermez l'autre serveur NOVA ou modifiez PORT.`);
  } else {
    console.error('Erreur du serveur :', err.message);
  }
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}/`;
  console.log('NOVA Academy est lancé.');
  console.log(`Adresse : ${url}`);
  console.log('Gardez cette fenêtre ouverte pendant l’utilisation du site.');
  console.log('Pour arrêter le serveur, appuyez sur Ctrl+C.');
  try {
    const { exec } = require('node:child_process');
    const command = process.platform === 'win32' ? `start "" "${url}"` :
      process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    exec(command, () => {});
  } catch {}
});
