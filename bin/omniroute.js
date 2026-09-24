#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { exec } = require('child_process');
const { URL } = require('url');

const pkg = require('../package.json');

const DIST_DIR = path.join(__dirname, '..', 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

function printHelp() {
  console.log(`
omniroute v${pkg.version} - serve the OmniTools web app locally

Usage: omniroute [options]

Options:
  -p, --port <port>   Port to listen on (default: 8080, or $PORT)
  -H, --host <host>   Host to bind to (default: localhost)
  -o, --open          Open the app in your default browser
  -v, --version       Print the version number
  -h, --help          Show this help message
`);
}

function parseArgs(argv) {
  const options = {
    port: process.env.PORT || 8080,
    host: 'localhost',
    open: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '-p':
      case '--port':
        options.port = argv[++i];
        break;
      case '-H':
      case '--host':
        options.host = argv[++i];
        break;
      case '-o':
      case '--open':
        options.open = true;
        break;
      case '-v':
      case '--version':
        console.log(pkg.version);
        process.exit(0);
        break;
      case '-h':
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  return options;
}

function openBrowser(url) {
  const command =
    process.platform === 'darwin'
      ? `open "${url}"`
      : process.platform === 'win32'
        ? `start "" "${url}"`
        : `xdg-open "${url}"`;

  exec(command, () => {
    // Best-effort only; failing to auto-open the browser isn't fatal.
  });
}

function safeJoin(rootDir, requestPath) {
  const decoded = decodeURIComponent(requestPath.split('?')[0].split('#')[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const resolved = path.join(rootDir, normalized);

  if (resolved !== rootDir && !resolved.startsWith(rootDir + path.sep)) {
    return null;
  }
  return resolved;
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream'
    });
    res.end(data);
  });
}

function handleRequest(req, res) {
  let parsedUrl;
  try {
    parsedUrl = new URL(req.url, 'http://localhost');
  } catch {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  const requestPath =
    parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
  const filePath = safeJoin(DIST_DIR, requestPath);

  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(res, filePath);
      return;
    }

    if (!err && stats.isDirectory()) {
      sendFile(res, path.join(filePath, 'index.html'));
      return;
    }

    // No file at this path. Client-side routes (e.g. /some-tool) have no
    // extension, so fall back to index.html and let the app's router handle it,
    // mirroring the try_files rule the Docker/nginx setup uses.
    if (path.extname(requestPath) === '') {
      sendFile(res, path.join(DIST_DIR, 'index.html'));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const port = Number(options.port);

  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    console.error(`Invalid port: ${options.port}`);
    process.exit(1);
  }

  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    console.error(
      `Could not find a build at "${DIST_DIR}".\n` +
        'If you are running from a source checkout, build it first with "npm run build".'
    );
    process.exit(1);
  }

  const server = http.createServer(handleRequest);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${port} is already in use. Try a different one with --port.`
      );
    } else {
      console.error(`Failed to start server: ${err.message}`);
    }
    process.exit(1);
  });

  server.listen(port, options.host, () => {
    const url = `http://${options.host}:${server.address().port}`;
    console.log(`OmniTools is running at ${url}`);
    console.log('Press Ctrl+C to stop.');
    if (options.open) {
      openBrowser(url);
    }
  });

  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();
