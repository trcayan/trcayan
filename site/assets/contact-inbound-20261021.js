(()=>{'use strict';
 const form=document.querySelector('[data-contact-inbound]');if(!form)return;
 const quote=form.dataset.contactInbound==='quote',prefix=quote?'quote-lead':'lead';
 const button=quote?document.getElementById('quote-print'):form.querySelector('[data-inbound-submit]');
 const status=document.getElementById(quote?'quote-send-status':'offer-status');
 const confirm=document.getElementById(quote?'quote-lead-confirm':'lead-confirm');
 const get=id=>document.getElementById(id)?.value.trim()||'';
 const map=quote?{name:prefix+'-name',phone:prefix+'-phone',city:prefix+'-city',district:prefix+'-district',address:prefix+'-address',building:prefix+'-building'}:{name:'lead-name',phone:'lead-phone',city:'sehir',district:'lead-district',address:'lead-address',building:'buildingType'};
 let busy=false,acceptedKey='';button.disabled=false;
 if(!quote){const params=new URLSearchParams(location.search);for(const [p,id] of [['city','sehir'],['service','hizmet'],['stage','projectStage'],['building','buildingType']]){const f=document.getElementById(id),v=params.get(p);if(!v||!f)continue;const option=[...f.options].find(o=>o.value.toLocaleLowerCase('tr-TR')===v.toLocaleLowerCase('tr-TR'));if(option)f.value=option.value}}
 function validate(){
  for(const [name,id] of Object.entries(map)){
   const f=document.getElementById(id),v=f.value.trim();let error='';
   if(!v)error='Bu alanı doldurun.';
   else if(name==='phone'&&!/^(?:0|90)?[2-5]\d{9}$/.test(v.replace(/\D/g,'')))error='Geçerli bir Türkiye telefon numarası yazın (örneğin 05XX XXX XX XX).';
   else if(name==='address'&&v.length<10)error='Yapının mahalle, cadde/sokak ve bina numarasını belirtin.';
   else if(name!=='phone'&&name!=='address'&&v.length<2)error='Lütfen bu bilgiyi tamamlayın.';
   f.setCustomValidity(error);
  }
  if(!confirm.checked)confirm.setCustomValidity('Talep gönderme seçimini işaretleyin.');else confirm.setCustomValidity('');
  return form.reportValidity();
 }
 function printQuote(){window.dispatchEvent(new Event('beforeprint'));document.body.classList.add('quote-printing');try{window.print()}finally{document.body.classList.remove('quote-printing')}}
 function payload(){const p=new URLSearchParams({'form-name':'yapiguc-iletisim-20261021',source:quote?'İşveren rehberi — gönder ve yazdır':'İletişim talebi',request_ack:'Ziyaretçi geri dönüş talep etti',website:form.querySelector('[name="website"]').value});for(const [name,id] of Object.entries(map))p.set(name,get(id));
  p.set('service',quote?'Güçlendirme teklif kapsamı görüşmesi':get('hizmet'));
  p.set('project_status',quote?'':get('projectStage'));p.set('construction_period',quote?'':get('binaYas'));p.set('floors',quote?'':get('kat'));p.set('message',quote?'':get('not'));return p;
 }
 async function send(event){event?.preventDefault();if(busy||!validate())return;
  const p=payload(),key=p.toString();if(key===acceptedKey){status.textContent='Bu bilgilerle talebiniz daha önce alındı; yeniden kayıt gönderilmedi.';if(quote)printQuote();return;}
  const reference='YG-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36));p.set('client_request_id',reference);
  busy=true;status.textContent='Bilgileriniz gönderiliyor…';const controls=[...form.querySelectorAll('input,select,textarea,button')].map(e=>[e,e.disabled]);for(const [e] of controls)e.disabled=true;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);let ok=false;
  try{const response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:p.toString(),signal:controller.signal,credentials:'same-origin'});if(!response.ok)throw Error('submission');acceptedKey=key;ok=true;status.textContent='Talebiniz alındı. YAPIGÜÇ, paylaştığınız telefon numarası üzerinden dönüş yapabilir. Bu bir fiyat teklifi veya randevu onayı değildir. Başvuru numaranız: '+reference}
  catch{status.textContent='Gönderim doğrulanamadı. Bilgileriniz bu sayfada duruyor. Tekrar göndermeden önce 0540 516 36 36 veya info@yapiguc.net üzerinden bizimle iletişime geçebilirsiniz.'}
  finally{clearTimeout(timer);busy=false;for(const [e,disabled] of controls)e.disabled=disabled;}
  if(ok&&quote)printQuote();
 }
 form.addEventListener('input',event=>{event.target.setCustomValidity?.('');if(!busy)status.textContent=''});
 form.addEventListener('change',event=>event.target.setCustomValidity?.(''));
 if(quote){button.addEventListener('click',send);form.addEventListener('submit',send);document.getElementById('quote-clear').addEventListener('click',()=>{confirm.checked=false;confirm.setCustomValidity('');acceptedKey='';status.textContent=''})}
 else form.addEventListener('submit',send);
})();
