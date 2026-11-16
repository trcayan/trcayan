"""Check that prepared reading pages preserve technical prose, IDs and source dates."""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import json,re

ROOT=Path(__file__).resolve().parents[1]
class Reading(HTMLParser):
    def __init__(self,text):
        super().__init__();self.ids=[];self.paragraphs=[];self.headings=[];self.active=None;self.buffer='';self.skip=False;self.script=None;self.data=[];self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag in ('h1','h2','p'):
            self.active=tag;self.buffer='';self.skip='yg-table-hint' in a.get('class','')
        if tag=='script' and a.get('type')=='application/ld+json':self.script=''
    def handle_data(self,data):
        if self.active:self.buffer+=data
        if self.script is not None:self.script+=data
    def handle_endtag(self,tag):
        if tag==self.active:
            text=re.sub(r'\s+',' ',self.buffer).strip()
            if not self.skip:
                if tag=='p':self.paragraphs.append(text)
                else:self.headings.append((tag,text))
            self.active=None
        if tag=='script' and self.script is not None:self.data.append(json.loads(self.script));self.script=None
def dates(data):
    found=[]
    def visit(obj):
        if isinstance(obj,list):
            for i in obj:visit(i)
        elif isinstance(obj,dict):
            for k,v in obj.items():
                if k in ['dateModified','datePublished']:found.append((k,v))
                elif isinstance(v,(dict,list)):visit(v)
    visit(data);return Counter(found)
count=0
for p in (ROOT/'dist').rglob('*.html'):
    text=p.read_text(encoding='utf8')
    if 'reading-20261116.css' not in text:continue
    old=Reading((ROOT/'site'/p.relative_to(ROOT/'dist')).read_text(encoding='utf8'));new=Reading(text)
    assert old.paragraphs==new.paragraphs,('Paragraph changed',str(p))
    assert old.headings==new.headings,('Heading changed',str(p))
    assert not set(old.ids)-set(new.ids),('Lost anchor',str(p))
    assert dates(old.data)==dates(new.data),('Source date changed',str(p))
    count+=1
print(json.dumps({'prepared_pages':count,'original_paragraphs_headings_and_ids':'preserved','published_and_review_dates':'preserved'}))
