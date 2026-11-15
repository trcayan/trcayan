(() => {
  'use strict';
  const normalize = value => String(value).toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const decodeEmail = encoded => {
    if (!encoded || !/^[a-f0-9]+$/i.test(encoded) || encoded.length % 2) return null;
    const key = Number.parseInt(encoded.slice(0, 2), 16);
    const bytes = [];
    for (let offset = 2; offset < encoded.length; offset += 2) bytes.push(Number.parseInt(encoded.slice(offset, offset + 2), 16) ^ key);
    const email = new TextDecoder().decode(new Uint8Array(bytes));
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
  };
  document.querySelectorAll('[data-cfemail]').forEach(element => {
    const email = decodeEmail(element.dataset.cfemail);
    if (email) element.textContent = email;
  });
  document.querySelectorAll('a[href*="/cdn-cgi/l/email-protection#"]').forEach(link => {
    const email = decodeEmail(link.getAttribute('href').split('#')[1]);
    if (email) link.href = `mailto:${email}`;
  });
  const menu = document.querySelector('.yg-menu-button');
  const navigation = document.querySelector('.yg-navigation');
  const closeMenu = () => {
    navigation?.classList.remove('yg-open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Menüyü aç');
  };
  menu?.addEventListener('click', () => {
    const opened = navigation.classList.toggle('yg-open');
    menu.setAttribute('aria-expanded', String(opened));
    menu.setAttribute('aria-label', opened ? 'Menüyü kapat' : 'Menüyü aç');
    if (opened) navigation.querySelector('summary,a')?.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const wasOpen = navigation?.classList.contains('yg-open');
    closeMenu();
    document.querySelectorAll('.yg-mega[open]').forEach(element => element.removeAttribute('open'));
    if (wasOpen) menu?.focus();
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.yg-header')) closeMenu();
  });
  const current = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  document.querySelectorAll('.yg-navigation a').forEach(link => {
    if ((new URL(link.href).pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/') === current) link.setAttribute('aria-current', 'page');
  });
  const consent = document.querySelector('.audit-consent');
  const preferenceKey = 'yapiguc-preview-consent-v1';
  let preference = null;
  let consentFocus;
  let trackersLoaded = false;
  try { preference = localStorage.getItem(preferenceKey); } catch {}
  if (!preference) {
    try {
      const legacy = JSON.parse(localStorage.getItem('yg_cookie_consent') || 'null');
      if (legacy?.analytics === false) { preference = 'reject'; localStorage.setItem(preferenceKey, preference); }
    } catch {}
  }
  const loadTrackers = () => {
    if (trackersLoaded) return;
    trackersLoaded = true;
    const source = document.getElementById('audit-trackers');
    if (!source) return;
    let records = [];
    try { records = JSON.parse(source.textContent); } catch { return; }
    records.forEach(record => {
      const script = document.createElement('script');
      Object.entries(record.attributes || {}).forEach(([key, value]) => {
        if (!['src', 'id', 'defer', 'async'].includes(key)) script.setAttribute(key, value);
      });
      if (record.src) { script.src = record.src; script.async = true; }
      else script.textContent = record.text;
      script.dataset.optionalTracker = 'true';
      document.head.append(script);
    });
  };
  if (preference === 'accept') loadTrackers();
  if (consent && !preference && (() => {try{return JSON.parse(document.getElementById('audit-trackers')?.textContent || '[]').length>0;}catch{return false;}})()) consent.hidden = false;
  document.querySelectorAll('[data-consent-open]').forEach(button => button.addEventListener('click', () => {
    consentFocus = button;
    consent.hidden = false;
    consent.querySelector('button')?.focus();
  }));
  document.querySelectorAll('[data-consent]').forEach(button => button.addEventListener('click', () => {
    const previous = preference;
    preference = button.dataset.consent;
    try { localStorage.setItem(preferenceKey, preference); } catch {}
    if (preference === 'accept') loadTrackers();
    consent.hidden = true;
    consentFocus?.focus();
    if (previous === 'accept' && preference === 'reject') location.reload();
  }));
  document.querySelector('[data-consent-close]')?.addEventListener('click', () => {
    consent.hidden = true;
    consentFocus?.focus();
  });
  document.querySelectorAll('[data-video]').forEach(button => button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = button.dataset.video;
    frame.title = 'Kullanıcının açtığı harici medya';
    frame.loading = 'lazy';
    frame.allowFullscreen = true;
    button.replaceWith(frame);
  }));
  const articleQuery = document.getElementById('article-query');
  if (articleQuery) {
    const category = document.getElementById('article-category');
    const status = document.getElementById('article-status');
    const results = document.getElementById('article-results');
    const more = document.getElementById('article-more');
    const scope = articleQuery.closest('form').dataset.indexScope || 'editorial';
    let articles = [];
    let limit = 24;
    articleQuery.value = new URLSearchParams(location.search).get('q') || '';
    const update = () => {
      const tokens = normalize(articleQuery.value).split(' ').filter(Boolean);
      const scoped = articles.filter(article => article.kind === scope);
      const filtered = scoped.filter(article => (category.value === 'all' || article.category === category.value) && tokens.every(token => normalize(`${article.title} ${article.description}`).includes(token)));
      results.replaceChildren();
      filtered.slice(0, limit).forEach(article => {
        const card = document.createElement('article');
        card.className = 'audit-article-card';
        const label = document.createElement('span');
        label.className = 'yg-eyebrow';
        label.textContent = article.category;
        const heading = document.createElement('h2');
        const link = document.createElement('a');
        link.href = article.url;
        link.textContent = article.title;
        heading.append(link);
        card.append(label, heading);
        results.append(card);
      });
      status.textContent = `${scoped.length} içerik içinde ${filtered.length} sonuç; ${Math.min(limit, filtered.length)} gösteriliyor.${filtered.length ? '' : ' Farklı bir arama veya kategori deneyin.'}`;
      more.hidden = filtered.length <= limit;
      more.textContent = `Daha fazla göster (${Math.max(0, filtered.length - limit)} sonuç daha)`;
      const params = new URLSearchParams(location.search);
      if (articleQuery.value) params.set('q', articleQuery.value); else params.delete('q');
      history.replaceState(null, '', `${location.pathname}${params.size ? '?' + params : ''}${location.hash}`);
    };
    const reset = () => { limit = 24; update(); };
    articleQuery.addEventListener('input', reset);
    category.addEventListener('change', reset);
    articleQuery.closest('form').addEventListener('submit', event => { event.preventDefault(); reset(); });
    more.addEventListener('click', () => { limit += 24; update(); });
    fetch('/assets/content-index.json').then(response => {
      if (!response.ok) throw new Error('index unavailable');
      return response.json();
    }).then(records => { articles = records; update(); }).catch(() => { status.textContent = 'Makale dizini yüklenemedi. Sayfayı yenileyin veya JavaScript kapalı koleksiyonunu inceleyin.'; });
  }
  const galleryQuery = document.getElementById('gallery-query');
  if (galleryQuery) {
    let category = 'all';
    const cards = [...document.querySelectorAll('.photo-card')];
    const status = document.getElementById('gallery-status');
    const update = () => {
      const query = normalize(galleryQuery.value);
      let visible = 0;
      cards.forEach(card => {
        const matches = (category === 'all' || card.dataset.cat === category) && normalize(card.textContent).includes(query);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      status.textContent = `${cards.length} görselden ${visible} sonuç`;
    };
    document.querySelectorAll('.filter-btn[data-cat]').forEach(button => button.addEventListener('click', () => {
      category = button.dataset.cat;
      document.querySelectorAll('.filter-btn[data-cat]').forEach(item => {
        item.classList.toggle('active', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
      update();
    }));
    galleryQuery.addEventListener('input', update);
    const dialog = document.getElementById('audit-lightbox');
    const openPhoto = card => {
      const original = card.querySelector('img');
      dialog.querySelector('img').src = original.src;
      dialog.querySelector('img').alt = original.alt;
      dialog.querySelector('p').textContent = card.querySelector('.photo-title').textContent;
      dialog.showModal();
      dialog.querySelector('button').focus();
    };
    cards.forEach(card => {
      card.addEventListener('click', () => openPhoto(card));
      card.addEventListener('keydown', event => {
        if (['Enter', ' '].includes(event.key)) { event.preventDefault(); openPhoto(card); }
      });
    });
    dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
    update();
  }
  const form = document.querySelector('[data-whatsapp-form]');
  if (form) {
    const status = document.getElementById('offer-status');
    form.querySelector('[data-js-enable]').disabled = false;
    const params = new URLSearchParams(location.search);
    for (const [parameter, id] of [['city', 'sehir'], ['sehir', 'sehir'], ['service', 'hizmet'], ['hizmet', 'hizmet'], ['stage', 'projectStage'], ['building', 'buildingType']]) {
      const value = params.get(parameter);
      const field = document.getElementById(id);
      if (!value || !field) continue;
      let option = [...field.options].find(item => normalize(item.value) === normalize(value));
      if (!option && id === 'hizmet') { const hint=normalize(value); const aliases=[['karot','Güçlendirme Amaçlı Karot İşlemleri'],['karbon','Karbon Fiber / FRP Güçlendirme'],['frp','Karbon Fiber / FRP Güçlendirme'],['kolon','Karbon Fiber / FRP Güçlendirme'],['celik','Çelik Güçlendirme'],['temel','Temel Güçlendirme'],['tarihi','Tarihi ve Yığma Yapı Güçlendirme'],['yapi','Yapısal Güçlendirme İmalatları']]; const match=aliases.find(([key])=>hint.includes(key)); option=[...field.options].find(item=>item.value===(match?match[1]:'Güçlendirme imalatı kapsamını görüşmek istiyorum')); } else if (!option && value.length <= 100) { option = new Option(value, value); field.add(option); }
      if (option) field.value = option.value;
    }
    const phone = document.getElementById('tel');
    const validatePhone = () => {
      const digits = phone.value.replace(/\D/g, '');
      phone.setCustomValidity(/^(?:0|90)?[2-5]\d{9}$/.test(digits) ? '' : 'Geçerli bir Türkiye telefon numarası yazın (05XX XXX XX XX veya alan koduyla sabit hat).');
    };
    phone.addEventListener('input', validatePhone);
    form.addEventListener('submit', event => {
      event.preventDefault();
      validatePhone();
      if (!form.reportValidity()) { status.textContent = 'Gerekli alanları ve telefon numarasını kontrol edin.'; return; }
      const lines = ['YAPIGÜÇ iletişim talebi'];
      form.querySelectorAll('input,select,textarea').forEach(field => {
        if (!field.value.trim()) return;
        const label = form.querySelector(`label[for="${field.id}"]`)?.textContent.replace(/\s*\*$/, '') || field.name;
        lines.push(`${label}: ${field.value.trim()}`);
      });
      const contact = document.querySelector('.yg-utility a[href*="wa.me/"]');
      const url = new URL(contact.href);
      url.searchParams.set('text', lines.join('\n'));
      document.dispatchEvent(new Event('yapiguc:whatsapp-draft'));
      const popup = window.open(url.href, '_blank');
      if (popup) { popup.opener = null; status.textContent = 'WhatsApp taslağı açıldı. Mesaj henüz gönderilmedi; WhatsApp’ta kontrol edip gönder düğmesine basın.'; }
      else { status.textContent = 'Yeni pencere açılamadı. '; const link = document.createElement('a'); link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'WhatsApp taslağını aç'; status.append(link); }
    });
  }
  window.filterArt = category => {
    document.querySelectorAll('#artGrid .article-card').forEach(card => { card.hidden = category !== 'all' && card.dataset.cat !== category; });
  };
  document.querySelector('[data-yg-more]')?.addEventListener('click', event => {
    document.getElementById('artGrid')?.classList.toggle('yg-expanded');
    const expanded = document.getElementById('artGrid')?.classList.contains('yg-expanded');
    event.currentTarget.setAttribute('aria-expanded', String(expanded));
    event.currentTarget.textContent = expanded ? 'Daha az göster' : 'Tümünü göster';
  });
  const slides = [...document.querySelectorAll('.brosur-slide')];
  let brochureIndex = 0;
  const showBrochure = index => {
    if (!slides.length) return;
    brochureIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => slide.classList.toggle('active', position === brochureIndex));
    document.querySelectorAll('.brosur-dot').forEach((dot, position) => dot.classList.toggle('active', position === brochureIndex));
    const counter = document.getElementById('brosur-counter');
    if (counter) counter.textContent = `${brochureIndex + 1} / ${slides.length}`;
  };
  window.nextSlide = () => showBrochure(brochureIndex + 1);
  window.prevSlide = () => showBrochure(brochureIndex - 1);
  window.goSlide = index => showBrochure(index);
  showBrochure(0);
})();
