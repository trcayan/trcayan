(() => {
  'use strict';
  const form=document.getElementById('preparation-form');
  if(!form)return;
  const lists={ready:['Projenin kapsamını, revizyon ve onay durumunu görüşün.','İmalat miktarları, dahil ve hariç işler ile çalışma alanını netleştirin.','Erişim, geçici destekler, iş programı ve kalite kayıtlarını konuşun.'],design:['Mevcut proje ve inceleme belgelerinin bulunup bulunmadığını belirtin.','Proje hazırlığı, üniversite değerlendirme/onay takibi ve tasarım gözetmenliği ihtiyacınızı belirtin.','Projedeki imalat kapsamı netleştiğinde teklif için gerekli ayrıntıları konuşun.'],unsure:['Şehir ve yapı kullanımını belirterek ihtiyacınızı açıklayın.','Güçlendirme projesi hazırlanması için mevcut belge durumunu ve ihtiyacınızı konuşun.','İmalatın proje üzerinden netleşeceğini dikkate alın; fotoğraftan güvenlik sonucu beklemeyin.']};
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const stage=document.getElementById('prep-stage'),building=document.getElementById('prep-building');
    const list=document.getElementById('preparation-list');list.replaceChildren();
    for(const text of lists[stage.value]){const item=document.createElement('li');item.textContent=text;list.append(item);}
    const url=new URL('/teklif-al',location.origin);url.searchParams.set('stage',stage.selectedOptions[0].textContent);url.searchParams.set('building',building.value);document.getElementById('preparation-next').href=url.pathname+url.search;
  });
})();
