"""Reconstruct the already-reviewed local Git commit from a verified public snapshot.

This job can only create recovery/netlify-2026-11-15. It never writes master.
All content is checked against the exact local Git blob and tree identifiers.
"""
from pathlib import Path
import os,json,hashlib,urllib.request,urllib.parse,concurrent.futures as cf,time,subprocess,base64

ROOT=Path(__file__).resolve().parent
manifest=json.loads((ROOT/'manifest.json').read_text(encoding='utf8'))
assert manifest['repository']=='trcayan/trcayan'
assert manifest['target_branch']=='recovery/netlify-2026-11-15'
env=os.environ.copy()
token=env.pop('GH_TOKEN')
auth=base64.b64encode(('x-access-token:'+token).encode()).decode()
env.update(GIT_CONFIG_COUNT='1',GIT_CONFIG_KEY_0='http.https://github.com/.extraheader',GIT_CONFIG_VALUE_0='Authorization: Basic '+auth)
def git(*args,input=None,extra=None):
 run_env=env.copy()
 if extra:run_env.update(extra)
 return subprocess.run(['git',*args],input=input,env=run_env,check=True,capture_output=True).stdout.decode().strip()

def blob_sha(data):return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
downloads=Path(os.environ['RUNNER_TEMP'])/'yapiguc-recovery-downloads'
downloads.mkdir(exist_ok=True)
def download(rec):
 target=downloads/rec['sha']
 if rec.get('override'):
  data=(ROOT/rec['override']).read_bytes()
 else:
  url=manifest['source_base']+'/'+urllib.parse.quote(rec['path'].removeprefix('site/'),safe='/@-._~')
  for attempt in range(4):
   try:
    if rec['bytes']>8*1024*1024:
     chunks=[];step=4*1024*1024
     for start in range(0,rec['bytes'],step):
      end=min(rec['bytes'],start+step)-1
      with urllib.request.urlopen(urllib.request.Request(url,headers={'Range':f'bytes={start}-{end}','Accept-Encoding':'identity'}),timeout=60) as response:
       if response.status!=206 or response.headers.get('Content-Range')!=f'bytes {start}-{end}/{rec["bytes"]}':raise ValueError('Invalid byte-range response')
       chunk=response.read()
      if len(chunk)!=end-start+1:raise ValueError('Incomplete byte range')
      chunks.append(chunk)
     data=b''.join(chunks)
    else:
     with urllib.request.urlopen(urllib.request.Request(url,headers={'Accept-Encoding':'identity'}),timeout=60) as response:data=response.read()
    break
   except Exception:
    if attempt==3:raise
    time.sleep(attempt+1)
 if len(data)!=rec['bytes'] or blob_sha(data)!=rec['sha']:raise ValueError('Content verification failed: '+rec['path'])
 target.write_bytes(data)
 return rec,target

completed=[]
with cf.ThreadPoolExecutor(max_workers=10) as pool:
 for number,result in enumerate(pool.map(download,manifest['files']),1):
  completed.append(result)
  if number%100==0:print(f'Verified {number}/{len(manifest["files"])} files',flush=True)
for rec,path in completed:
 actual=git('hash-object','-w',str(path))
 assert actual==rec['sha'],rec['path']
index_env={'GIT_INDEX_FILE':str(Path(os.environ['RUNNER_TEMP'])/'yapiguc-import.index')}
git('read-tree','--empty',extra=index_env)
index=b''.join((r['mode']+' '+r['sha']+'\t'+r['path']).encode('utf8')+b'\0' for r in manifest['files'])
git('update-index','-z','--index-info',input=index,extra=index_env)
tree=git('write-tree',extra=index_env)
assert tree==manifest['tree'],(tree,manifest['tree'])
commit=git('hash-object','-t','commit','-w','--stdin',input=base64.b64decode(manifest['commit_raw_base64']))
assert commit==manifest['commit']
assert git('rev-parse',manifest['parent'])==manifest['parent']
git('push','origin',commit+':refs/heads/'+manifest['target_branch'])
remote=git('ls-remote','--heads','origin','refs/heads/'+manifest['target_branch']).split()[0]
assert remote==commit
print('RECOVERY_BRANCH_VERIFIED '+commit,flush=True)
