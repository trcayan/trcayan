import fs from 'node:fs/promises';
import path from 'node:path';

const base = 'https://www.yapiguc.net';
const hubFiles = new Set(['blog/index.html', 'teknik-rehberler.html', 'teknik-kutuphane.html', 'guclendirme-uygulama-rehberi.html']);
const decode = text => text.replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n))).replace(/&(amp|quot|apos|lt|gt|nbsp);/g, (_, n) => ({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' '})[n]);
const plain = text => decode(text.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const escape = text => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (tag, name) => decode(tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'))?.[2] || '');
const appendClass = (tag, name) => /\bclass\s*=/i.test(tag) ? tag.replace(/\bclass\s*=\s*(["'])(.*?)\1/i, (_, q, classes) => `class=${q}${classes} ${name}${q}`) : tag.replace(/>$/, ` class="${name}">`);

export async function prepareReading(output) {
  const stats = { pages:0, articles:0, collapsedContents:0, tables:0, phoneLabels:0, breadcrumbs:0, structuredArticles:0 };
  async function walk(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes:true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) { await walk(filename); continue; }
      const relative = path.relative(output, filename).replaceAll(path.sep, '/');
      if (!entry.name.endsWith('.html') || !(relative.startsWith('blog/') || hubFiles.has(relative))) continue;
      let source = await fs.readFile(filename, 'utf8');
      const canonicalTag = [...source.matchAll(/<link\b[^>]*>/gi)].find(m => attr(m[0], 'rel') === 'canonical')?.[0];
      const canonical = attr(canonicalTag || '', 'href');
      const descriptionTag = [...source.matchAll(/<meta\b[^>]*>/gi)].find(m => attr(m[0], 'name') === 'description')?.[0];
      const description = attr(descriptionTag || '', 'content');
      const title = plain(source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
      const mainMatch = source.match(/<main\b[^>]*>[\s\S]*?<\/main>/i);
      if (!mainMatch || !canonical.startsWith(base + '/')) continue;
      const isHub = hubFiles.has(relative) || relative.startsWith('blog/konular/');
      let main = mainMatch[0].replace(/<main\b[^>]*>/i, tag => appendClass(tag, isHub ? 'yg-reading-hub' : 'yg-reading-page'));
      const heading = plain(main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || title);
      if (!isHub) {
        stats.articles++;
        // Keep local-service labels, technical prose, source dates and original IDs.
        const breadcrumb = `<nav class="yg-reading-path" aria-label="İçerik yolu"><a href="/">Ana sayfa</a><span aria-hidden="true"> / </span><a href="/blog/">Blog ve rehberler</a><span aria-hidden="true"> / </span><span aria-current="page">${escape(heading)}</span></nav>`;
        main = main.replace(/<main\b[^>]*>/i, tag => tag + breadcrumb);
        main = main.replace(/<a\b[^>]*href\s*=\s*(["'])tel:([^"']+)\1[^>]*>\s*<\/a>/gi, (whole, q, phone) => {
          if (/aria-label\s*=/i.test(whole)) return whole;
          stats.phoneLabels++;
          return whole.replace(/>\s*<\/a>$/, `>${escape(phone === '+905405163636' ? '0540 516 36 36 · Arayın' : phone + ' · Arayın')}</a>`);
        });
        // Existing contents lists are kept intact, with a native disclosure on every screen.
        main = main.replace(/<nav\b([^>]*class\s*=\s*(["'])[^"']*\btoc\b[^"']*\2[^>]*)>([\s\S]*?)<\/nav>/gi, (whole, attributes, q, content) => {
          stats.collapsedContents++;
          content = content.replace(/^\s*<(?:strong|h[2-6])\b[^>]*>[\s\S]*?<\/(?:strong|h[2-6])>\s*/i, '');
          return `<details class="yg-reading-toc"><summary>Bu yazıda · İçindekiler</summary>${content}</details>`;
        });
        // A wrapper preserves native table semantics and allows keyboard scrolling.
        let table = 0;
        main = main.replace(/<table\b[\s\S]*?<\/table>/gi, content => {
          table++; stats.tables++;
          return `<div class="yg-reading-table" role="region" tabindex="0" aria-label="Tablo ${table}; yatay kaydırılabilir">${content}</div><p class="yg-table-hint">Tabloyu yatay kaydırarak inceleyebilirsiniz.</p>`;
        });
        source = source.replace(mainMatch[0], () => main);
        const samePage = value => {
          if (typeof value !== 'string') return false;
          try { const u = new URL(value); return !u.hash && ['www.yapiguc.net','yapiguc.net'].includes(u.hostname) && u.pathname.replace(/\.html$/, '').replace(/\/$/,'') === new URL(canonical).pathname.replace(/\/$/,''); } catch { return false; }
        };
        source = source.replace(/<script\b([^>]*type\s*=\s*(["'])application\/ld\+json\2[^>]*)>([\s\S]*?)<\/script>/gi, (whole, attributes, q, text) => {
          const data = JSON.parse(text);
          const visit = item => {
            if (!item || typeof item !== 'object') return;
            if (Array.isArray(item)) { item.forEach(visit); return; }
            if (item['@graph']) visit(item['@graph']);
            if (['Article','BlogPosting'].includes(item['@type'])) {
              item.headline = heading; item.description = description;
              item.url = canonical; item.mainEntityOfPage = {'@type':'WebPage','@id':canonical};
              item.inLanguage ||= 'tr'; stats.structuredArticles++;
            }
            for (const key of ['url','@id','mainEntityOfPage']) {
              if (samePage(item[key])) item[key] = canonical;
              if (key === 'mainEntityOfPage' && samePage(item[key]?.['@id'])) item[key]['@id'] = canonical;
            }
          };
          visit(data);
          return `<script${attributes}>${JSON.stringify(data)}</script>`;
        });
        const breadcrumbData = {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[['Ana sayfa',base+'/'],['Blog ve rehberler',base+'/blog/'],[heading,canonical]].map(([name,item],i)=>({'@type':'ListItem',position:i+1,name,item}))};
        // Replace old breadcrumb blocks, including graph entries, without duplicating schemas.
        source = source.replace(/<script\b([^>]*type\s*=\s*(["'])application\/ld\+json\2[^>]*)>([\s\S]*?)<\/script>/gi, (whole, attributes, q, text) => {
          const data = JSON.parse(text);
          if (data['@type'] === 'BreadcrumbList') return '';
          if (data['@graph']) data['@graph'] = data['@graph'].filter(item => item['@type'] !== 'BreadcrumbList');
          return `<script${attributes}>${JSON.stringify(data)}</script>`;
        });
        source = source.replace(/<\/head\s*>/i, () => `<script type="application/ld+json">${JSON.stringify(breadcrumbData)}</script></head>`);
        stats.breadcrumbs++;
      }
      if (isHub) source = source.replace(mainMatch[0], () => main);
      // Sharing text follows the actual page title and description; canonical remains the live URL.
      const sharing = new Map([['og:title',title],['og:description',description],['og:url',canonical],['twitter:title',title],['twitter:description',description]]);
      if (![...source.matchAll(/<meta\b[^>]*>/gi)].some(m => attr(m[0], 'property') === 'og:image')) sharing.set('og:image', base + '/assets/yapiguc-logo-original.png');
      source = source.replace(/<meta\b[^>]*>/gi, tag => {
        const key = attr(tag,'property') || attr(tag,'name');
        if (!sharing.has(key)) return tag;
        const value = sharing.get(key); sharing.delete(key);
        return tag.replace(/\bcontent\s*=\s*(["'])([\s\S]*?)\1/i, () => `content="${escape(value)}"`);
      });
      const missing = [...sharing].map(([key,value])=>`<meta ${key.startsWith('og:')?'property':'name'}="${key}" content="${escape(value)}">`).join('');
      source = source.replace(/<\/head\s*>/i, () => `${missing}<link rel="stylesheet" href="/assets/reading-20261116.css"></head>`);
      await fs.writeFile(filename, source, 'utf8'); stats.pages++;
    }
  }
  await walk(output);
  console.log(`Reading preparation: ${JSON.stringify(stats)}`);
  return stats;
}
