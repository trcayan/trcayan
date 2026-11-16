(() => {
  'use strict';
  const button = document.getElementById('eq-load');
  const status = document.getElementById('eq-status');
  const results = document.getElementById('eq-results');
  if (!button || !status || !results) return;
  const format = new Intl.DateTimeFormat('tr-TR', {timeZone:'Europe/Istanbul', dateStyle:'short', timeStyle:'medium'});
  const date = value => format.format(new Date(value));
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = 'USGS kayıtları alınıyor…';
    results.replaceChildren();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson', {signal:controller.signal, credentials:'omit', referrerPolicy:'no-referrer'});
      if (!response.ok) throw new Error('feed unavailable');
      const data = await response.json();
      const generated = data?.metadata?.generated;
      if (data.type !== 'FeatureCollection' || !Array.isArray(data.features) || !Number.isFinite(generated) || generated > Date.now() + 300000 || Date.now() - generated > 3600000) throw new Error('stale or invalid feed');
      const events = data.features.filter(f => {
        const p = f?.properties;
        return p && Number.isFinite(p.time) && p.time <= Date.now()+300000 && p.time >= Date.now()-86400000 && Number.isFinite(p.mag) && p.mag >= 4.5 && typeof p.place === 'string' && typeof p.url === 'string' && /^https:\/\/earthquake\.usgs\.gov\//.test(p.url) && Array.isArray(f.geometry?.coordinates) && Number.isFinite(f.geometry.coordinates[2]);
      }).sort((a,b) => b.properties.time-a.properties.time).slice(0,12);
      status.textContent = `Kaynak: USGS · Akış üretim zamanı: ${date(generated)} (Türkiye saati). Son 24 saatte M 4,5 ve üzeri kayıtlar; en yeni 12 olay gösterilir. İlk çözümler değişebilir.`;
      if (!events.length) {
        const empty = document.createElement('p');
        empty.textContent = 'Bu akışta görüntülenebilir güncel kayıt bulunamadı. Resmî kaynak bağlantısını kullanabilirsiniz.';
        results.append(empty);
      } else {
        const wrap=document.createElement('div');wrap.className='eq-table-wrap';
        const table=document.createElement('table');table.className='eq-table';
        const caption=document.createElement('caption');caption.textContent='USGS dünya kayıtları · Saatler Europe/Istanbul';table.append(caption);
        const head=document.createElement('thead');const hr=document.createElement('tr');
        ['Büyüklük / tür','Yer (USGS tanımı)','Zaman (TSİ)','Derinlik','Kaynak'].forEach(label=>{const th=document.createElement('th');th.scope='col';th.textContent=label;hr.append(th);});head.append(hr);table.append(head);
        const body=document.createElement('tbody');
        events.forEach(event=>{
          const p=event.properties;const row=document.createElement('tr');
          [`${p.mag.toFixed(1)} ${typeof p.magType==='string'?p.magType.toUpperCase():''}`,p.place,date(p.time),`${event.geometry.coordinates[2].toFixed(1)} km`].forEach(text=>{const td=document.createElement('td');td.textContent=text;row.append(td);});
          const td=document.createElement('td');const link=document.createElement('a');link.href=p.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='USGS ↗';td.append(link);row.append(td);body.append(row);
        });table.append(body);wrap.append(table);results.append(wrap);
      }
      button.textContent='USGS kayıtlarını yenile';
    } catch {
      status.textContent='Güncel USGS verisi alınamadı. Eski kayıt gösterilmiyor; USGS resmî kaynak bağlantısını kullanın veya yeniden deneyin.';
      button.textContent='Yeniden dene';
    } finally {
      clearTimeout(timeout);
      button.disabled=false;
    }
  });
})();
