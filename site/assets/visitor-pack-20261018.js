(()=>{'use strict';
const compare=document.getElementById('quote-comparison');
if(compare){
 const status=document.getElementById('quote-result'),fields=[...compare.querySelectorAll('[data-quote-field]')],rows=[...compare.querySelectorAll('[data-quote-row]')];
 function update(){let missingA=0,missingB=0,different=0;for(const row of rows){const a=row.querySelector('[data-offer="a"]').value,b=row.querySelector('[data-offer="b"]').value;if(a==='unknown')missingA++;if(b==='unknown')missingB++;if(a!=='unknown'&&b!=='unknown'&&a!==b)different++;row.dataset.different=String(a!=='unknown'&&b!=='unknown'&&a!==b)}
  status.replaceChildren();for(const text of ['Teklif A: '+missingA+' kalem belirtilmemiş.','Teklif B: '+missingB+' kalem belirtilmemiş.',different+' kalemde belirtilen kapsam farklı.']){const p=document.createElement('p');p.textContent=text;status.append(p)}
  const taxA=document.getElementById('quote-tax-a').value,taxB=document.getElementById('quote-tax-b').value,currency=document.getElementById('quote-currency').value;const note=document.createElement('p');note.textContent=currency==='different'?'Para birimleri farklı: tutarları doğrudan karşılaştırmayın.':taxA==='unknown'||taxB==='unknown'||taxA!==taxB?'Vergi kapsamı aynı veya açık değil: toplam tutarları aynı esasla netleştirin.':'Vergi seçimi eşleşiyor; fiyat değerlendirmesinde iş kapsamını ve miktarları ayrıca karşılaştırın.';status.append(note);
  for(const field of fields){const target=compare.querySelector('[data-print-for="'+field.id+'"]');if(target)target.textContent=field.tagName==='SELECT'?(field.options[field.selectedIndex]?.textContent||field.value):(field.value.trim()||'Belirtilmedi')}
 }
 compare.querySelector('form').addEventListener('submit',e=>e.preventDefault());fields.forEach(f=>{f.addEventListener('input',update);f.addEventListener('change',update)});
 document.getElementById('quote-clear').addEventListener('click',()=>{fields.forEach(f=>f.value=f.dataset.default||'');update()});
 // Printing follows the required contact form submission in contact-inbound.
 window.addEventListener('afterprint',()=>document.body.classList.remove('quote-printing'));update();
}
const gallery=document.getElementById('archive-filters');
if(gallery){const project=document.getElementById('archive-project'),stage=document.getElementById('archive-stage'),items=[...document.querySelectorAll('[data-archive-item]')],status=document.getElementById('archive-result');function filter(){let n=0;items.forEach(item=>{const show=(project.value==='all'||item.dataset.project===project.value)&&(stage.value==='all'||item.dataset.stage===stage.value);item.hidden=!show;if(show)n++});status.textContent=n+' fotoğraf gösteriliyor.';document.getElementById('archive-empty').hidden=n>0}project.addEventListener('change',filter);stage.addEventListener('change',filter);document.getElementById('archive-clear').addEventListener('click',()=>{project.value='all';stage.value='all';filter()});filter()}
})();
