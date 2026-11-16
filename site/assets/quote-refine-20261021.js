(()=>{'use strict';
 const section=document.getElementById('quote-comparison');if(!section)return;
 const fields=[...section.querySelectorAll('[data-quote-field]')];
 const value=id=>document.getElementById(id).value.trim();
 const label=id=>{const f=document.getElementById(id);return f.options[f.selectedIndex]?.textContent||f.value};
 const clean=text=>String(text).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,'').trim();
 function snapshot(){for(const f of fields){const out=section.querySelector('[data-print-for="'+f.id+'"]');if(out)out.textContent=f.tagName==='SELECT'?label(f.id):(f.value.trim()||'Belirtilmedi')}}
 window.addEventListener('beforeprint',snapshot);
 function questionText(){
  const lines=['YAPIGÜÇ — TEKLİF KAPSAMI SORU LİSTESİ','Bu liste bir teklif, teknik uygunluk değerlendirmesi veya firma tavsiyesi değildir.','',
   'Teklif A: '+clean(value('quote-name-a')||'Birinci teklif'),
   'Teklif B: '+clean(value('quote-name-b')||'İkinci teklif'),
   'Proje / kapsam notu: '+clean(value('quote-project')||'Belirtilmedi'),
   'Para birimi: '+label('quote-currency'),
   'Teklif A tutarı: '+(value('quote-amount-a')||'Belirtilmedi')+' | '+label('quote-tax-a'),
   'Teklif B tutarı: '+(value('quote-amount-b')||'Belirtilmedi')+' | '+label('quote-tax-b'),'','YAZILI OLARAK NETLEŞTİRİLECEK BAŞLIKLAR'];
  let count=0;
  for(const row of section.querySelectorAll('[data-quote-row]')){
   const title=row.querySelector('th').textContent.trim();
   const a=row.querySelector('[data-offer="a"]').value,b=row.querySelector('[data-offer="b"]').value;
   for(const [name,v] of [['A',a],['B',b]]){
    if(v==='unknown'){lines.push('• Teklif '+name+' — '+title+': Bu iş dahil mi, hariç mi? Miktar, teknik özellik ve sorumluluk sınırı nedir?');count++}
    if(v==='separate'){lines.push('• Teklif '+name+' — '+title+': Ayrı bedelin tutarı, miktar dayanağı ve dahil olduğu toplamı yazılı olarak belirtir misiniz?');count++}
   }
   if(a!=='unknown'&&b!=='unknown'&&a!==b){lines.push('• '+title+': İki teklifte kapsam farklı. Karşılaştırma öncesinde dahil ve hariç işleri aynı esasla netleştirin.');count++}
  }
  if(!count)lines.push('Seçimlere göre belirtilmemiş, ayrı bedelli veya farklı iş kalemi yok. Bu, teknik kapsamların eşdeğer olduğunu göstermez.');
  if(value('quote-currency')==='different')lines.push('• Para birimleri farklı veya açık değil. Aynı para birimi ve tarih esasını yazılı olarak netleştirin.');
  if(value('quote-tax-a')==='unknown'||value('quote-tax-b')==='unknown'||value('quote-tax-a')!==value('quote-tax-b'))lines.push('• Vergi kapsamı aynı veya açık değil. Vergi dahil toplamları ve uygulanacak vergileri teklif sahipleriyle netleştirin.');
  lines.push('','HER İKİ TEKLİF İÇİN ORTAK SORULAR','• Miktarlar ve malzeme özellikleri hangi proje, çizim veya metraja dayanıyor?','• Geçici işler, çalışma alanına erişim, yüzey hazırlığı ve atık uzaklaştırma kimin kapsamında?','• İş programı, ödeme aşamaları, kapsam değişiklikleri ve teslim kayıtları nasıl tanımlanıyor?','','Listeyi göndermeden önce kontrol edin. İndirdiğiniz dosya girdiğiniz not ve tutarları içerir; paylaşım kararını siz verirsiniz.','Proje ve uygulama kapsamını görüşmek için: https://www.yapiguc.net/teklif-al','YAPIGÜÇ: 0540 516 36 36');
  return lines.join('\r\n');
 }
 document.getElementById('quote-questions').addEventListener('click',()=>{
  const status=document.getElementById('quote-download-status');let url;
  try{const blob=new Blob(['\ufeff'+questionText()],{type:'text/plain;charset=utf-8'});url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='yapiguc-teklif-kapsami-sorulari.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent='Soru dosyası indirme için hazırlandı. Dosya, girdiğiniz not ve tutarları içerir; kimseye otomatik gönderilmez.'}
  catch{if(url)URL.revokeObjectURL(url);status.textContent='Dosya hazırlanamadı. Bilgilerinizi yazdır / PDF olarak kaydet seçeneğiyle alabilirsiniz.'}
 });
 document.getElementById('quote-clear').addEventListener('click',()=>{document.getElementById('quote-download-status').textContent=''});
})();
