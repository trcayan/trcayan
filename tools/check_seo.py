"""Validate recovered static SEO metadata and canonical sitemap coverage (stdlib only)."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from xml.etree import ElementTree as ET
import json

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
BASE = 'https://www.yapiguc.net'
NS = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.title = ''; self.in_title = False; self.meta = {}; self.canonical = []
        self.json_blocks = []; self.json_text = None; self.lang = ''; self.h1 = 0
        self.reviewed = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html': self.lang = a.get('lang', '')
        if tag == 'title': self.in_title = True
        if tag == 'h1': self.h1 += 1
        if tag == 'main': self.reviewed = bool({'yg-service-page', 'yg-media-page'} & set(a.get('class', '').split()))
        if tag == 'meta': self.meta[a.get('name') or a.get('property')] = a.get('content', '')
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical.append(a.get('href'))
        if tag == 'script' and a.get('type') == 'application/ld+json': self.json_text = ''

    def handle_data(self, text):
        if self.in_title: self.title += text
        if self.json_text is not None: self.json_text += text

    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
        if tag == 'script' and self.json_text is not None:
            self.json_blocks.append(json.loads(self.json_text)); self.json_text = None

pages = {p.relative_to(SITE).as_posix(): Page(p.read_text(encoding='utf8')) for p in SITE.rglob('*.html')}

def source(url):
    path = unquote(urlsplit(url).path).lstrip('/')
    for candidate in [path, path + '.html', path.rstrip('/') + '/index.html' if path else 'index.html']:
        if candidate in pages: return pages[candidate]
    return None

rewrites = {}
for line in (SITE / '_redirects').read_text(encoding='utf8').splitlines():
    fields = line.split()
    if len(fields) >= 3 and fields[2] == '200': rewrites[fields[0]] = fields[1]

for path, page in pages.items():
    # Search-engine ownership verification is a token document, not a content page.
    if path.startswith('yandex_'): continue
    assert page.title.strip() and page.meta.get('description') and page.lang, path
    assert len(page.canonical) == 1 and page.canonical[0].startswith(BASE + '/'), path
    if page.reviewed:
        assert page.h1 == 1, path
        assert all(page.meta.get(p) for p in ['og:title', 'og:description', 'og:url', 'og:image']), path
    for key in ['og:image', 'twitter:image']:
        image = page.meta.get(key, '')
        if urlsplit(image).hostname in ['www.yapiguc.net', 'yapiguc.net']:
            asset = unquote(urlsplit(image).path)
            asset = rewrites.get(asset, asset)
            assert (SITE / asset.lstrip('/')).is_file(), (path, image)

all_sitemaps = {}
for path in SITE.glob('*sitemap*.xml'):
    root = ET.parse(path).getroot()
    urls = [e.text for e in root.findall('s:url/s:loc', NS)]
    assert len(urls) == len(set(urls)), path.name
    for url in urls:
        page = source(url)
        assert page and page.canonical == [url], (path.name, url)
        assert 'noindex' not in page.meta.get('robots', ''), (path.name, url)
    all_sitemaps[path.name] = urls

primary = []
for loc in ET.parse(SITE / 'sitemap.xml').findall('s:sitemap/s:loc', NS):
    name = urlsplit(loc.text).path.lstrip('/')
    assert name in all_sitemaps, name
    if name != 'sitemap-videos.xml': primary.extend(all_sitemaps[name])
assert len(primary) == len(set(primary)), 'Canonical URL duplicated between primary sitemaps'
indexable = {p.canonical[0] for p in pages.values() if p.canonical and 'noindex' not in p.meta.get('robots', '')}
assert set(primary) == indexable, sorted(indexable - set(primary))
assert 'Sitemap: ' + BASE + '/sitemap.xml' in (SITE / 'robots.txt').read_text(encoding='utf8')
print(json.dumps({'html_pages': len(pages), 'canonical_urls': len(indexable), 'xml_sitemaps': len(all_sitemaps), 'reviewed_service_media_pages': sum(p.reviewed for p in pages.values()), 'missing_or_duplicate_sitemap_urls': 0, 'metadata_and_jsonld': 'passed', 'local_sharing_images': 'passed'}))
