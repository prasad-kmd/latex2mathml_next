import fs from 'node:fs';
fs.rmSync('resources', { recursive: true, force: true });
fs.cpSync('out', 'resources', { recursive: true });
// Neutralino serves this virtual script; load it before Next.js hydration.
// Keep it out of the browser export, where this URL does not exist.
const entry = 'resources/index.html';
const html = fs.readFileSync(entry, 'utf8');
fs.writeFileSync(entry, html.replace('<head>', '<head><script src="/__neutralino_globals.js"></script>'));
console.log('Copied static Next.js export into resources/.');
