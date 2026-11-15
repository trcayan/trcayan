"""YAPIGUC static recovery preview. Reads files; never deploys or proxies APIs."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse,urllib.parse,tomllib

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
config=tomllib.loads((ROOT/'netlify.toml').read_text(encoding='utf8'))
redirects={r['from']:r for r in config.get('redirects',[]) if r.get('status') in (301,302,303,307,308) and '*' not in r.get('from','')}
for line in (SITE/'_redirects').read_text(encoding='utf8').splitlines():
 fields=line.split()
 if len(fields)>=3:redirects[fields[0]]={'to':fields[1],'status':int(fields[2].rstrip('!'))}

class Preview(SimpleHTTPRequestHandler):
 def translate_path(self,path):
  url=urllib.parse.urlsplit(path)
  clean=urllib.parse.unquote(url.path).lstrip('/')
  target=(SITE/clean).resolve()
  if not target.is_relative_to(SITE.resolve()):return str(SITE/'__invalid_path__')
  if not target.exists() and not target.suffix:
   html=target.with_suffix('.html')
   if html.is_file():return str(html)
  return str(target)
 def end_headers(self):
  self.send_header('X-Robots-Tag','noindex, nofollow')
  self.send_header('Cache-Control','no-store')
  super().end_headers()
 def do_GET(self):
  path=urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)
  if path.startswith(('/api/','/.netlify/')):
   self.send_error(503,'Server endpoints are unavailable in the local static preview');return
  rule=redirects.get(path)
  if rule and str(rule.get('to','')).startswith('/'):
   self.send_response(rule['status']);self.send_header('Location',rule['to']);self.end_headers();return
  super().do_GET()
 def do_POST(self):self.send_error(503,'Forms are not submitted from the local static preview')

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8765);args=parser.parse_args()
 server=ThreadingHTTPServer(('127.0.0.1',args.port),partial(Preview,directory=str(SITE)))
 print(f'YAPIGUC local preview: http://127.0.0.1:{args.port}/',flush=True)
 try:server.serve_forever()
 except KeyboardInterrupt:server.server_close()
