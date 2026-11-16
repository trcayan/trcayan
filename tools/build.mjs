import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareReading } from './prepare-reading.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'site');
const output = path.resolve(root, 'dist');
if (path.relative(root, output) !== 'dist') throw new Error('Unexpected build directory');
await fs.access(path.join(source, 'index.html'));
await fs.rm(output, { recursive: true, force: true });
await fs.cp(source, output, { recursive: true });
await prepareReading(output);

const context = process.env.CONTEXT || 'production';
if (!['deploy-preview', 'branch-deploy'].includes(context)) {
  console.log('Production build: prepared reading layouts and metadata without preview guards.');
  process.exit(0);
}

const guard = `(() => {
  'use strict';
  const protectedForm = form => form instanceof HTMLFormElement &&
    (form.method.toLowerCase() === 'post' || form.hasAttribute('data-whatsapp-form'));
  const explain = form => {
    let status = form.querySelector('[data-preview-status]');
    if (!status) {
      status = document.createElement('p');
      status.dataset.previewStatus = '';
      status.className = 'preview-form-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      form.append(status);
    }
    status.textContent = 'Bu önizlemede form gönderilmez ve başvuru kaydı oluşturulmaz.';
    status.scrollIntoView({ block: 'nearest' });
  };
  const block = (event, form) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    explain(form);
  };
  document.addEventListener('submit', event => {
    if (protectedForm(event.target)) block(event, event.target);
  }, true);
  document.addEventListener('click', event => {
    const button = event.target.closest?.('button, input[type="submit"]');
    if (!button) return;
    const form = button.form || (button.id === 'quote-print' && document.querySelector('[data-contact-inbound="quote"]'));
    if (protectedForm(form) && (button.type === 'submit' || button.id === 'quote-print' || button.hasAttribute('data-inbound-submit'))) block(event, form);
  }, true);
  document.addEventListener('DOMContentLoaded', () => {
    const notice = document.createElement('aside');
    notice.className = 'preview-notice';
    notice.setAttribute('aria-label', 'Önizleme bilgisi');
    notice.textContent = 'Önizleme · Formlar kayıt oluşturmaz. ';
    const live = document.createElement('a');
    live.href = 'https://www.yapiguc.net/';
    live.target = '_blank';
    live.rel = 'noopener noreferrer';
    live.textContent = 'Canlı siteyi aç';
    notice.append(live);
    document.body.prepend(notice);
  }, { once: true });
})();`;
const css = `.preview-notice{padding:10px 20px;background:#182536;color:#f4ead2;text-align:center;font:14px/1.5 system-ui,sans-serif}.preview-notice a{color:#e5c889;text-decoration:underline;white-space:nowrap}.preview-form-status{padding:14px 18px;border:1px solid #ad8e4d;border-radius:8px;background:#f8f3e8;color:#263342;font:15px/1.6 system-ui,sans-serif}`;
await fs.writeFile(path.join(output, 'assets', 'preview-guard.js'), guard, 'utf8');
await fs.writeFile(path.join(output, 'assets', 'preview-guard.css'), css, 'utf8');
const existingHeaders = await fs.readFile(path.join(output, '_headers'), 'utf8').catch(error => {
  if (error.code === 'ENOENT') return '';
  throw error;
});
await fs.writeFile(path.join(output, '_headers'), `${existingHeaders}\n/*\n  X-Robots-Tag: noindex, nofollow\n`, 'utf8');
let pages = 0;
async function prepare(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await prepare(filename);
    else if (entry.isFile() && entry.name.endsWith('.html')) {
      const html = await fs.readFile(filename, 'utf8');
      if (!/<\/head\s*>/i.test(html)) continue;
      const assets = '<link rel="stylesheet" href="/assets/preview-guard.css"><script src="/assets/preview-guard.js"></script>';
      await fs.writeFile(filename, html.replace(/<\/head\s*>/i, `${assets}</head>`), 'utf8');
      pages++;
    }
  }
}
await prepare(output);
console.log(`Preview build: protected form submissions and disabled indexing on ${pages} pages.`);
